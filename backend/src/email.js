/**
 * 邮件发送工具
 * 支持通过第三方邮件服务 API 发送邮件
 */

/**
 * 发送邮件（使用 Resend API 或其他邮件服务）
 */
export async function sendEmail(env, options) {
  const { to, subject, html, text } = options;
  
  // 从环境变量或系统配置获取邮件服务配置
  const emailService = env.EMAIL_SERVICE || 'resend'; // resend, sendgrid, mailgun 等
  let apiKey = env.EMAIL_API_KEY || '';
  let fromEmail = env.EMAIL_FROM || 'noreply@fashionstore.com';
  
  // 如果没有配置 API Key，尝试从系统配置获取
  if (!apiKey && env.DB) {
    try {
      const emailConfig = await env.DB.prepare('SELECT config_value FROM system_configs WHERE config_key = ?').bind('email_api_key').first();
      if (emailConfig) {
        apiKey = emailConfig.config_value;
      }
      
      const fromConfig = await env.DB.prepare('SELECT config_value FROM system_configs WHERE config_key = ?').bind('email_from').first();
      if (fromConfig) {
        fromEmail = fromConfig.config_value;
      }
    } catch (error) {
      console.warn('Failed to load email config from database:', error);
    }
  }
  
  if (!apiKey) {
    console.warn('Email API key not configured. Email will not be sent.', {
      emailService,
      hasEnvApiKey: !!env.EMAIL_API_KEY,
      hasDB: !!env.DB
    });
    return { success: false, error: 'Email service not configured: API key is missing' };
  }
  
  console.log('Sending email:', {
    service: emailService,
    from: fromEmail,
    to: to,
    subject: subject
  });
  
  try {
    let response;
    
    // 使用 Resend API（推荐）
    if (emailService === 'resend' || !emailService) {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html || text,
          text: text || html?.replace(/<[^>]*>/g, ''),
        }),
      });
    }
    // 使用 SendGrid API
    else if (emailService === 'sendgrid') {
      response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
          }],
          from: { email: fromEmail },
          subject: subject,
          content: [
            {
              type: 'text/html',
              value: html || text,
            },
          ],
        }),
      });
    }
    // 使用 Mailgun API
    else if (emailService === 'mailgun') {
      const mailgunDomain = env.MAILGUN_DOMAIN || '';
      response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          from: fromEmail,
          to: Array.isArray(to) ? to.join(',') : to,
          subject: subject,
          html: html || text,
          text: text || html?.replace(/<[^>]*>/g, ''),
        }),
      });
    }
    else {
      return { success: false, error: `Unsupported email service: ${emailService}` };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      console.error('Email service error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        from: fromEmail,
        to: to,
        service: emailService
      });
      return { 
        success: false, 
        error: `Email service returned ${response.status}: ${errorData.message || errorText}`,
        details: errorData
      };
    }
    
    const result = await response.json().catch(() => ({}));
    console.log('Email sent successfully:', {
      id: result.id || result.message_id,
      from: fromEmail,
      to: to,
      service: emailService
    });
    return { success: true, id: result.id || result.message_id };
  } catch (error) {
    console.error('Error sending email:', {
      error: error.message,
      stack: error.stack,
      from: fromEmail,
      to: to,
      service: emailService
    });
    return { success: false, error: error.message };
  }
}

/**
 * 发送订阅通知邮件给管理员
 */
export async function sendSubscriptionNotification(env, subscriberEmail, source = 'website') {
  // 获取管理员邮箱（从系统配置或环境变量）
  let adminEmail = env.ADMIN_EMAIL || '';
  
  if (!adminEmail && env.DB) {
    try {
      const config = await env.DB.prepare('SELECT config_value FROM system_configs WHERE config_key = ?').bind('admin_email').first();
      if (config) {
        adminEmail = config.config_value;
      }
    } catch (error) {
      console.warn('Failed to load admin email from database:', error);
    }
  }
  
  if (!adminEmail) {
    console.warn('Admin email not configured. Notification will not be sent.', {
      hasEnvAdminEmail: !!env.ADMIN_EMAIL,
      hasDB: !!env.DB
    });
    return { success: false, error: 'Admin email not configured' };
  }
  
  const subject = '新用户订阅通知 - Fashion Store';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e11d48;">新用户订阅通知</h2>
      <p>您有一个新的邮箱订阅：</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>订阅邮箱：</strong> ${subscriberEmail}</p>
        <p><strong>来源：</strong> ${source}</p>
        <p><strong>订阅时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">此邮件由 Fashion Store 系统自动发送。</p>
    </div>
  `;
  
  return await sendEmail(env, {
    to: adminEmail,
    subject: subject,
    html: html,
  });
}

/**
 * 发送留言通知邮件给管理员
 */
export async function sendContactNotification(env, contactData) {
  const { name, email, subject, message } = contactData;
  
  // 获取管理员邮箱
  let adminEmail = env.ADMIN_EMAIL || '';
  
  if (!adminEmail && env.DB) {
    try {
      const config = await env.DB.prepare('SELECT config_value FROM system_configs WHERE config_key = ?').bind('admin_email').first();
      if (config) {
        adminEmail = config.config_value;
      }
    } catch (error) {
      console.warn('Failed to load admin email from database:', error);
    }
  }
  
  if (!adminEmail) {
    console.warn('Admin email not configured. Notification will not be sent.', {
      hasEnvAdminEmail: !!env.ADMIN_EMAIL,
      hasDB: !!env.DB
    });
    return { success: false, error: 'Admin email not configured' };
  }
  
  const emailSubject = `新留言通知: ${subject || '无主题'}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e11d48;">新留言通知</h2>
      <p>您收到了一条新的留言：</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>姓名：</strong> ${name}</p>
        <p><strong>邮箱：</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>主题：</strong> ${subject || '无主题'}</p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p><strong>留言内容：</strong></p>
          <p style="white-space: pre-wrap; color: #374151;">${message}</p>
        </div>
        <p style="margin-top: 15px; color: #6b7280; font-size: 12px;">提交时间：${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">此邮件由 Fashion Store 系统自动发送。</p>
      <p style="margin-top: 20px;">
        <a href="mailto:${email}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">回复留言</a>
      </p>
    </div>
  `;
  
  return await sendEmail(env, {
    to: adminEmail,
    subject: emailSubject,
    html: html,
  });
}

