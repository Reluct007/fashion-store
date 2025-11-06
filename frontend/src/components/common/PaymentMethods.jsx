// 支付方式图标组件 - 用于页脚
// 参考 Waterfilter 项目样式，使用支付方式 logo

export default function PaymentMethods() {
  // 支付方式配置 - 使用品牌颜色和简化的 SVG
  const paymentMethods = [
    {
      name: 'Visa',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <rect fill="#1434CB" width="80" height="50" rx="3"/>
            <text x="40" y="35" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="Arial">VISA</text>
          </svg>
        </div>
      )
    },
    {
      name: 'Mastercard',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <circle cx="30" cy="25" r="15" fill="#EB001B"/>
            <circle cx="50" cy="25" r="15" fill="#F79E1B"/>
            <circle cx="40" cy="25" r="14" fill="#FF5F00"/>
          </svg>
        </div>
      )
    },
    {
      name: 'American Express',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <rect fill="#006FCF" width="80" height="50" rx="3"/>
            <text x="40" y="32" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Arial">AMEX</text>
          </svg>
        </div>
      )
    },
    {
      name: 'Discover',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <rect fill="#FF6000" width="80" height="50" rx="3"/>
            <text x="40" y="32" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial">DISCOVER</text>
          </svg>
        </div>
      )
    },
    {
      name: 'PayPal',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <rect fill="#003087" width="80" height="25" rx="3"/>
            <rect fill="#009CDE" y="25" width="80" height="25" rx="3"/>
            <text x="40" y="18" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Arial">PAY</text>
            <text x="40" y="42" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Arial">PAL</text>
          </svg>
        </div>
      )
    },
    {
      name: 'Apple Pay',
      icon: (
        <div className="w-16 h-10 bg-black rounded flex items-center justify-center">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <path d="M40 15c-1.5 0-2.8 0.7-3.8 1.8-0.9-0.5-2-0.8-3.2-0.8-2.7 0-4.9 2-5.8 4.8-2.5 0.1-4.5 2.2-4.5 4.8 0 2.6 2.1 4.7 4.7 4.7h13.6c0.5 0 0.9-0.4 0.9-0.9v-2.6c0-2.9-2.4-5.3-5.3-5.3-1.1 0-2.1 0.3-3 0.8 0.3-1.2 1.4-2.1 2.7-2.1 0.8 0 1.5 0.3 2 0.8 0.5-0.5 1.2-0.8 2-0.8z" fill="white"/>
            <text x="40" y="38" fill="white" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Arial">Pay</text>
          </svg>
        </div>
      )
    },
    {
      name: 'Google Pay',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <rect fill="#4285F4" width="80" height="50" rx="3"/>
            <circle cx="30" cy="25" r="8" fill="white"/>
            <path d="M40 15 L50 25 L40 35 Z" fill="white"/>
          </svg>
        </div>
      )
    },
    {
      name: 'Shop Pay',
      icon: (
        <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
          <svg viewBox="0 0 80 50" className="w-14 h-9">
            <rect fill="#5A31F4" width="80" height="50" rx="3"/>
            <text x="40" y="32" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Arial">Shop</text>
          </svg>
        </div>
      )
    },
  ];

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {paymentMethods.map((method, index) => (
          <div
            key={index}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            title={method.name}
            aria-label={method.name}
          >
            {method.icon}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Secure payment processing • SSL encrypted
      </p>
    </div>
  );
}
