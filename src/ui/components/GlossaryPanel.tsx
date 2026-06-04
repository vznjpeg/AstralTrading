import React, { useState } from 'react';

const glossaryTerms = [
  {
    title: 'Planetary Aspects',
    simple: 'When planets align at specific angles',
    explanation: 'Think of planets moving in circles. When they form perfect angles (like 90° or 180°), they create "aspects". These moments historically coincide with market changes. It\'s like when multiple forces align in nature - something tends to shift.',
    example: 'Moon square Mars = 90° angle = Potential momentum shift',
  },
  {
    title: 'Angular Displacement',
    simple: 'Tracking how far a planet has moved',
    explanation: 'Pick a starting point (like a stock\'s high/low). Then track how many degrees a planet moves forward from there. Key points are at 90°, 180°, 270°, and 360° - these are like milestones where structure often changes.',
    example: 'Moon moves 180° from swing high = Market often tests opposite extreme',
  },
  {
    title: 'Eclipse Anchoring',
    simple: 'Using eclipses to predict future timing',
    explanation: 'Eclipses are synchronized events. By measuring the time from an eclipse to the first market reaction, we can project forward. If the first reaction takes 11 days, then 22, 33, and 44 days later should show similar patterns.',
    example: 'Eclipse on April 8 → First reaction April 19 (11 days) → Next signals on May 1 (22d), May 12 (33d), May 23 (44d)',
  },
  {
    title: 'Confidence Score',
    simple: 'How reliable this signal is',
    explanation: 'Not all signals are equal. We score each one from 0-100%. Multiple timing methods pointing to the same date = higher confidence. 90%+ is very strong.',
    example: '50% confidence = Weak signal, wait for confirmation. 90% confidence = High probability event.',
  },
  {
    title: 'Buy/Sell/Hold Signals',
    simple: 'What action to consider',
    explanation: 'Based on multiple timing indicators, the system suggests whether to consider buying (going long), selling (taking profits/going short), or holding (waiting for clarity).',
    example: 'STRONG_BUY = High conviction buying opportunity. HOLD = Unclear, maintain current position.',
  },
  {
    title: 'Risk Level',
    simple: 'How volatile the move might be',
    explanation: 'HIGH risk means big moves expected - use smaller positions. LOW risk means steadier moves - can be more confident. MEDIUM is balanced.',
    example: 'Eclipse convergence = HIGH risk (potential gap). Single aspect = LOW risk (gradual shift).',
  },
];

export default function GlossaryPanel() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="card mb-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-2">📚 Easy Explanation Guide</h2>
      <p className="text-slate-400 text-sm mb-6">New to trading signals? Here's what everything means in simple terms.</p>

      <div className="space-y-3">
        {glossaryTerms.map((term, idx) => (
          <div
            key={idx}
            className="bg-slate-700 bg-opacity-30 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full px-4 py-4 text-left hover:bg-slate-700 hover:bg-opacity-50 flex items-center justify-between transition-all"
            >
              <div>
                <h3 className="font-semibold text-slate-100">{term.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{term.simple}</p>
              </div>
              <svg
                className={`h-5 w-5 text-primary-400 transition-transform ${
                  expandedIndex === idx ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {expandedIndex === idx && (
              <div className="px-4 py-4 border-t border-slate-700 bg-slate-800 bg-opacity-30">
                <div className="mb-3">
                  <p className="text-slate-300">{term.explanation}</p>
                </div>
                <div className="bg-primary-500 bg-opacity-10 border-l-2 border-primary-500 px-3 py-2 rounded text-sm text-slate-300">
                  <strong>Example:</strong> {term.example}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
