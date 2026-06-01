import { Planet, PlanetaryAspect, PlanetaryAspectType, CoordinateSystem, TimingMarker } from '../models/types';
import { PlanetaryCalculator } from './PlanetaryCalculator';
import { EphemerisEngine } from './EphemerisEngine';

/**
 * AspectEngine handles Planetary Aspects Model
 *
 * Calculates when two planets form specific angles:
 * - 0° = Conjunction (new cycle)
 * - 60° = Sextile (1/6 cycle)
 * - 90° = Square (1/4 cycle - structural shift)
 * - 120° = Trine (1/3 cycle - stable)
 * - 180° = Opposition (1/2 cycle - tension)
 */
export class AspectEngine {
  private calculator: PlanetaryCalculator;
  private ephemeris: EphemerisEngine;

  constructor(ephemeris: EphemerisEngine) {
    this.calculator = new PlanetaryCalculator();
    this.ephemeris = ephemeris;
  }

  /**
   * Find when two planets form a specific aspect within a date range
   */
  async findAspects(
    planet1: Planet,
    planet2: Planet,
    aspectType: PlanetaryAspectType,
    startDate: Date,
    endDate: Date,
    system: CoordinateSystem = 'geocentric'
  ): Promise<PlanetaryAspect[]> {
    const aspects: PlanetaryAspect[] = [];

    // Check every day in the range
    const currentDate = new Date(startDate);
    const dayInMs = 24 * 60 * 60 * 1000;

    while (currentDate < endDate) {
      const pos1 = await this.ephemeris.getPlanetPosition(planet1, currentDate, system);
      const pos2 = await this.ephemeris.getPlanetPosition(planet2, currentDate, system);

      if (this.calculator.formsAspect(pos1, pos2, aspectType)) {
        const angle = this.calculator.calculateAspectAngle(pos1.longitude, pos2.longitude);

        aspects.push({
          planet1,
          planet2,
          aspectType,
          angle,
          timestamp: new Date(currentDate),
          coordinateSystem: system,
        });
      }

      currentDate.setTime(currentDate.getTime() + dayInMs);
    }

    return aspects;
  }

  /**
   * Find all aspects between two planets in a date range
   */
  async findAllAspects(
    planet1: Planet,
    planet2: Planet,
    startDate: Date,
    endDate: Date,
    system: CoordinateSystem = 'geocentric'
  ): Promise<PlanetaryAspect[]> {
    const allAspects: PlanetaryAspect[] = [];
    const aspectTypes: PlanetaryAspectType[] = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

    for (const type of aspectTypes) {
      const aspects = await this.findAspects(planet1, planet2, type, startDate, endDate, system);
      allAspects.push(...aspects);
    }

    return allAspects.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Convert aspects to timing markers for chart visualization
   */
  aspectsToTimingMarkers(aspects: PlanetaryAspect[]): TimingMarker[] {
    return aspects.map(aspect => ({
      date: aspect.timestamp,
      type: 'aspect',
      planet: aspect.planet1,
      description: `${aspect.planet1.symbol} ${aspect.aspectType} ${aspect.planet2.symbol} (${aspect.angle.toFixed(1)}°)`,
      confidence: this.calculateConfidence(aspect),
    }));
  }

  /**
   * Confidence scoring based on aspect orb
   * Tighter orb = higher confidence
   */
  private calculateConfidence(aspect: PlanetaryAspect): number {
    const targetAngles: Record<PlanetaryAspectType, number> = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180,
    };

    const target = targetAngles[aspect.aspectType];
    const orb = Math.abs(aspect.angle - target);
    const maxOrb = 8;

    return Math.max(0, 1 - (orb / maxOrb));
  }
}
