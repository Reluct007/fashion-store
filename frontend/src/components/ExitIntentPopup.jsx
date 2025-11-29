import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

export default function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 检查是否已经显示过（使用 sessionStorage，关闭浏览器后重置）
    const hasShownBefore = sessionStorage.getItem('exitIntentShown');
    if (hasShownBefore) {
      setHasShown(true);
      return;
    }

    let inactivityTimer;

    // 退出意图检测 - 鼠标移出页面顶部
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown && !showPopup) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // 不活跃检测 - 30秒无操作
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      if (!hasShown && !showPopup) {
        inactivityTimer = setTimeout(() => {
          setShowPopup(true);
          setHasShown(true);
          sessionStorage.setItem('exitIntentShown', 'true');
        }, 30000); // 30秒
      }
    };

    // 监听用户活动
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    document.addEventListener('mouseleave', handleMouseLeave);
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // 初始化不活跃计时器
    resetInactivityTimer();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimer);
    };
  }, [hasShown, showPopup]);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';
      const response = await fetch(`${API_URL}/api/email-subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          source: 'exit_intent_popup' 
        }),
      });

      if (response.ok) {
        setMessage('✅ Successfully subscribed! Check your email for exclusive offers.');
        setTimeout(() => {
          setShowPopup(false);
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Subscribe error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* 弹窗内容 */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-bounce-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 图标 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Never miss a sale 🎁
          </h2>

          {/* 描述 */}
          <p className="text-gray-600 text-center mb-6">
            Subscribe Waterdrop Notifications For The Latest Discount And Updates. You can disable anytime.
          </p>

          {/* 邮箱输入 */}
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
            />
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Later
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
