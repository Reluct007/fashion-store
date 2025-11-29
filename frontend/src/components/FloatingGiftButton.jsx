import { useState } from 'react';
import { Gift, X } from 'lucide-react';

export default function FloatingGiftButton() {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
          source: 'floating_gift_button' 
        }),
      });

      if (response.ok) {
        setMessage('✅ Successfully subscribed! Check your email for exclusive offers.');
        setTimeout(() => {
          setShowPopup(false);
          setEmail('');
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

  return (
    <>
      {/* 浮动礼物按钮 */}
      <button
        onClick={() => setShowPopup(true)}
        className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110 animate-pulse-slow"
        title="Get exclusive offers!"
      >
        <Gift className="w-8 h-8 text-white" />
      </button>

      {/* 弹窗 */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowPopup(false)}
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
              Get Exclusive Offers! 🎁
            </h2>

            {/* 描述 */}
            <p className="text-gray-600 text-center mb-6">
              Subscribe to our newsletter and get 10% off your first order plus exclusive deals and updates!
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
            <button
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
