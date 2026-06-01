import React from 'react';

type AnalysisMethod = 'all' | 'aspects' | 'displacement' | 'eclipse';

interface MethodSelectorProps {
  selected: AnalysisMethod;
  onChange: (method: AnalysisMethod) => void;
}

const methods: { value: AnalysisMethod; label: string; icon: string }[] = [
  { value: 'all', label: 'All Methods', icon: '⊕' },
  { value: 'aspects', label: 'Aspects', icon: '◆' },
  { value: 'displacement', label: 'Displacement', icon: '↗' },
  { value: 'eclipse', label: 'Eclipse', icon: '◯' },
];

export default function MethodSelector({ selected, onChange }: MethodSelectorProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {methods.map(method => (
        <button
          key={method.value}
          onClick={() => onChange(method.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            selected === method.value
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
              : 'border border-slate-600 bg-slate-700 bg-opacity-50 text-slate-300 hover:border-slate-500'
          }`}
        >
          <span className="mr-2">{method.icon}</span>
          {method.label}
        </button>
      ))}
    </div>
  );
}
