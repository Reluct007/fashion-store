// 支付方式图标组件 - 用于页脚
// 使用图片文件展示支付方式

import paymentFrame1 from '../../images/payment_icon_frame1.png';
import paymentFrame2 from '../../images/payment_icon_frame2.png';
import paymentFrame3 from '../../images/payment_icon_frame3.png';
import paymentFrame4 from '../../images/payment_icon_frame4.png';
import paymentFrame5 from '../../images/payment_icon_frame5.png';
import paymentFrame6 from '../../images/payment_icon_frame6.png';
import paymentFrame7 from '../../images/payment_icon_frame7.png';
import paymentFrame9 from '../../images/payment_icon_frame9.png';
import paymentFrame10 from '../../images/payment_icon_frame10.png';
import paymentFrame11 from '../../images/payment_icon_frame11.png';
import paymentFrame12 from '../../images/payment_icon_frame12.png';
import paymentFrame13 from '../../images/payment_icon_frame13.png';

export default function PaymentMethods() {
  // 支付方式图标配置
  const paymentIcons = [
    { src: paymentFrame1, alt: 'Payment Method 1' },
    { src: paymentFrame2, alt: 'Payment Method 2' },
    { src: paymentFrame3, alt: 'Payment Method 3' },
    { src: paymentFrame4, alt: 'Payment Method 4' },
    { src: paymentFrame5, alt: 'Payment Method 5' },
    { src: paymentFrame6, alt: 'Payment Method 6' },
    { src: paymentFrame7, alt: 'Payment Method 7' },
    { src: paymentFrame9, alt: 'Payment Method 9' },
    { src: paymentFrame10, alt: 'Payment Method 10' },
    { src: paymentFrame11, alt: 'Payment Method 11' },
    { src: paymentFrame12, alt: 'Payment Method 12' },
    { src: paymentFrame13, alt: 'Payment Method 13' },
  ];

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {paymentIcons.map((icon, index) => (
          <img
            key={index}
            src={icon.src}
            alt={icon.alt}
            loading="lazy"
            decoding="async"
            className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
            role="presentation"
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Secure payment processing • SSL encrypted
      </p>
    </div>
  );
}
