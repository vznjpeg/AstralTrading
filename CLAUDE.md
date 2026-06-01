# AstralTrading Project Documentation

## Overview

AstralTrading is a TypeScript-based trading analysis tool implementing WD Gann's astro trading methods combined with astronomical timing analysis.

## Three Core Trading Methods

### 1. Planetary Aspects Model (`AspectEngine`)

Calculates when two planets form specific angular relationships:

- **0° Conjunction**: Both cycles align (new cycle beginning)
- **60° Sextile**: 1/6 of cycle (supportive)
- **90° Square**: 1/4 of cycle (structural shift)
- **120° Trine**: 1/3 of cycle (stable distribution)
- **180° Opposition**: 1/2 of cycle (maximum tension)

These are used as timing triggers to identify when markets are more likely to react.

**Key Files:**
- `src/core/AspectEngine.ts` - Find and analyze planetary aspects
- Integrates with `PlanetaryCalculator` for angle calculations

### 2. Planetary Longitude Mapping (`AngularDisplacementEngine`)

Tracks a single planet's movement from a reference point (swing high/low):

1. Select reference point (swing point on chart) = 0°
2. Track planet's angular displacement forward
3. Key phases: 90°, 180°, 270°, 360°
4. Convert angular displacement to calendar dates

Each phase has expected market behavior:
- **90°**: Quarter cycle - momentum shifts, potential reversal
- **180°**: Half cycle - maximum distance, structure stabilizes
- **270°**: 3/4 cycle - local top forms, return phase begins
- **360°**: Full cycle - major reversal, reset

**Key Files:**
- `src/core/AngularDisplacementEngine.ts` - Track displacement and project phases
- Uses `PlanetaryCalculator` for orbital calculations

### 3. Eclipse Anchor Timing Model (`EclipseAnchorEngine`)

Uses solar/lunar eclipses as synchronized reference points:

1. **Time 0**: Eclipse date (system synchronized state)
2. **Time 1**: First observable market reaction
3. **Interval**: Time 1 - Time 0
4. **Projection**: Time(n) = Time(0) + n × interval

This creates a series of projected dates where market reversals are likely.

**Key Files:**
- `src/core/EclipseAnchorEngine.ts` - Create anchors and project forward

## Architecture

```
src/
├── core/
│   ├── PlanetaryCalculator.ts      # Angular calculations & geometry
│   ├── EphemerisEngine.ts          # Planetary position data (interface for real ephemeris)
│   ├── AspectEngine.ts             # Method 1: Planetary aspects
│   ├── AngularDisplacementEngine.ts # Method 2: Angular displacement
│   ├── EclipseAnchorEngine.ts       # Method 3: Eclipse anchoring
│   └── index.ts
├── models/
│   └── types.ts                    # All TypeScript interfaces
├── utils/
│   └── (utility functions)
└── ui/
    └── (React components for visualization)
```

## Data Models

### Core Types (`src/models/types.ts`)

- **Planet**: Name, symbol, orbital period
- **PlanetPosition**: Longitude, latitude, timestamp, coordinate system
- **PlanetaryAspect**: Two planets, aspect type, angle, timestamp
- **AngularDisplacement**: Planet, reference/current angles, displacement
- **EclipseAnchor**: Eclipse type, dates, interval, projections
- **TimingMarker**: Date, type, description, confidence score

## Coordinate Systems

- **Geocentric**: Positions relative to Earth (apparent motion, includes retrograde)
- **Heliocentric**: Positions relative to Sun (true motion, smooth progression)

The choice affects timing calculations, so both are configurable.

## Integration Points

### EphemerisEngine (Currently Placeholder)

The `EphemerisEngine` provides the interface for planetary position data. Currently uses simplified calculations. Should be replaced with:

1. **Skyfield** (Python via WASM or API)
2. **Swiss Ephemeris** (compiled library)
3. **NASA JPL Ephemeris** (via API)

The class structure allows easy swapping without affecting the calculation engines.

## Next Steps

1. **Integrate Real Ephemeris Data**
   - Research best option for browser/Node.js environment
   - Implement actual planetary position calculations
   - Consider accuracy requirements (1 hour precision minimum)

2. **UI/Visualization Layer**
   - React components for chart display
   - Timeline visualization for timing markers
   - Interactive aspect/displacement calculator

3. **Testing & Validation**
   - Unit tests for all calculation engines
   - Validation against known planetary positions
   - Backtesting framework for trading signals

4. **Production Features**
   - Multi-timeframe analysis
   - Risk management integration
   - Trading signal generation
   - Historical analysis & statistics
