import React, { useState, useEffect } from 'react';
import { TradingAnalyzer } from '../utils/TradingAnalyzer';
import { TimingMarker } from '../models/types';
import { TradingRecommendation } from '../utils/SignalGenerator';
import Header from './components/Header';
import AnalysisPanel from './components/AnalysisPanel';
import TimingMarkersList from './components/TimingMarkersList';
import SignalCard from './components/SignalCard';
import OutlookCard from './components/OutlookCard';
import GlossaryPanel from './components/GlossaryPanel';
import BestPracticesPanel from './components/BestPracticesPanel';
import MethodSelector from './components/MethodSelector';
import DateRangePicker from './components/DateRangePicker';
import LoadingSpinner from './components/LoadingSpinner';
import './styles.css';

type AnalysisMethod = 'all' | 'aspects' | 'displacement' | 'eclipse';
type ViewTab = 'signals' | 'details' | 'learn';

export default function App() {
  const [analyzer, setAnalyzer] = useState<TradingAnalyzer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(new Date('2026-03-01'));
  const [endDate, setEndDate] = useState(new Date('2026-04-30'));
  const [swingDate, setSwingDate] = useState(new Date('2023-09-28'));
  const [eclipseDate, setEclipseDate] = useState(new Date('2024-04-08'));

  const [allMarkers, setAllMarkers] = useState<TimingMarker[]>([]);
  const [aspectMarkers, setAspectMarkers] = useState<TimingMarker[]>([]);
  const [displacementMarkers, setDisplacementMarkers] = useState<TimingMarker[]>([]);
  const [eclipseMarkers, setEclipseMarkers] = useState<TimingMarker[]>([]);

  const [signals, setSignals] = useState<TradingRecommendation[]>([]);
  const [outlook, setOutlook] = useState({ outlook: '', description: '', recommendation: '' });

  const [selectedMethod, setSelectedMethod] = useState<AnalysisMethod>('all');
  const [currentTab, setCurrentTab] = useState<ViewTab>('signals');
  const [analyzing, setAnalyzing] = useState(false);

  // Initialize analyzer
  useEffect(() => {
    const initAnalyzer = async () => {
      try {
        const a = new TradingAnalyzer();
        await a.initialize();
        setAnalyzer(a);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setLoading(false);
      }
    };

    initAnalyzer();
  }, []);

  // Run analysis
  const handleAnalyze = async () => {
    if (!analyzer) return;

    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzer.analyzeTimeWindow(startDate, endDate, swingDate, eclipseDate);
      setAspectMarkers(result.aspects);
      setDisplacementMarkers(result.displacements);
      setEclipseMarkers(result.eclipseProjections);
      setAllMarkers(result.combined);
      setSignals(result.signals);
      setOutlook(result.outlook);
      setCurrentTab('signals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getDisplayedMarkers = () => {
    switch (selectedMethod) {
      case 'aspects':
        return aspectMarkers;
      case 'displacement':
        return displacementMarkers;
      case 'eclipse':
        return eclipseMarkers;
      default:
        return allMarkers;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const hasResults = allMarkers.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500 bg-opacity-10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Control Panel */}
        <div className="card mb-8">
          <h2 className="mb-6 text-xl text-slate-100">⚙️ Setup Your Analysis</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DateRangePicker
              label="Period to Analyze (when should we look for signals?)"
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />

            <DateRangePicker
              label="Reference Points (where did the market turn?)"
              startDate={swingDate}
              endDate={eclipseDate}
              onStartChange={setSwingDate}
              onEndChange={setEclipseDate}
              descriptions={['Recent Swing High/Low', 'Recent Eclipse Date']}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-primary"
            >
              {analyzing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Find Signals
                </>
              )}
            </button>

            {hasResults && (
              <button
                onClick={() => setCurrentTab(currentTab === 'learn' ? 'signals' : 'learn')}
                className="btn-secondary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentTab === 'learn' ? 'Back to Results' : 'Learn More'}
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {hasResults ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700">
              <button
                onClick={() => setCurrentTab('signals')}
                className={`px-4 py-3 font-medium border-b-2 transition-all ${
                  currentTab === 'signals'
                    ? 'border-primary-500 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                🎯 Trading Signals
              </button>
              <button
                onClick={() => setCurrentTab('details')}
                className={`px-4 py-3 font-medium border-b-2 transition-all ${
                  currentTab === 'details'
                    ? 'border-primary-500 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                📊 Detailed Analysis
              </button>
              <button
                onClick={() => setCurrentTab('learn')}
                className={`px-4 py-3 font-medium border-b-2 transition-all ${
                  currentTab === 'learn'
                    ? 'border-primary-500 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                📚 Learn
              </button>
            </div>

            {/* Signals Tab */}
            {currentTab === 'signals' && (
              <>
                {/* Market Outlook */}
                <OutlookCard
                  outlook={outlook.outlook}
                  description={outlook.description}
                  recommendation={outlook.recommendation}
                  markerCount={allMarkers.length}
                />

                {/* Signal Cards */}
                {signals.length > 0 ? (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">🎯 Your Trading Signals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {signals.map((signal, idx) => {
                        // Find the date for this signal
                        const signalMarkers = allMarkers.filter(m => {
                          const mDate = m.date.toISOString().split('T')[0];
                          const sDate = new Date(allMarkers[idx % allMarkers.length].date).toISOString().split('T')[0];
                          return mDate === sDate;
                        });
                        const date = signalMarkers[0]?.date || new Date();

                        return (
                          <SignalCard key={idx} signal={signal} date={date} />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="card text-center mb-8">
                    <p className="text-slate-400">No high-confidence signals found in this period</p>
                  </div>
                )}
              </>
            )}

            {/* Details Tab */}
            {currentTab === 'details' && (
              <>
                {/* Method Selector */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Filter by Method</h3>
                  <MethodSelector selected={selectedMethod} onChange={setSelectedMethod} />
                </div>

                {/* Analysis Panels */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
                  <AnalysisPanel
                    title="Planetary Aspects"
                    description="When planets align at specific angles"
                    count={aspectMarkers.length}
                    method="aspects"
                    isSelected={selectedMethod === 'aspects' || selectedMethod === 'all'}
                    onClick={() => setSelectedMethod(selectedMethod === 'aspects' ? 'all' : 'aspects')}
                  />
                  <AnalysisPanel
                    title="Angular Displacement"
                    description="Tracking planet's movement in cycle"
                    count={displacementMarkers.length}
                    method="displacement"
                    isSelected={selectedMethod === 'displacement' || selectedMethod === 'all'}
                    onClick={() => setSelectedMethod(selectedMethod === 'displacement' ? 'all' : 'displacement')}
                  />
                  <AnalysisPanel
                    title="Eclipse Anchoring"
                    description="Using eclipses for timing projections"
                    count={eclipseMarkers.length}
                    method="eclipse"
                    isSelected={selectedMethod === 'eclipse' || selectedMethod === 'all'}
                    onClick={() => setSelectedMethod(selectedMethod === 'eclipse' ? 'all' : 'eclipse')}
                  />
                </div>

                {/* Timing Markers List */}
                <TimingMarkersList markers={getDisplayedMarkers()} />
              </>
            )}

            {/* Learn Tab */}
            {currentTab === 'learn' && (
              <>
                <GlossaryPanel />
                <BestPracticesPanel />
              </>
            )}
          </>
        ) : (
          <>
            {/* Empty State */}
            {!analyzing && (
              <>
                <div className="card text-center mb-8">
                  <svg className="mx-auto mb-4 h-16 w-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="mb-2 text-xl text-slate-300 font-semibold">Ready to Find Signals?</h3>
                  <p className="text-slate-400 mb-6">Set your dates above and click "Find Signals" to get started</p>

                  {/* Quick tutorial */}
                  <div className="bg-slate-700 bg-opacity-30 rounded-lg p-6 text-left max-w-2xl mx-auto">
                    <h4 className="font-semibold text-slate-200 mb-3">Quick Start Guide:</h4>
                    <ol className="space-y-2 text-sm text-slate-400">
                      <li><strong className="text-slate-300">1. Period to Analyze:</strong> Select the date range you want to search for signals (usually 1-2 months)</li>
                      <li><strong className="text-slate-300">2. Reference Points:</strong> Enter a recent swing high/low and a recent eclipse date from the past</li>
                      <li><strong className="text-slate-300">3. Click "Find Signals"</strong> and wait for the analysis</li>
                      <li><strong className="text-slate-300">4. Review Results:</strong> See trading signals with buy/sell/hold recommendations</li>
                    </ol>
                  </div>
                </div>

                {/* Always show education panels */}
                <GlossaryPanel />
                <BestPracticesPanel />
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800 bg-opacity-50 py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm">
                AstralTrading © 2026 — Educational Tool for Understanding Market Timing
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Built with ⚡ using GAN Astro Methods
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
