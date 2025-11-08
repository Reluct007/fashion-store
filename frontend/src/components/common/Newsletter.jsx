import { Mail } from 'lucide-react';
import SubscribeForm from './SubscribeForm';

export default function Newsletter({ source = 'homepage' }) {
  return (
    <section className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-600 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stay Updated with Latest Fashion Trends
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Subscribe to our newsletter and get exclusive offers, new arrivals, and fashion tips delivered to your inbox.
          </p>
          <SubscribeForm source={source} />
          <p className="text-sm text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

