# AstralTrading

A modern TypeScript web application implementing WD Gann's astro trading methods. Uses high-precision astronomical algorithms to calculate planetary positions and identify market timing through angular relationships and cycles.

## Features

### 🌙 Three Core Trading Methods

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
   - Project forward: Time(n) = Time(0) + n × interval
   - Create precise timing windows for potential reversals

### 🎨 Modern UI

- Clean, professional design with indigo, orange, and grey color scheme
- Interactive date pickers for analysis parameters
- Real-time timing marker visualization
- Confidence scoring for each signal
- Method-specific filtering and analysis

### 🔬 High-Precision Ephemeris

- VSOP87 simplified algorithm for accurate planetary positions
- Julian Day Number conversions
- Support for both geocentric and heliocentric systems
- Covers dates from 1900 to 2100
- ~1 hour precision for modern dates

## Installation

```bash
npm install
```

## Project Structure

```
src/
├── core/              # Calculation engines
│   ├── PlanetaryCalculator.ts
│   ├── EphemerisEngine.ts (high-precision)
│   ├── AspectEngine.ts
│   ├── AngularDisplacementEngine.ts
│   └── EclipseAnchorEngine.ts
├── models/            # TypeScript types
├── ui/               # React components
│   ├── App.tsx
│   └── components/
└── utils/            # TradingAnalyzer
```

## Quick Start

### Development Server

```bash
npm run dev
```

Opens http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

## Usage Examples

### CLI: Planetary Calculator

```typescript
import { PlanetaryCalculator } from './src/core';

const calc = new PlanetaryCalculator();
const moon = calc.getPlanet('moon');
const angle = calc.calculateAspectAngle(45, 135); // 90°
const aspect = calc.getAspectType(90); // 'square'
```

### CLI: Full Analysis

```typescript
import { TradingAnalyzer } from './src/utils';

const analyzer = new TradingAnalyzer();
await analyzer.initialize();

const result = await analyzer.analyzeTimeWindow(
  new Date('2026-03-01'),
  new Date('2026-04-30'),
  new Date('2023-09-28'),
  new Date('2024-04-08')
);

console.log(`Found ${result.combined.length} timing markers`);
```

### Web UI

1. Set analysis date range
2. Set reference points (swing date, eclipse date)
3. Click "Run Analysis"
4. Explore results by method (aspects, displacement, eclipse)
5. View confidence scores and descriptions

## Ephemeris Engine Details

The **EphemerisEngine** uses:

- **VSOP87 Simplified**: Mean longitude calculations for all planets
- **Julian Day Number**: Precise date/time conversions
- **Perturbation Corrections**: For Moon and inner planets
- **Geocentric/Heliocentric**: Switchable coordinate systems

Accuracy for modern dates: ~1 hour for major timing events.

For higher precision (seconds), integrate with:
- **Skyfield** (via Python backend)
- **Swiss Ephemeris** (C library wrapper)
- **NASA JPL** (API-based)

## Key Concepts

### Angular Displacement
```
displacement = (current_longitude - reference_longitude) mod 360°
```
Represents how far a planet has moved from its reference position.

### Planetary Periods
- Moon: 29.53 days
- Mercury: 87.97 days
- Venus: 224.70 days
- Mars: 686.97 days
- Jupiter: 4332.89 days
- Saturn: 10759.22 days

### Coordinate Systems
- **Geocentric**: Apparent positions from Earth (includes retrograde)
- **Heliocentric**: True positions relative to Sun (uniform motion)

## Development

```bash
# Type check
npm run type-check

# Run tests
npm run test

# Build
npm run build

# Format & lint
npm run lint
```

## Color Scheme

- **Primary (Indigo)**: #6366f1, #4f46e5 - Main actions, aspects
- **Accent (Orange)**: #f97316, #fb923c - Highlights, displacement
- **Neutral (Grey)**: #1e293b to #e2e8f0 - Backgrounds, text

## Performance

- **Startup**: ~500ms (ephemeris initialization)
- **Analysis**: 50-200 markers in 1-2 seconds
- **Rendering**: Smooth 60fps updates

## API Reference

See `CLAUDE.md` for detailed API documentation and architecture diagrams.

## References

- **WD Gann**: Master Time Factor, Gann Square of Nine
- **Astronomical**: VSOP87, JPL Ephemeris, Swiss Ephemeris
- **Lunar Cycles**: Synodic month (29.53 days), lunar phases
- **Seasonal**: 90-day Gann quarters, solstices/equinoxes

## License

MIT - Educational use only

## Disclaimer

**Financial Warning**: This tool is for educational purposes only. It does not constitute financial or investment advice. Trading involves substantial risk of loss. Always conduct your own research and consult with qualified professionals before making financial decisions.
