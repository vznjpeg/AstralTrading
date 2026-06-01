import { EclipseAnchor, TimingMarker } from '../models/types';

/**
 * EclipseAnchorEngine handles Eclipse Anchor Timing Model
 *
 * Uses solar/lunar eclipses as synchronized reference points:
 * 1. Eclipse date (time 0)
 * 2. First observable market reaction (time 1)
 * 3. Interval = time 1 - time 0
 * 4. Project forward: Time(n) = Time(0) + n × interval
 */
export class EclipseAnchorEngine {
  /**
   * Create an eclipse anchor from reference eclipse date
   */
  createEclipseAnchor(
    type: 'solar' | 'lunar',
    eclipseDate: Date
  ): EclipseAnchor {
    return {
      type,
      date: eclipseDate,
    };
  }

  /**
   * Set the first reaction point and calculate interval
   */
  calibrateWithFirstReaction(
    anchor: EclipseAnchor,
    firstReactionDate: Date
  ): EclipseAnchor {
    const intervalDays = Math.round(
      (firstReactionDate.getTime() - anchor.date.getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      ...anchor,
      firstReactionDate,
      intervalDays,
    };
  }

  /**
   * Project forward using the calibrated interval
   * Formula: Time(n) = Time(0) + n × interval
   * where n = 1, 2, 3, 4, ...
   */
  projectForwardDates(
    anchor: EclipseAnchor,
    numberOfProjections: number = 4
  ): EclipseAnchor {
    if (!anchor.intervalDays) {
      throw new Error('Anchor must be calibrated with firstReactionDate before projecting');
    }

    const projectedDates: Date[] = [];

    for (let n = 1; n <= numberOfProjections; n++) {
      const daysOffset = anchor.intervalDays * n;
      const projectedDate = new Date(
        anchor.date.getTime() + daysOffset * 24 * 60 * 60 * 1000
      );
      projectedDates.push(projectedDate);
    }

    return {
      ...anchor,
      projectedDates,
    };
  }

  /**
   * Convert eclipse anchor to timing markers for chart visualization
   */
  anchorToTimingMarkers(anchor: EclipseAnchor): TimingMarker[] {
    const markers: TimingMarker[] = [];

    // Eclipse reference point
    markers.push({
      date: anchor.date,
      type: 'eclipse_projection',
      description: `${anchor.type === 'solar' ? 'Solar' : 'Lunar'} Eclipse - Reference Point (Time 0)`,
      confidence: 1.0,
    });

    // First reaction point
    if (anchor.firstReactionDate) {
      markers.push({
        date: anchor.firstReactionDate,
        type: 'eclipse_projection',
        description: `First Reaction (Time 1) - Interval: ${anchor.intervalDays} days`,
        confidence: 0.95,
      });
    }

    // Projected dates
    if (anchor.projectedDates) {
      anchor.projectedDates.forEach((date, index) => {
        const n = index + 1;
        markers.push({
          date,
          type: 'eclipse_projection',
          description: `Projected Time(${n}) = Time(0) + ${n} × ${anchor.intervalDays} days`,
          confidence: 0.85 - (index * 0.05), // Confidence decreases for further projections
        });
      });
    }

    return markers;
  }

  /**
   * Validate eclipse anchor has required data
   */
  isValidAnchor(anchor: EclipseAnchor): boolean {
    return !!(anchor.date && anchor.firstReactionDate && anchor.intervalDays);
  }

  /**
   * Format anchor information for display
   */
  formatAnchorInfo(anchor: EclipseAnchor): string {
    const lines = [
      `Eclipse Type: ${anchor.type === 'solar' ? 'Solar' : 'Lunar'}`,
      `Eclipse Date (Time 0): ${anchor.date.toISOString().split('T')[0]}`,
    ];

    if (anchor.firstReactionDate) {
      lines.push(`First Reaction (Time 1): ${anchor.firstReactionDate.toISOString().split('T')[0]}`);
    }

    if (anchor.intervalDays) {
      lines.push(`Interval: ${anchor.intervalDays} days`);
    }

    if (anchor.projectedDates && anchor.projectedDates.length > 0) {
      lines.push('\nProjected Dates:');
      anchor.projectedDates.forEach((date, index) => {
        lines.push(`  Time(${index + 1}): ${date.toISOString().split('T')[0]}`);
      });
    }

    return lines.join('\n');
  }
}
