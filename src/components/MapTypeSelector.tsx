'use client';

import React from 'react';
import type { MapStyle } from '@/types';

interface MapTypeSelectorProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  onReset: () => void;
}

const mapTypes: { id: MapStyle; name: string; icon: string; gradient: string; description: string }[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    gradient: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)',
    description: 'Dynamic day/night lighting with atmospheric haze'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '◻️',
    gradient: 'linear-gradient(135deg, #e2e8f0, #cbd5e1, #94a3b8)',
    description: 'Clean, neutral canvas ideal for data overlays'
  },
  {
    id: 'data',
    name: 'Data Viz',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)',
    description: '3D terrain with customizable color schemes'
  },
  {
    id: 'nolli',
    name: 'Nolli',
    icon: '🏛️',
    gradient: 'linear-gradient(135deg, #f5f5f5, #d4d4d4, #404040)',
    description: 'Urban form - public vs private space'
  },
  {
    id: 'figure-ground',
    name: 'Figure Ground',
    icon: '⬛',
    gradient: 'linear-gradient(135deg, #18181b, #3f3f46, #fafafa)',
    description: 'Built mass against open space'
  },
  {
    id: 'lulc',
    name: 'LULC',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #166534, #22c55e, #86efac)',
    description: 'Land use and land cover visualization'
  },
  {
    id: 'sunpath',
    name: 'Sun Path',
    icon: '☀️',
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
    description: 'Solar analysis with animated shadows'
  },
  {
    id: 'isochrone',
    name: 'Isochrone',
    icon: '⏱️',
    gradient: 'linear-gradient(135deg, #14b8a6, #06b6d4, #0284c7)',
    description: 'Travel time zone visualization'
  },
  {
    id: 'comparison',
    name: 'Compare',
    icon: '↔️',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
    description: 'Swipe slider to compare time periods'
  },
  {
    id: 'roads',
    name: 'Roads',
    icon: '🛣️',
    gradient: 'linear-gradient(135deg, #475569, #64748b, #94a3b8)',
    description: 'Road network density analysis'
  },
  {
    id: 'tree-canopy',
    name: 'Tree Canopy',
    icon: '🌳',
    gradient: 'linear-gradient(135deg, #065f46, #059669, #34d399)',
    description: 'Urban forest density visualization'
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    icon: '🗼',
    gradient: 'linear-gradient(135deg, #1e3a5f, #0ea5e9, #38bdf8)',
    description: 'Dramatic coastal with animated beams'
  },
  {
    id: '3d-city',
    name: '3D City',
    icon: '🏙️',
    gradient: 'linear-gradient(135deg, #312e81, #6366f1, #c084fc)',
    description: 'Stylized 3D city with extruded buildings'
  }
];

export function MapTypeSelector({ currentStyle, onStyleChange, onReset }: MapTypeSelectorProps) {
  return (
    <div className="map-type-bar bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {mapTypes.map((type) => {
            const isActive = currentStyle === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onStyleChange(type.id)}
                className={`
                  group relative flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
                  whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? 'text-white scale-[1.02]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)]'
                  }
                `}
                style={isActive ? { background: type.gradient } : undefined}
                title={type.description}
              >
                {/* Mini gradient preview dot */}
                {!isActive && (
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-[var(--border-subtle)]"
                    style={{ background: type.gradient }}
                  />
                )}
                <span className="hidden sm:inline">{type.name}</span>
                <span className="sm:hidden text-sm">{type.icon}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium
            bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]
            border border-[var(--border-subtle)]
            transition-all duration-200 whitespace-nowrap"
          title="Reset to default view"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
