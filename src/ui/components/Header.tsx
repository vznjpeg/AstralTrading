import React from 'react';

export default function Header() {
  return (
    <header className="border-b border-slate-700 bg-slate-800 bg-opacity-50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Astral
            </span>
            Trading
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            GAN Astro Trading Methods • Planetary Aspects & Time Cycles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-slate-700 bg-opacity-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-400">Status</p>
            <p className="flex items-center gap-1 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Active
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
