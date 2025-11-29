import { useState, useRef } from 'react';
import { X, Gift } from 'lucide-react';

const prizes = [
  { id: 1, text: '10% OFF', color: '#FF6B6B', angle: 0 },
  { id: 2, text: '5% OFF', color: '#4ECDC4', angle: 45 },
  { id: 3, text: '15% OFF', color: '#FFE66D', angle: 90 },
  { id: 4, text: 'Free Shipping', color: '#95E1D3', angle: 135 },
  { id: 5, text: '20% OFF', color: '#FF6B9D', angle: 180 },
  { id: 6, text: '5% OFF', color: '#C7CEEA', angle: 225 },
  { id: 7, text: '25% OFF', color: '#FFEAA7', angle: 270 },
  { id: 8, text: 'Try Again', color: '#DFE6E9', angle: 315 },
];

export default function SpinWheel({ onClose }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const wheelRef = useRef(null);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setPrize(null);
    
    // 随机选择一个奖品
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    // 计算旋转角度（多转几圈 + 目标角度）
    const spins = 5; // 转5圈
    const targetAngle = 360 - randomPrize.angle + (Math.random() * 30 - 15); // 添加一些随机偏移
    const totalRotation = spins * 360 + targetAngle;
    
    setRotation(rotation + totalRotation);
    
    // 3秒后停止并显示结果
    setTimeout(() => {
      setSpinning(false);
      setPrize(randomPrize);
      setShowEmailForm(true);
    }, 3000);
  };

  const handleClaimPrize = async () => {
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
          source: `spin_wheel_${prize?.text}` 
        }),
      });

      if (response.ok) {
        setMessage(`🎉 Congratulations! Your ${prize?.text} coupon code has been sent to your email!`);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to claim prize. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Claim prize error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Gift className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎁 Spin to Win!
          </h2>
          <p className="text-gray-600">
            Spin the wheel and win amazing discounts!
          </p>
        </div>

        {/* 转盘容器 */}
        <div className="relative flex justify-center items-center mb-6">
          {/* 指针 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg"></div>
          </div>

          {/* 转盘 */}
          <div className="relative w-80 h-80">
            <svg
              ref={wheelRef}
              className="w-full h-full drop-shadow-2xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
              viewBox="0 0 200 200"
            >
              {/* 转盘背景 */}
              <circle cx="100" cy="100" r="95" fill="white" stroke="#333" strokeWidth="2" />
              
              {/* 转盘扇形 */}
              {prizes.map((item, index) => {
                const startAngle = (index * 45 - 90) * (Math.PI / 180);
                const endAngle = ((index + 1) * 45 - 90) * (Math.PI / 180);
                const x1 = 100 + 95 * Math.cos(startAngle);
                const y1 = 100 + 95 * Math.sin(startAngle);
                const x2 = 100 + 95 * Math.cos(endAngle);
                const y2 = 100 + 95 * Math.sin(endAngle);
                
                const textAngle = (index * 45 - 90 + 22.5) * (Math.PI / 180);
                const textX = 100 + 60 * Math.cos(textAngle);
                const textY = 100 + 60 * Math.sin(textAngle);
                
                return (
                  <g key={item.id}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-bold text-xs"
                      fill="#333"
                      transform={`rotate(${index * 45 + 22.5}, ${textX}, ${textY})`}
                    >
                      {item.text}
                    </text>
                  </g>
                );
              })}
              
              {/* 中心圆 */}
              <circle cx="100" cy="100" r="15" fill="#333" />
              <circle cx="100" cy="100" r="10" fill="white" />
            </svg>
          </div>
        </div>

        {/* 按钮或结果 */}
        {!prize ? (
          <button
            onClick={spinWheel}
            disabled={spinning}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {spinning ? '🎰 Spinning...' : '🎯 SPIN NOW!'}
          </button>
        ) : (
          <div className="space-y-4">
            {/* 奖品结果 */}
            <div className="bg-white rounded-xl p-6 text-center border-4 border-yellow-400 shadow-lg">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You Won!
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {prize.text}
              </p>
            </div>

            {/* 邮箱表单 */}
            {showEmailForm && (
              <div className="space-y-3">
                <p className="text-center text-gray-700 font-medium">
                  Enter your email to claim your prize:
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleClaimPrize()}
                />
                
                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.includes('🎉') 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}
                
                <button
                  onClick={handleClaimPrize}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Claiming...' : '🎁 Claim My Prize'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
