import { Planet, PlanetPosition, PlanetaryAspect, PlanetaryAspectType, CoordinateSystem } from '../models/types';

export class PlanetaryCalculator {
  private planets: Map<string, Planet> = new Map([
    ['sun', { name: 'Sun', symbol: '☉', orbitalPeriodDays: 365.25 }],
    ['moon', { name: 'Moon', symbol: '☽', orbitalPeriodDays: 29.53 }],
    ['mercury', { name: 'Mercury', symbol: '☿', orbitalPeriodDays: 87.97 }],
    ['venus', { name: 'Venus', symbol: '♀', orbitalPeriodDays: 224.70 }],
    ['mars', { name: 'Mars', symbol: '♂', orbitalPeriodDays: 686.97 }],
    ['jupiter', { name: 'Jupiter', symbol: '♃', orbitalPeriodDays: 4332.89 }],
    ['saturn', { name: 'Saturn', symbol: '♄', orbitalPeriodDays: 10759.22 }],
    ['uranus', { name: 'Uranus', symbol: '♅', orbitalPeriodDays: 30688.59 }],
    ['neptune', { name: 'Neptune', symbol: '♆', orbitalPeriodDays: 60182.0 }],
  ]);

  getPlanet(name: string): Planet | undefined {
    return this.planets.get(name.toLowerCase());
  }

  getAllPlanets(): Planet[] {
    return Array.from(this.planets.values());
  }

  /**
   * Normalize angle to 0-360 range
   */
  normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  /**
   * Calculate aspect angle between two planets (0-180 degrees)
   */
  calculateAspectAngle(longitude1: number, longitude2: number): number {
    let angle = Math.abs(longitude1 - longitude2);
    if (angle > 180) {
      angle = 360 - angle;
    }
    return angle;
  }

  /**
   * Determine aspect type based on angle
   * Allows 8° orb for major aspects
   */
  getAspectType(angle: number): PlanetaryAspectType | null {
    const orb = 8;

    if (Math.abs(angle) < orb) return 'conjunction';
    if (Math.abs(angle - 60) < orb) return 'sextile';
    if (Math.abs(angle - 90) < orb) return 'square';
    if (Math.abs(angle - 120) < orb) return 'trine';
    if (Math.abs(angle - 180) < orb) return 'opposition';

    return null;
  }

  /**
   * Check if two planets form a specific aspect
   */
  formsAspect(
    pos1: PlanetPosition,
    pos2: PlanetPosition,
    targetAspect: PlanetaryAspectType
  ): boolean {
    const aspectAngle = this.calculateAspectAngle(pos1.longitude, pos2.longitude);
    const detected = this.getAspectType(aspectAngle);
    return detected === targetAspect;
  }

  /**
   * Calculate angular displacement from a reference angle
   * Returns the degrees moved forward in the cycle
   */
  calculateAngularDisplacement(
    referenceAngle: number,
    currentAngle: number
  ): number {
    const normalized = this.normalizeAngle(currentAngle - referenceAngle);
    return normalized;
  }

  /**
   * Calculate time needed for a planet to move a specific angular distance
   * Uses simple linear approximation based on orbital period
   */
  calculateTimeForAngularMove(
    planet: Planet,
    degreesToMove: number
  ): number {
    const degreesPerDay = 360 / planet.orbitalPeriodDays;
    return degreesToMove / degreesPerDay;
  }

  /**
   * Find key cycle phases (90°, 180°, 270°, 360°) from a reference date
   */
  calculateCyclePhases(
    planet: Planet,
    referenceDate: Date,
    referenceAngle: number
  ): { phase: number; date: Date }[] {
    const phases: { phase: number; date: Date }[] = [];
    const degreesPerDay = 360 / planet.orbitalPeriodDays;

    for (const phaseAngle of [90, 180, 270, 360]) {
      const daysNeeded = (phaseAngle / degreesPerDay);
      const phaseDate = new Date(referenceDate.getTime() + daysNeeded * 24 * 60 * 60 * 1000);
      phases.push({ phase: phaseAngle, date: phaseDate });
    }

    return phases;
  }
}
