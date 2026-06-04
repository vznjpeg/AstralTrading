import { TimingMarker } from '../models/types';

export type TradingSignal = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' | 'NEUTRAL';

export interface TradingRecommendation {
  signal: TradingSignal;
  confidence: number; // 0-1
  reasoning: string;
  action: string; // Plain language action
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
}

export class SignalGenerator {
  /**
   * Generate trading signals from timing markers
   */
  generateSignals(markers: TimingMarker[]): TradingRecommendation[] {
    const signals: TradingRecommendation[] = [];

    // Group markers by date
    const markersByDate = new Map<string, TimingMarker[]>();
    markers.forEach(marker => {
      const dateStr = marker.date.toISOString().split('T')[0];
      if (!markersByDate.has(dateStr)) {
        markersByDate.set(dateStr, []);
      }
      markersByDate.get(dateStr)!.push(marker);
    });

    // Generate signal for each date cluster
    markersByDate.forEach((dayMarkers, dateStr) => {
      const signal = this.analyzeMarkerCluster(dayMarkers, new Date(dateStr));
      if (signal) {
        signals.push(signal);
      }
    });

    return signals.sort((a, b) => parseFloat(b.confidence.toFixed(2)) - parseFloat(a.confidence.toFixed(2)));
  }

  private analyzeMarkerCluster(markers: TimingMarker[], date: Date): TradingRecommendation | null {
    const avgConfidence = markers.reduce((sum, m) => sum + (m.confidence || 0), 0) / markers.length;
    const types = new Map<string, number>();

    markers.forEach(m => {
      const count = types.get(m.type) || 0;
      types.set(m.type, count + 1);
    });

    // Determine signal based on marker types and confidence
    if (types.has('eclipse_projection') && avgConfidence >= 0.85) {
      return {
        signal: 'STRONG_BUY',
        confidence: Math.min(1, avgConfidence + 0.1),
        reasoning: 'Eclipse timing with multiple confirmations suggests strong reversal point',
        action: 'Consider entering a position. This is a high-confidence timing marker.',
        riskLevel: 'MEDIUM',
        timeframe: 'Next 1-3 days',
      };
    }

    if (types.has('aspect') && types.get('aspect')! >= 2 && avgConfidence >= 0.8) {
      return {
        signal: 'BUY',
        confidence: avgConfidence,
        reasoning: 'Multiple planetary aspects form around this date - momentum shift expected',
        action: 'Look for buying opportunities. This date shows increased market activity potential.',
        riskLevel: 'MEDIUM',
        timeframe: 'Next 2-5 days',
      };
    }

    if (types.has('angular_displacement') && avgConfidence >= 0.85) {
      return {
        signal: 'BUY',
        confidence: avgConfidence,
        reasoning: 'Planet reaches key phase (90°/180°/270°/360°) - structural shift point',
        action: 'Watch for trend changes on this date. A good time to re-evaluate your position.',
        riskLevel: 'LOW',
        timeframe: 'Next 3-7 days',
      };
    }

    if (avgConfidence >= 0.9 && markers.length >= 2) {
      return {
        signal: 'STRONG_SELL',
        confidence: avgConfidence,
        reasoning: 'Multiple timing indicators converge - major reversal likely',
        action: 'Strong evidence of trend reversal. Consider reducing risk exposure.',
        riskLevel: 'HIGH',
        timeframe: 'Next 1-2 days',
      };
    }

    if (avgConfidence >= 0.8) {
      return {
        signal: 'HOLD',
        confidence: avgConfidence,
        reasoning: 'Timing marker detected but not high conviction',
        action: 'Hold your current position and monitor price action around this date.',
        riskLevel: 'LOW',
        timeframe: 'Next 5-10 days',
      };
    }

    return null;
  }

  /**
   * Generate overall market outlook
   */
  generateOutlook(signals: TradingRecommendation[], markerCount: number): {
    outlook: string;
    description: string;
    recommendation: string;
  } {
    const strongBuys = signals.filter(s => s.signal === 'STRONG_BUY').length;
    const buys = signals.filter(s => s.signal === 'BUY').length;
    const holds = signals.filter(s => s.signal === 'HOLD').length;
    const sells = signals.filter(s => s.signal === 'SELL').length;
    const strongSells = signals.filter(s => s.signal === 'STRONG_SELL').length;

    const bullishScore = strongBuys * 2 + buys - sells - strongSells * 2;
    const totalSignals = signals.length;

    if (markerCount === 0) {
      return {
        outlook: 'INSUFFICIENT DATA',
        description: 'No timing markers found in the selected period.',
        recommendation: 'Try expanding your date range or adjusting your reference points.',
      };
    }

    if (bullishScore > totalSignals * 0.6) {
      return {
        outlook: '🟢 BULLISH',
        description: `Multiple buy signals detected. The period shows ${strongBuys} strong buy opportunities and ${buys} buy signals.`,
        recommendation: 'This is a favorable period for entering long positions. Look for dips to buy.',
      };
    }

    if (bullishScore < -totalSignals * 0.6) {
      return {
        outlook: '🔴 BEARISH',
        description: `Strong sell signals detected. The period shows ${strongSells} reversal points and ${sells} sell signals.`,
        recommendation: 'Be cautious about new longs. Consider reducing exposure or waiting for better entry points.',
      };
    }

    return {
      outlook: '⚪ MIXED',
      description: `Mixed signals throughout the period. ${buys} buying opportunities and ${sells} reversal points detected.`,
      recommendation: 'Use smaller positions and tight stop losses. Focus on high-conviction signals only.',
    };
  }
}
