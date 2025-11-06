// 网站模板配置
// 通过修改 TEMPLATE 变量来切换不同的网站模板

export const TEMPLATE = 'fashion'; // 可选值: 'fashion', 'modern', 'minimal'

// 模板配置
export const TEMPLATE_CONFIGS = {
  // 服饰类模板 - 默认模板
  fashion: {
    name: '服饰类模板',
    description: '专业的服饰类电商网站设计，参考 Waterfilter 风格',
    layout: 'fashion',
    colorScheme: 'rose',
    features: ['产品展示', '分类筛选', '购物车', '后台管理'],
    navbar: {
      style: 'sticky',
      background: 'bg-white',
      logo: '/vite.svg'
    },
    hero: {
      style: 'banner',
      height: 'h-[400px] md:h-[500px] lg:h-[600px]'
    },
    sections: ['hero', 'products', 'footer']
  },

  // 现代简约模板
  modern: {
    name: '现代简约模板',
    description: '简洁现代的网站设计风格',
    layout: 'modern',
    colorScheme: 'gray',
    features: ['简洁设计', '响应式', '快速加载'],
    navbar: {
      style: 'fixed',
      background: 'bg-white/95 backdrop-blur',
      logo: '/vite.svg'
    },
    hero: {
      style: 'centered',
      height: 'h-[400px] lg:h-[600px]'
    },
    sections: ['hero', 'products', 'footer']
  },

  // 极简模板
  minimal: {
    name: '极简模板',
    description: '极简主义设计风格',
    layout: 'minimal',
    colorScheme: 'monochrome',
    features: ['极简设计', '专注内容', '快速浏览'],
    navbar: {
      style: 'static',
      background: 'bg-white',
      logo: '/vite.svg'
    },
    hero: {
      style: 'text-only',
      height: 'h-[300px]'
    },
    sections: ['hero', 'products', 'footer']
  }
};

// 获取当前模板配置
export function getCurrentTemplateConfig() {
  return TEMPLATE_CONFIGS[TEMPLATE] || TEMPLATE_CONFIGS.fashion;
}

// 获取当前模板名称
export function getCurrentTemplate() {
  return TEMPLATE;
}

// 切换模板（用于开发测试）
export function switchTemplate(templateName) {
  if (TEMPLATE_CONFIGS[templateName]) {
    console.log(`切换到模板: ${templateName}`);
    return TEMPLATE_CONFIGS[templateName];
  }
  return null;
}

