/**
 * Visitor Counter Component
 *
 * Shows live visitor counter and social proof stats
 */

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Heart } from 'lucide-react';
import { useI18n } from '@/i18n';

interface VisitorCounterProps {
  className?: string;
  variant?: 'inline' | 'card';
}

export function VisitorCounter({ className = '', variant = 'inline' }: VisitorCounterProps) {
  const { language } = useI18n();
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    // Simulate live visitor count
    // In production, this would connect to an analytics API
    const baseVisitors = 15;
    const randomOffset = Math.floor(Math.random() * 10);
    setVisitors(baseVisitors + randomOffset);

    // Update periodically
    const interval = setInterval(() => {
      setVisitors((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(5, Math.min(50, newCount));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'card') {
    return (
      <div
        className={`rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white ${className}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">
            {language === 'th' ? 'เยี่ยมชมขณะนี้' : 'Currently Visiting'}
          </h3>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold">{visitors}</span>
          <span className="mb-1 text-emerald-100">
            {language === 'th' ? 'คนกำลังเยี่ยมชม' : 'people browsing'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>
        {visitors} {language === 'th' ? 'คนกำลังเยี่ยมชม' : 'people viewing'}
      </span>
    </div>
  );
}

/**
 * Social Proof Stats Component
 *
 * Shows key church stats as social proof
 */
interface SocialProofStatsProps {
  className?: string;
}

export function SocialProofStats({ className = '' }: SocialProofStatsProps) {
  const { language } = useI18n();

  const stats = [
    {
      value: '150+',
      label: language === 'th' ? 'ครอบครัวที่เยี่ยมชมเดือนที่แล้ว' : 'families visited last month',
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      value: '25+',
      label: language === 'th' ? 'ปีแห่งการรับใช้' : 'years of ministry',
      icon: Heart,
      color: 'text-rose-600 bg-rose-100',
    },
    {
      value: '500+',
      label: language === 'th' ? 'การรับชมเทศนาเดือนนี้' : 'sermon views this month',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100',
    },
  ];

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className={`rounded-lg p-2 ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VisitorCounter;
