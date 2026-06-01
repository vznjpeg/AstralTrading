import React from 'react';

interface DateRangePickerProps {
  label: string;
  startDate: Date;
  endDate: Date;
  onStartChange: (date: Date) => void;
  onEndChange: (date: Date) => void;
  descriptions?: [string, string];
}

export default function DateRangePicker({
  label,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  descriptions,
}: DateRangePickerProps) {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStartChange(new Date(e.target.value));
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEndChange(new Date(e.target.value));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-200">{label}</label>

      <div className="space-y-2">
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            {descriptions ? descriptions[0] : 'Start Date'}
          </label>
          <input
            type="date"
            value={formatDate(startDate)}
            onChange={handleStartChange}
            className="form-input w-full rounded-lg border border-slate-600 bg-slate-700 bg-opacity-50 px-4 py-2.5 text-slate-100 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            {descriptions ? descriptions[1] : 'End Date'}
          </label>
          <input
            type="date"
            value={formatDate(endDate)}
            onChange={handleEndChange}
            className="form-input w-full rounded-lg border border-slate-600 bg-slate-700 bg-opacity-50 px-4 py-2.5 text-slate-100 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
          />
        </div>
      </div>
    </div>
  );
}
