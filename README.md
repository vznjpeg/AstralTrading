# AstralTrading

A TypeScript trading analysis tool implementing WD Gann's astro trading methods. Uses astronomical planetary positions and angular relationships to identify market timing and reversal points.

## Features

### Three Core Trading Methods

1. **Planetary Aspects Model**
   - Calculate angles between two planets (conjunction, square, trine, opposition, sextile)
   - Identify exact timestamps when aspects form
   - Project market reversals based on angular geometry

2. **Planetary Longitude Mapping**
   - Select swing high/low as reference point
   - Track single planet's angular displacement
   - Project key phases (90°, 180°, 270°, 360°) as trading dates
   - Each phase has expected market behavior

3. **Eclipse Anchor Timing Model**
   - Use solar/lunar eclipses as synchronized reference points
   - Measure interval to first market reaction
   - Project forward using formula: Time(n) = Time(0) + n × interval
   - Create timing windows for potential reversals

### Core Components

- **PlanetaryCalculator**: Angular calculations, geometry, aspect detection
- **EphemerisEngine**: Planetary position data interface (ready for real ephemeris integration)
- **AspectEngine**: Find and analyze planetary aspects
- **AngularDisplacementEngine**: Track planet displacement and calculate phases
- **EclipseAnchorEngine**: Create eclipse anchors and project forward

## Installation

```bash
npm install
```

## Project Structure

```
src/
├── core/              # Calculation engines
├── models/            # TypeScript types and interfaces
├── utils/             # Utility functions
└── ui/               # React components (coming soon)
```

## Getting Started

### Using the Planetary Calculator

```typescript
import { PlanetaryCalculator } from './src/core';

const calc = new PlanetaryCalculator();

// Get a planet
const moon = calc.getPlanet('moon');
console.log(moon); // { name: 'Moon', symbol: '☽', orbitalPeriodDays: 29.53 }

// Calculate aspect angle between two longitudes
const angle = calc.calculateAspectAngle(45, 135); // 90 degrees

// Identify aspect type
const aspect = calc.getAspectType(90); // 'square'
```

### Using the Aspect Engine

```typescript
import { AspectEngine } from './src/core';
import { EphemerisEngine } from './src/core';

const ephemeris = new EphemerisEngine();
const aspectEngine = new AspectEngine(ephemeris);

// Find when Moon forms square with Jupiter
const moon = { name: 'Moon', symbol: '☽', orbitalPeriodDays: 29.53 };
const jupiter = { name: 'Jupiter', symbol: '♃', orbitalPeriodDays: 4332.89 };

const startDate = new Date('2026-03-01');
const endDate = new Date('2026-03-31');

const aspects = await aspectEngine.findAspects(
  moon,
  jupiter,
  'square',
  startDate,
  endDate
);

console.log(aspects);
```

### Using Angular Displacement Engine

```typescript
import { AngularDisplacementEngine } from './src/core';

const dispEngine = new AngularDisplacementEngine(ephemeris);

// Setup tracking from a swing high
const referenceDate = new Date('2023-09-28'); // Crude oil swing high
const displacement = await dispEngine.setupDisplacementTracking(moon, referenceDate);

// Calculate phase dates (90°, 180°, 270°, 360°)
const phases = await dispEngine.calculatePhaseDates(
  moon,
  referenceDate,
  displacement.referenceAngle
);

phases.forEach(phase => {
  console.log(`${phase.displacement}°: ${phase.timestamp.toISOString()} - ${phase.description}`);
});
```

### Using Eclipse Anchor Engine

```typescript
import { EclipseAnchorEngine } from './src/core';

const eclipseEngine = new EclipseAnchorEngine();

// Create eclipse anchor
const eclipseDate = new Date('2024-04-08'); // Total solar eclipse
let anchor = eclipseEngine.createEclipseAnchor('solar', eclipseDate);

// Calibrate with first market reaction
const firstReactionDate = new Date('2024-04-19');
anchor = eclipseEngine.calibrateWithFirstReaction(anchor, firstReactionDate);
// Interval: 11 days

// Project forward
anchor = eclipseEngine.projectForwardDates(anchor, 4);

console.log(eclipseEngine.formatAnchorInfo(anchor));
```

## Development

```bash
# Type check
npm run type-check

# Run tests
npm run test

# Build
npm run build

# Development server
npm run dev
```

## Ephemeris Data

Currently uses simplified calculations for planetary positions. The architecture is designed to integrate with:

- **Skyfield** (Python-based, most accurate for modern dates)
- **Swiss Ephemeris** (C library with JavaScript bindings)
- **NASA JPL Ephemeris** (Direct API access)

See `src/core/EphemerisEngine.ts` for integration points.

## Key Concepts

### Angular Displacement

The number of degrees a planet has moved from a reference point:

```
displacement = (current_longitude - reference_longitude) mod 360°
```

### Orbital Period vs Mean Motion

Each planet has a fixed orbital period:
- Moon: 29.53 days (fastest)
- Mercury: 87.97 days
- Venus: 224.70 days
- Mars: 686.97 days
- Jupiter: 4332.89 days
- Saturn: 10759.22 days

### Coordinate Systems

- **Geocentric**: Apparent positions as seen from Earth (includes retrograde motion)
- **Heliocentric**: True positions relative to the Sun (uniform motion)

The method is based on angles, so the choice affects timing significantly.

## References

- **WD Gann's Methods**: Geometric time cycles, squares, and angles
- **Astronomical Ephemeris**: JPL DE440, Swiss Ephemeris
- **Lunar Cycles**: 29.53 days (one synodic month)
- **Seasonal Cycles**: 90-day quarters (Gann's seasonal model)

## License

MIT

## Contributing

This is an educational implementation of WD Gann's astro trading methods. Use for research and learning purposes only.

**Financial Disclaimer**: This content is for educational purposes only and does not constitute financial or investment advice. Trading involves risk and you may lose capital. Always do your own research before making any financial decisions.
