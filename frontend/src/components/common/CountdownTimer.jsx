import { useState, useEffect } from 'react';

export default function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">
        <span className="font-semibold">Sale Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700">Sale ends in:</span>
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className="bg-gray-100 px-3 py-1 rounded">
            <span className="text-lg font-bold text-gray-900">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-xs text-gray-600 ml-1">D</span>
          </div>
        )}
        <div className="bg-gray-100 px-3 py-1 rounded">
          <span className="text-lg font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-gray-600 ml-1">H</span>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded">
          <span className="text-lg font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-gray-600 ml-1">M</span>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded">
          <span className="text-lg font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-gray-600 ml-1">S</span>
        </div>
      </div>
    </div>
  );
}

