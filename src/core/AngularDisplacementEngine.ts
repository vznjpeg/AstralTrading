import { Planet, AngularDisplacement, CyclePhase, CoordinateSystem, TimingMarker } from '../models/types';
import { PlanetaryCalculator } from './PlanetaryCalculator';
import { EphemerisEngine } from './EphemerisEngine';

/**
 * AngularDisplacementEngine handles Planetary Longitude Mapping
 *
 * Tracks a single planet's movement from a reference point (swing high/low):
 * - 0° = Reference point (treated as starting position)
 * - 90° = Quarter cycle (structural shift)
 * - 180° = Half cycle (maximum distance)
 * - 270° = 3/4 cycle (return phase begins)
 * - 360° = Full cycle (reset to original position)
 */
export class AngularDisplacementEngine {
  private calculator: PlanetaryCalculator;
  private ephemeris: EphemerisEngine;

  constructor(ephemeris: EphemerisEngine) {
    this.calculator = new PlanetaryCalculator();
    this.ephemeris = ephemeris;
  }

  /**
   * Select a reference point (swing high/low) and track planet's angular displacement from it
   */
  async setupDisplacementTracking(
    planet: Planet,
    referenceDate: Date,
    system: CoordinateSystem = 'geocentric'
  ): Promise<AngularDisplacement> {
    const refPosition = await this.ephemeris.getPlanetPosition(planet, referenceDate, system);

    return {
      planet,
      referenceDate,
      referenceAngle: refPosition.longitude,
      currentDate: referenceDate,
      currentAngle: refPosition.longitude,
      displacement: 0,
      coordinateSystem: system,
    };
  }

  /**
   * Update displacement tracking to a new date
   */
  async updateDisplacement(
    displacement: AngularDisplacement,
    currentDate: Date
  ): Promise<AngularDisplacement> {
    const position = await this.ephemeris.getPlanetPosition(
      displacement.planet,
      currentDate,
      displacement.coordinateSystem
    );

    const disp = this.calculator.calculateAngularDisplacement(
      displacement.referenceAngle,
      position.longitude
    );

    return {
      ...displacement,
      currentDate,
      currentAngle: position.longitude,
      displacement: disp,
    };
  }

  /**
   * Calculate when planet reaches key cycle phases (90°, 180°, 270°, 360°)
   */
  async calculatePhaseDates(
    planet: Planet,
    referenceDate: Date,
    referenceAngle: number,
    system: CoordinateSystem = 'geocentric'
  ): Promise<CyclePhase[]> {
    const phases: CyclePhase[] = [];
    const phaseAngles = [90, 180, 270, 360];

    for (const targetAngle of phaseAngles) {
      const daysNeeded = this.calculator.calculateTimeForAngularMove(planet, targetAngle);
      const phaseDate = new Date(referenceDate.getTime() + daysNeeded * 24 * 60 * 60 * 1000);

      phases.push({
        displacement: targetAngle,
        timestamp: phaseDate,
        description: this.describePhase(targetAngle),
        expectedBehavior: this.expectedBehaviorAtPhase(targetAngle),
      });
    }

    return phases;
  }

  /**
   * Find exact date when planet reaches a specific angular displacement
   */
  async findPhaseDate(
    planet: Planet,
    referenceDate: Date,
    referenceAngle: number,
    targetDisplacement: number,
    system: CoordinateSystem = 'geocentric'
  ): Promise<Date | null> {
    const daysNeeded = this.calculator.calculateTimeForAngularMove(planet, targetDisplacement);
    return new Date(referenceDate.getTime() + daysNeeded * 24 * 60 * 60 * 1000);
  }

  /**
   * Convert cycle phases to timing markers for chart visualization
   */
  phasesToTimingMarkers(phases: CyclePhase[], planet: Planet): TimingMarker[] {
    return phases.map(phase => ({
      date: phase.timestamp,
      type: 'angular_displacement',
      planet,
      description: `${planet.name} ${phase.displacement}° displacement: ${phase.description}`,
      confidence: this.getPhaseConfidence(phase.displacement),
    }));
  }

  private describePhase(displacement: number): string {
    const descriptions: Record<number, string> = {
      90: 'Quarter cycle - Structural shift point',
      180: 'Half cycle - Maximum distance from start',
      270: '3/4 cycle - Return phase begins',
      360: 'Full cycle - Reset to original position',
    };
    return descriptions[displacement] || `${displacement}° displacement`;
  }

  private expectedBehaviorAtPhase(displacement: number): string {
    const behaviors: Record<number, string> = {
      90: 'Momentum shift, potential reversal or consolidation',
      180: 'Stabilization point, structure change likely',
      270: 'Major top formation, expansion to decline transition',
      360: 'Full cycle completion, strong reversal signal',
    };
    return behaviors[displacement] || '';
  }

  private getPhaseConfidence(displacement: number): number {
    // All major phases have equal high confidence
    return 0.9;
  }
}
