import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircle : XCircle;
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3`}>
        <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <p className={`${textColor} flex-1 font-medium`}>{message}</p>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
