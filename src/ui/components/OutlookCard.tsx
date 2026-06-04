import React from 'react';

interface OutlookCardProps {
  outlook: string;
  description: string;
  recommendation: string;
  markerCount: number;
}

export default function OutlookCard({ outlook, description, recommendation, markerCount }: OutlookCardProps) {
  const isBullish = outlook.includes('BULLISH');
  const isBearish = outlook.includes('BEARISH');
  const isMixed = outlook.includes('MIXED');
  const isInsufficient = outlook.includes('INSUFFICIENT');

  const getBgColor = () => {
    if (isBullish) return 'bg-gradient-to-br from-green-900 via-slate-800 to-slate-800';
    if (isBearish) return 'bg-gradient-to-br from-red-900 via-slate-800 to-slate-800';
    if (isMixed) return 'bg-gradient-to-br from-accent-900 via-slate-800 to-slate-800';
    return 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900';
  };

  const getBorderColor = () => {
    if (isBullish) return 'border-green-600';
    if (isBearish) return 'border-red-600';
    if (isMixed) return 'border-accent-600';
    return 'border-slate-600';
  };

  const getTextColor = () => {
    if (isBullish) return 'text-green-300';
    if (isBearish) return 'text-red-300';
    if (isMixed) return 'text-accent-300';
    return 'text-slate-300';
  };

  return (
    <div className={`rounded-xl border-2 ${getBorderColor()} ${getBgColor()} p-8 shadow-2xl mb-8`}>
      <div className="max-w-3xl">
        <h2 className={`text-4xl font-bold mb-2 ${getTextColor()}`}>
          {outlook}
        </h2>

        <p className="text-slate-300 text-lg mb-6">
          {description}
        </p>

        <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 border border-slate-600 mb-6">
          <p className="text-slate-400 text-sm mb-1">📍 Key Action</p>
          <p className="text-slate-100 font-semibold">
            {recommendation}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 bg-opacity-50 rounded-lg px-4 py-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">TOTAL SIGNALS</p>
            <p className="text-2xl font-bold text-slate-100">{markerCount}</p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 rounded-lg px-4 py-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">ANALYSIS STATUS</p>
            <p className="text-sm font-semibold text-green-400">✓ Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
