import React from 'react';
import { TimingMarker } from '../../models/types';

interface TimingMarkersListProps {
  markers: TimingMarker[];
}

const getTypeColor = (type: TimingMarker['type']) => {
  switch (type) {
    case 'aspect':
      return 'bg-primary-500 text-primary-100';
    case 'angular_displacement':
      return 'bg-accent-500 text-accent-100';
    case 'eclipse_projection':
      return 'bg-slate-600 text-slate-100';
    default:
      return 'bg-slate-700 text-slate-200';
  }
};

const getTypeLabel = (type: TimingMarker['type']) => {
  switch (type) {
    case 'aspect':
      return 'Aspect';
    case 'angular_displacement':
      return 'Displacement';
    case 'eclipse_projection':
      return 'Eclipse';
    default:
      return 'Marker';
  }
};

const getConfidenceColor = (confidence: number | undefined) => {
  if (!confidence) return 'text-slate-400';
  if (confidence >= 0.9) return 'text-green-400';
  if (confidence >= 0.8) return 'text-accent-400';
  return 'text-slate-400';
};

export default function TimingMarkersList({ markers }: TimingMarkersListProps) {
  const sortedMarkers = [...markers].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="card mt-8">
      <h2 className="mb-6 text-xl font-semibold text-slate-100">
        Timing Markers ({markers.length})
      </h2>

      <div className="space-y-4">
        {sortedMarkers.map((marker, idx) => (
          <div
            key={idx}
            className="group relative flex items-start gap-4 rounded-lg border border-slate-700 bg-slate-700 bg-opacity-20 p-4 transition-all hover:border-slate-600 hover:bg-opacity-30"
          >
            {/* Timeline dot */}
            <div className="relative pt-1">
              <div className="flex h-3 w-3 items-center justify-center">
                <div className="h-3 w-3 rounded-full border-2 border-slate-600 bg-slate-800" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTypeColor(
                      marker.type
                    )}`}>
                      {getTypeLabel(marker.type)}
                    </span>
                    {marker.confidence !== undefined && (
                      <span className={`text-xs font-medium ${getConfidenceColor(marker.confidence)}`}>
                        {(marker.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-300">{marker.description}</p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-4">
                  <time className="whitespace-nowrap rounded-lg bg-slate-600 bg-opacity-30 px-3 py-1 text-sm font-medium text-slate-200">
                    {marker.date.toISOString().split('T')[0]}
                  </time>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {markers.length === 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-700 bg-opacity-20 p-8 text-center">
          <p className="text-slate-400">No timing markers found</p>
        </div>
      )}
    </div>
  );
}
