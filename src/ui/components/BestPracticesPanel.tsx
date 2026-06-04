import React from 'react';

const practices = [
  {
    icon: '📊',
    title: 'Always Confirm with Price',
    tip: 'Timing signals show WHEN markets might move, not WHERE. Always check the price chart. Look for technical patterns, support/resistance, and volume confirmation.',
  },
  {
    icon: '🎯',
    title: 'Use Proper Position Sizing',
    tip: 'Even strong signals (90%+) can fail. Never risk more than 1-2% of your account per trade. Use stop losses to protect against surprises.',
  },
  {
    icon: '⏱️',
    title: 'Respect the Timeframe',
    tip: 'A "1-3 days" signal means watch for the move to start/complete within that window. Markets sometimes need a few candles to confirm the direction.',
  },
  {
    icon: '📈',
    title: 'High Confidence Doesn\'t Mean Guaranteed',
    tip: 'Even 95% confident signals can fail. The market is probabilistic, not deterministic. Manage risk accordingly.',
  },
  {
    icon: '🔄',
    title: 'Look for Signal Convergence',
    tip: 'When multiple methods point to the same date, confidence increases dramatically. A date with 3+ signals is more reliable than a single signal.',
  },
  {
    icon: '💡',
    title: 'Use for Timing, Not Direction',
    tip: 'These signals tell you WHEN something might happen. For WHAT direction, use additional analysis (technical analysis, fundamentals, sentiment).',
  },
  {
    icon: '⚠️',
    title: 'Risk Level Affects Position Size',
    tip: 'HIGH risk signals = smaller positions. LOW risk = can be more aggressive. This helps manage your maximum drawdown.',
  },
  {
    icon: '📅',
    title: 'Plan Between Signals',
    tip: 'When no signals are present, use that time to prepare. Set alerts, identify good entry/exit points, analyze charts.',
  },
];

export default function BestPracticesPanel() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-slate-100 mb-2">💡 Trading Best Practices</h2>
      <p className="text-slate-400 text-sm mb-6">How to use these signals effectively and responsibly.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practices.map((practice, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-700 via-slate-700 to-slate-800 bg-opacity-40 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{practice.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">{practice.title}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{practice.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-red-500 bg-opacity-10 border border-red-600 rounded-lg p-4">
        <p className="text-red-300 text-sm">
          <strong>⚠️ Financial Disclaimer:</strong> This tool is educational only. It does not constitute financial advice. Trading involves substantial risk of loss.
          Always consult qualified professionals before making financial decisions. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
