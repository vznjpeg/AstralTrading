import React, { useState, useEffect } from 'react';
import { TradingAnalyzer } from '../utils/TradingAnalyzer';
import { TimingMarker } from '../models/types';
import Header from './components/Header';
import AnalysisPanel from './components/AnalysisPanel';
import TimingMarkersList from './components/TimingMarkersList';
import MethodSelector from './components/MethodSelector';
import DateRangePicker from './components/DateRangePicker';
import LoadingSpinner from './components/LoadingSpinner';
import './styles.css';

type AnalysisMethod = 'all' | 'aspects' | 'displacement' | 'eclipse';

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

  const [selectedMethod, setSelectedMethod] = useState<AnalysisMethod>('all');
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
    try {
      const result = await analyzer.analyzeTimeWindow(startDate, endDate, swingDate, eclipseDate);
      setAspectMarkers(result.aspects);
      setDisplacementMarkers(result.displacements);
      setEclipseMarkers(result.eclipseProjections);
      setAllMarkers(result.combined);
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

  const displayedMarkers = getDisplayedMarkers();

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
          <h2 className="mb-6 text-xl text-slate-100">Analysis Parameters</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DateRangePicker
              label="Trading Window"
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />

            <DateRangePicker
              label="Reference Points"
              startDate={swingDate}
              endDate={eclipseDate}
              onStartChange={setSwingDate}
              onEndChange={setEclipseDate}
              descriptions={['Swing High/Low', 'Eclipse Date']}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn-primary mt-6"
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
                Run Analysis
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {displayedMarkers.length > 0 && (
          <>
            {/* Method Selector */}
            <MethodSelector selected={selectedMethod} onChange={setSelectedMethod} />

            {/* Analysis Panels */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <AnalysisPanel
                title="Planetary Aspects"
                description="Moon & Mars Angular Relationships"
                count={aspectMarkers.length}
                method="aspects"
                isSelected={selectedMethod === 'aspects' || selectedMethod === 'all'}
                onClick={() => setSelectedMethod(selectedMethod === 'aspects' ? 'all' : 'aspects')}
              />
              <AnalysisPanel
                title="Angular Displacement"
                description="Cycle Phase Projections"
                count={displacementMarkers.length}
                method="displacement"
                isSelected={selectedMethod === 'displacement' || selectedMethod === 'all'}
                onClick={() => setSelectedMethod(selectedMethod === 'displacement' ? 'all' : 'displacement')}
              />
              <AnalysisPanel
                title="Eclipse Anchoring"
                description="Forward Timing Projections"
                count={eclipseMarkers.length}
                method="eclipse"
                isSelected={selectedMethod === 'eclipse' || selectedMethod === 'all'}
                onClick={() => setSelectedMethod(selectedMethod === 'eclipse' ? 'all' : 'eclipse')}
              />
            </div>

            {/* Timing Markers List */}
            <TimingMarkersList markers={displayedMarkers} />
          </>
        )}

        {/* Empty State */}
        {allMarkers.length === 0 && !analyzing && (
          <div className="card text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="mb-2 text-slate-300">No analysis yet</h3>
            <p className="text-slate-400">Configure parameters and click "Run Analysis" to find timing markers</p>
          </div>
        )}
      </main>
    </div>
  );
}
