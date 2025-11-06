export default function PaymentMethods() {
  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '🔷' },
    { name: 'Apple Pay', icon: '🍎' },
    { name: 'Google Pay', icon: 'G' },
    { name: 'Stripe', icon: '💳' },
  ];

  return (
    <div className="bg-gray-50 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">We Accept</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
                title={method.name}
              >
                <span className="text-xl">{method.icon}</span>
                <span className="text-sm font-medium text-gray-700">{method.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Secure payment processing • SSL encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

