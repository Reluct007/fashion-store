import { useState } from 'react';
import { Gift } from 'lucide-react';
import SpinWheel from './SpinWheel';

export default function FloatingGiftButton() {
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  return (
    <>
      {/* 浮动礼物按钮 */}
      <button
        onClick={() => setShowSpinWheel(true)}
        className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110 animate-pulse-slow"
        title="Spin to Win!"
      >
        <Gift className="w-8 h-8 text-white" />
      </button>

      {/* 转盘抽奖 */}
      {showSpinWheel && (
        <SpinWheel onClose={() => setShowSpinWheel(false)} />
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
      `}</style>
    </>
  );
}
