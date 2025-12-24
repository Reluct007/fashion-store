import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function CartDrawer({ isOpen, onClose, cartItems = [] }) {
  const { updateQuantity, removeFromCart } = useCart();
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = 15.85;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleQuantityChange = (itemId, size, color, delta) => {
    updateQuantity(itemId, size, color, delta);
  };

  const handleRemoveItem = (itemId, size, color) => {
    removeFromCart(itemId, size, color);
  };

  const handleCheckout = () => {
    console.log('Proceed to checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Your cart ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {remainingForFreeShipping > 0 && cartItems.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-800">
              Only <span className="font-bold">${remainingForFreeShipping.toFixed(2)}</span> away from free shipping!
            </p>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some items to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    {item.color && (
                      <p className="text-xs text-gray-500">
                        {item.color} {item.size && `| Size: ${item.size}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.size, item.color, -1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.size, item.color, 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Gift card or discount code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <div className="p-4 bg-green-50 border-t border-green-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-rose-600 text-white py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
              >
                CHECKOUT
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <p className="text-center text-xs text-gray-600">
                At No Extra Cost, Choose Your Impact
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <button className="p-2 border border-gray-300 rounded hover:border-rose-500 transition-colors">
                  <span className="text-xl">🏠</span>
                </button>
                <button className="p-2 border border-gray-300 rounded hover:border-rose-500 transition-colors">
                  <span className="text-xl">💙</span>
                </button>
                <button className="p-2 border border-gray-300 rounded hover:border-rose-500 transition-colors">
                  <span className="text-xl">👗</span>
                </button>
                <button className="p-2 border border-gray-300 rounded hover:border-rose-500 transition-colors">
                  <span className="text-xl">🎓</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
