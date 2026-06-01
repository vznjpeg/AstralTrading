import React from 'react';

interface AnalysisPanelProps {
  title: string;
  description: string;
  count: number;
  method: 'aspects' | 'displacement' | 'eclipse';
  isSelected: boolean;
  onClick: () => void;
}

const methodIcons = {
  aspects: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  displacement: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  eclipse: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const methodColors = {
  aspects: {
    bg: 'bg-primary-500 bg-opacity-10',
    border: 'border-primary-500 border-opacity-30',
    icon: 'text-primary-400',
    badge: 'badge-info',
  },
  displacement: {
    bg: 'bg-accent-500 bg-opacity-10',
    border: 'border-accent-500 border-opacity-30',
    icon: 'text-accent-400',
    badge: 'badge-warning',
  },
  eclipse: {
    bg: 'bg-slate-600 bg-opacity-20',
    border: 'border-slate-600 border-opacity-30',
    icon: 'text-slate-300',
    badge: 'badge',
  },
};

export default function AnalysisPanel({
  title,
  description,
  count,
  method,
  isSelected,
  onClick,
}: AnalysisPanelProps) {
  const colors = methodColors[method];

  return (
    <button
      onClick={onClick}
      className={`card-hover card border-2 text-left transition-all ${
        isSelected ? `${colors.bg} ${colors.border}` : 'border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg ${colors.bg} p-3 ${colors.icon}`}>
          {methodIcons[method]}
        </div>
        <div className={`${colors.badge}`}>{count}</div>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>

      <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
        <span>Click to toggle</span>
        <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
