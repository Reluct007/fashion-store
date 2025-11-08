import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { subscribeEmail } from '../../lib/api';

export default function SubscribeForm({ variant = 'default', source = 'website' }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await subscribeEmail(email, source);
      
      setIsSuccess(true);
      setEmail('');
      
      // 3秒后重置成功状态
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'footer') {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-400"
            disabled={isSubmitting || isSuccess}
          />
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Subscribed
              </span>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
        {isSuccess && !error && (
          <p className="text-sm text-green-400 mt-2">Thank you for subscribing!</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="px-8 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSuccess ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Subscribed!
            </span>
          ) : isSubmitting ? (
            'Submitting...'
          ) : (
            'Subscribe'
          )}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
      {isSuccess && (
        <p className="text-sm text-green-600 mt-2">Thank you for subscribing!</p>
      )}
    </div>
  );
}

