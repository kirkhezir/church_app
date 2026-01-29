/**
 * Live Service Indicator Component
 *
 * Shows when a live stream is active and links to watch live
 */

import { useState, useEffect } from 'react';
import { Radio, Play } from 'lucide-react';
import { useI18n } from '@/i18n';

interface LiveServiceIndicatorProps {
  className?: string;
  compact?: boolean;
}

// In production, this would check your streaming service API
// For demo, we simulate based on day and time (Saturday 9-12)
const checkIsLive = (): boolean => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();

  // Simulate: Live on Saturdays between 9 AM and 12 PM
  // In production, replace with actual API check
  return day === 6 && hour >= 9 && hour < 12;
};

export function LiveServiceIndicator({
  className = '',
  compact = false,
}: LiveServiceIndicatorProps) {
  const { language } = useI18n();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    // Check live status on mount and every minute
    const checkLive = () => {
      const live = checkIsLive();
      setIsLive(live);
      if (live) {
        // Simulate viewer count (in production, get from streaming API)
        setViewerCount(Math.floor(Math.random() * 50) + 20);
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isLive) return null;

  const liveUrl = 'https://www.youtube.com/@singburiadventist/live';

  if (compact) {
    return (
      <a
        href={liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex animate-pulse items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white ${className}`}
      >
        <Radio className="h-3 w-3" />
        LIVE
      </a>
    );
  }

  return (
    <a
      href={liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-white shadow-lg transition-transform hover:scale-105 ${className}`}
    >
      <div className="relative">
        <Radio className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-white" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white" />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {language === 'th' ? 'กำลังถ่ายทอดสด' : 'Live Now'}
          </span>
        </div>
        <span className="text-xs text-red-100">
          {viewerCount} {language === 'th' ? 'คนกำลังดู' : 'watching'}
        </span>
      </div>
      <Play className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

/**
 * Floating Live Indicator
 *
 * A fixed position indicator that appears when live streaming is active
 */
export function FloatingLiveIndicator() {
  const { language } = useI18n();
  const [isLive, setIsLive] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkLive = () => {
      setIsLive(checkIsLive());
    };

    checkLive();
    const interval = setInterval(checkLive, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isLive || isDismissed) return null;

  return (
    <div className="animate-slide-up fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white hover:bg-slate-700"
          aria-label="Dismiss"
        >
          ×
        </button>
        <a
          href="https://www.youtube.com/@singburiadventist/live"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 text-white shadow-2xl"
        >
          <div className="relative">
            <Radio className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-white" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white" />
          </div>
          <div>
            <p className="font-bold">{language === 'th' ? 'กำลังถ่ายทอดสด!' : "We're Live!"}</p>
            <p className="text-sm text-red-100">
              {language === 'th' ? 'คลิกเพื่อดู' : 'Click to watch'}
            </p>
          </div>
          <Play className="ml-2 h-6 w-6" />
        </a>
      </div>
    </div>
  );
}

export default LiveServiceIndicator;
