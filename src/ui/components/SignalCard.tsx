import React from 'react';
import { TradingRecommendation } from '../../utils/SignalGenerator';

interface SignalCardProps {
  signal: TradingRecommendation;
  date: Date;
}

const getSignalColor = (signal: TradingRecommendation['signal']) => {
  switch (signal) {
    case 'STRONG_BUY':
      return { bg: 'bg-green-900 bg-opacity-30', border: 'border-green-500', icon: '📈', text: 'text-green-400' };
    case 'BUY':
      return { bg: 'bg-green-900 bg-opacity-20', border: 'border-green-600', icon: '📊', text: 'text-green-300' };
    case 'HOLD':
      return { bg: 'bg-slate-700 bg-opacity-30', border: 'border-slate-500', icon: '⏸️', text: 'text-slate-300' };
    case 'SELL':
      return { bg: 'bg-orange-900 bg-opacity-20', border: 'border-orange-600', icon: '📉', text: 'text-orange-300' };
    case 'STRONG_SELL':
      return { bg: 'bg-red-900 bg-opacity-30', border: 'border-red-500', icon: '⚠️', text: 'text-red-400' };
    case 'NEUTRAL':
      return { bg: 'bg-slate-700 bg-opacity-20', border: 'border-slate-600', icon: '⚪', text: 'text-slate-400' };
  }
};

const getRiskBadge = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
  switch (risk) {
    case 'LOW':
      return 'bg-green-500 bg-opacity-20 text-green-300';
    case 'MEDIUM':
      return 'bg-accent-500 bg-opacity-20 text-accent-300';
    case 'HIGH':
      return 'bg-red-500 bg-opacity-20 text-red-300';
  }
};

export default function SignalCard({ signal, date }: SignalCardProps) {
  const colors = getSignalColor(signal.signal);

  return (
    <div className={`card-hover card border-2 ${colors.bg} border-l-4 ${colors.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{colors.icon}</span>
            <span className={`text-sm font-bold ${colors.text} uppercase tracking-wide`}>
              {signal.signal.replace(/_/g, ' ')}
            </span>
            <span className={`ml-auto inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRiskBadge(
              signal.riskLevel
            )}`}>
              {signal.riskLevel} Risk
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-3">{signal.action}</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-700 bg-opacity-40 rounded px-2 py-1">
              <p className="text-slate-400">Confidence</p>
              <p className={`font-bold ${signal.confidence >= 0.9 ? 'text-green-400' : signal.confidence >= 0.8 ? 'text-accent-400' : 'text-slate-300'}`}>
                {(signal.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div className="bg-slate-700 bg-opacity-40 rounded px-2 py-1">
              <p className="text-slate-400">Timeframe</p>
              <p className="font-bold text-slate-200">{signal.timeframe}</p>
            </div>
          </div>

          <div className="mt-3 rounded bg-slate-700 bg-opacity-30 px-3 py-2 text-xs text-slate-300 italic border-l-2 border-primary-500">
            {signal.reasoning}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
        <time className="text-xs font-medium text-slate-400">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
        <span className="text-xs text-slate-500">Timing Signal</span>
      </div>
    </div>
  );
}
