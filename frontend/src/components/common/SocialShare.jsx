import { Facebook, Twitter, Share2 } from 'lucide-react';

export default function SocialShare({ product }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${product.name} - ${product.price}`;
  
  const shareToPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareNative = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Share:</span>
      <div className="flex gap-2">
        <button
          onClick={shareToPinterest}
          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          aria-label="Share on Pinterest"
          title="Share on Pinterest"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={shareToTwitter}
          className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
          aria-label="Share on Twitter"
          title="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </button>
        <button
          onClick={shareToFacebook}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        {typeof window !== 'undefined' && navigator.share && (
          <button
            onClick={shareNative}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Share"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

