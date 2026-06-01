/**
 * Example: Using AstralTrading for GAN Astro Market Analysis
 *
 * This demonstrates how to use all three trading methods
 */

import {
  PlanetaryCalculator,
  EphemerisEngine,
  AspectEngine,
  AngularDisplacementEngine,
  EclipseAnchorEngine,
} from './src/core';

async function example() {
  console.log('=== AstralTrading Example ===\n');

  // Initialize
  const ephemeris = new EphemerisEngine();
  await ephemeris.initialize();

  const calc = new PlanetaryCalculator();
  const aspectEngine = new AspectEngine(ephemeris);
  const dispEngine = new AngularDisplacementEngine(ephemeris);
  const eclipseEngine = new EclipseAnchorEngine();

  // ========== METHOD 1: Planetary Aspects ==========
  console.log('METHOD 1: Planetary Aspects\n');

  const moon = calc.getPlanet('moon')!;
  const mars = calc.getPlanet('mars')!;
  const jupiter = calc.getPlanet('jupiter')!;

  console.log(`Tracking aspects between ${moon.name} and ${mars.name}`);
  console.log(`Moon orbital period: ${moon.orbitalPeriodDays} days`);
  console.log(`Mars orbital period: ${mars.orbitalPeriodDays} days\n`);

  const startDate = new Date('2026-03-01');
  const endDate = new Date('2026-04-30');

  const aspects = await aspectEngine.findAllAspects(moon, mars, startDate, endDate);
  console.log(`Found ${aspects.length} aspects between Moon and Mars:\n`);

  aspects.forEach(aspect => {
    console.log(`  ${aspect.timestamp.toISOString().split('T')[0]}: Moon ${aspect.aspectType} Mars (${aspect.angle.toFixed(1)}°)`);
  });

  // Convert to chart markers
  const aspectMarkers = aspectEngine.aspectsToTimingMarkers(aspects);
  console.log(`\nTiming Markers (for chart visualization):`);
  aspectMarkers.slice(0, 3).forEach(marker => {
    console.log(`  ${marker.date.toISOString().split('T')[0]}: ${marker.description}`);
  });

  // ========== METHOD 2: Angular Displacement ==========
  console.log('\n\nMETHOD 2: Angular Displacement\n');

  const referenceDate = new Date('2023-09-28'); // Example swing high
  console.log(`Crude Oil swing high on: ${referenceDate.toISOString().split('T')[0]}`);
  console.log(`Tracking Moon displacement from this point...\n`);

  const displacement = await dispEngine.setupDisplacementTracking(moon, referenceDate);
  console.log(`Reference angle: ${displacement.referenceAngle.toFixed(2)}°\n`);

  // Calculate phase dates
  const phases = await dispEngine.calculatePhaseDates(
    moon,
    referenceDate,
    displacement.referenceAngle
  );

  console.log('Moon Displacement Phases:');
  phases.forEach(phase => {
    console.log(`\n  ${phase.displacement}° Displacement`);
    console.log(`  Date: ${phase.timestamp.toISOString().split('T')[0]}`);
    console.log(`  ${phase.description}`);
    if (phase.expectedBehavior) {
      console.log(`  Expected: ${phase.expectedBehavior}`);
    }
  });

  // Convert to chart markers
  const dispMarkers = dispEngine.phasesToTimingMarkers(phases, moon);
  console.log('\n\nDisplacement Markers (for chart):');
  dispMarkers.forEach(marker => {
    console.log(`  ${marker.date.toISOString().split('T')[0]}: ${marker.description}`);
  });

  // ========== METHOD 3: Eclipse Anchor ==========
  console.log('\n\nMETHOD 3: Eclipse Anchor Timing\n');

  const eclipseDate = new Date('2024-04-08'); // Total solar eclipse
  console.log(`Solar Eclipse: ${eclipseDate.toISOString().split('T')[0]}`);

  let anchor = eclipseEngine.createEclipseAnchor('solar', eclipseDate);
  console.log(`Time 0: Eclipse date (synchronized reference point)\n`);

  // Calibrate with first reaction
  const firstReactionDate = new Date('2024-04-19');
  anchor = eclipseEngine.calibrateWithFirstReaction(anchor, firstReactionDate);
  console.log(`Time 1: First market reaction on ${firstReactionDate.toISOString().split('T')[0]}`);
  console.log(`Interval: ${anchor.intervalDays} days\n`);

  // Project forward
  anchor = eclipseEngine.projectForwardDates(anchor, 4);
  console.log('Projected Forward:');
  console.log(eclipseEngine.formatAnchorInfo(anchor));

  // Convert to chart markers
  const eclipseMarkers = eclipseEngine.anchorToTimingMarkers(anchor);
  console.log('\n\nEclipse Markers (for chart):');
  eclipseMarkers.forEach(marker => {
    console.log(`  ${marker.date.toISOString().split('T')[0]}: ${marker.description}`);
  });

  // ========== CONSOLIDATED ANALYSIS ==========
  console.log('\n\n=== CONSOLIDATED ANALYSIS ===\n');

  const allMarkers = [...aspectMarkers, ...dispMarkers, ...eclipseMarkers];
  const sorted = allMarkers.sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log(`Total timing markers identified: ${sorted.length}\n`);
  console.log('Top 10 markers by confidence:');

  sorted
    .filter(m => m.confidence !== undefined)
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 10)
    .forEach(marker => {
      const confStr = marker.confidence ? `${(marker.confidence * 100).toFixed(0)}%` : 'N/A';
      console.log(`  [${confStr}] ${marker.date.toISOString().split('T')[0]}: ${marker.description}`);
    });

  console.log('\n=== Analysis Complete ===');
}

// Run example
example().catch(console.error);
