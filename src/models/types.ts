export type CoordinateSystem = 'geocentric' | 'heliocentric';

export type PlanetaryAspectType =
  | 'conjunction'    // 0°
  | 'sextile'        // 60°
  | 'square'         // 90°
  | 'trine'          // 120°
  | 'opposition';    // 180°

export interface Planet {
  name: string;
  symbol: string;
  orbitalPeriodDays: number;
}

export interface PlanetPosition {
  planet: Planet;
  longitude: number; // 0-360 degrees
  latitude: number;
  timestamp: Date;
  coordinateSystem: CoordinateSystem;
}

export interface PlanetaryAspect {
  planet1: Planet;
  planet2: Planet;
  aspectType: PlanetaryAspectType;
  angle: number; // 0-180, the actual angular separation
  timestamp: Date;
  coordinateSystem: CoordinateSystem;
}

export interface AngularDisplacement {
  planet: Planet;
  referenceDate: Date;
  referenceAngle: number;
  currentDate: Date;
  currentAngle: number;
  displacement: number; // degrees moved from reference
  coordinateSystem: CoordinateSystem;
}

export interface CyclePhase {
  displacement: number; // 90, 180, 270, or 360
  timestamp: Date;
  description: string;
  expectedBehavior?: string;
}

export interface EclipseAnchor {
  type: 'solar' | 'lunar';
  date: Date;
  firstReactionDate?: Date;
  intervalDays?: number;
  projectedDates?: Date[];
}

export interface TimingMarker {
  date: Date;
  type: 'aspect' | 'angular_displacement' | 'eclipse_projection';
  planet?: Planet;
  description: string;
  confidence?: number;
}
