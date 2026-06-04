import { TimingMarker } from '../models/types';
import { PlanetaryCalculator, EphemerisEngine, AspectEngine, AngularDisplacementEngine, EclipseAnchorEngine } from '../core';
import { Planet } from '../models/types';
import { SignalGenerator, TradingRecommendation } from './SignalGenerator';

/**
 * TradingAnalyzer integrates all three GAN astro trading methods
 * to provide comprehensive market timing analysis with actionable signals
 */
export class TradingAnalyzer {
  private ephemeris: EphemerisEngine;
  private calculator: PlanetaryCalculator;
  private aspectEngine: AspectEngine;
  private displacementEngine: AngularDisplacementEngine;
  private eclipseEngine: EclipseAnchorEngine;
  private signalGenerator: SignalGenerator;

  constructor() {
    this.ephemeris = new EphemerisEngine();
    this.calculator = new PlanetaryCalculator();
    this.aspectEngine = new AspectEngine(this.ephemeris);
    this.displacementEngine = new AngularDisplacementEngine(this.ephemeris);
    this.eclipseEngine = new EclipseAnchorEngine();
    this.signalGenerator = new SignalGenerator();
  }

  async initialize() {
    await this.ephemeris.initialize();
  }

  /**
   * Comprehensive analysis combining all three methods
   */
  async analyzeTimeWindow(
    startDate: Date,
    endDate: Date,
    swingPointDate: Date,
    eclipseDate: Date
  ): Promise<{
    aspects: TimingMarker[];
    displacements: TimingMarker[];
    eclipseProjections: TimingMarker[];
    combined: TimingMarker[];
    signals: TradingRecommendation[];
    outlook: { outlook: string; description: string; recommendation: string };
  }> {
    const moon = this.calculator.getPlanet('moon')!;
    const markers: TimingMarker[] = [];

    // Method 1: Planetary Aspects
    const allAspects = await this.aspectEngine.findAllAspects(
      moon,
      this.calculator.getPlanet('mars')!,
      startDate,
      endDate
    );
    const aspectMarkers = this.aspectEngine.aspectsToTimingMarkers(allAspects);
    markers.push(...aspectMarkers);

    // Method 2: Angular Displacement
    const phases = await this.displacementEngine.calculatePhaseDates(
      moon,
      swingPointDate,
      45 // Example reference angle
    );
    const displacementMarkers = this.displacementEngine.phasesToTimingMarkers(phases, moon);
    markers.push(...displacementMarkers);

    // Method 3: Eclipse Anchor
    let eclipseAnchor = this.eclipseEngine.createEclipseAnchor('solar', eclipseDate);
    const estimatedReaction = new Date(eclipseDate.getTime() + 11 * 24 * 60 * 60 * 1000);
    eclipseAnchor = this.eclipseEngine.calibrateWithFirstReaction(eclipseAnchor, estimatedReaction);
    eclipseAnchor = this.eclipseEngine.projectForwardDates(eclipseAnchor, 4);
    const eclipseMarkers = this.eclipseEngine.anchorToTimingMarkers(eclipseAnchor);
    markers.push(...eclipseMarkers);

    // Sort all markers by date
    const combined = markers.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Generate trading signals
    const signals = this.signalGenerator.generateSignals(combined);
    const outlook = this.signalGenerator.generateOutlook(signals, combined.length);

    return {
      aspects: aspectMarkers,
      displacements: displacementMarkers,
      eclipseProjections: eclipseMarkers,
      combined,
      signals,
      outlook,
    };
  }

  /**
   * Consolidate overlapping timing markers within a tolerance window
   */
  consolidateMarkers(markers: TimingMarker[], toleranceHours: number = 24): TimingMarker[] {
    if (markers.length === 0) return [];

    const sorted = [...markers].sort((a, b) => a.date.getTime() - b.date.getTime());
    const consolidated: TimingMarker[] = [];
    const toleranceMs = toleranceHours * 60 * 60 * 1000;

    let current = sorted[0];
    let count = 1;

    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i].date.getTime() - current.date.getTime();

      if (diff < toleranceMs) {
        // Same cluster - increase count
        count++;
      } else {
        // Different cluster - save current and start new
        consolidated.push({
          ...current,
          description: `${current.description} (${count} signals)`,
          confidence: Math.min(1, current.confidence! + (count - 1) * 0.1),
        });
        current = sorted[i];
        count = 1;
      }
    }

    // Add last marker
    consolidated.push({
      ...current,
      description: `${current.description} (${count} signals)`,
      confidence: Math.min(1, current.confidence! + (count - 1) * 0.1),
    });

    return consolidated;
  }

  /**
   * Generate trading signal based on consolidated markers
   */
  generateSignals(
    consolidatedMarkers: TimingMarker[],
    confidenceThreshold: number = 0.8
  ): Array<{
    date: Date;
    signal: 'strong' | 'medium' | 'weak';
    description: string;
    markers: TimingMarker[];
  }> {
    return consolidatedMarkers
      .filter(m => m.confidence! >= confidenceThreshold)
      .map(marker => ({
        date: marker.date,
        signal: marker.confidence! >= 0.95 ? 'strong' : marker.confidence! >= 0.85 ? 'medium' : 'weak',
        description: marker.description,
        markers: [marker],
      }));
  }
}
