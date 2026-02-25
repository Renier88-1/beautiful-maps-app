'use client';

import React from 'react';
import type { MapStyle } from '@/types';

interface MapTypeSelectorProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  onReset: () => void;
}

const mapTypes: { id: MapStyle; name: string; icon: string; description: string }[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    description: 'Dynamic day/night lighting with atmospheric haze and dramatic shadows'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '◻️',
    description: 'Clean, neutral canvas ideal for data overlays and focused analysis'
  },
  {
    id: 'data',
    name: 'Data Viz',
    icon: '📊',
    description: '3D terrain visualization with customizable color schemes for data storytelling'
  },
  {
    id: 'nolli',
    name: 'Nolli',
    icon: '🏛️',
    description: 'Urban form analysis showing public vs private space in high contrast'
  },
  {
    id: 'figure-ground',
    name: 'Figure Ground',
    icon: '⬛',
    description: 'Architectural diagram emphasizing built mass against open space'
  },
  {
    id: 'lulc',
    name: 'LULC',
    icon: '🌿',
    description: 'Land use and land cover visualization showing vegetation, urban, and water areas'
  },
  {
    id: 'sunpath',
    name: 'Sun Path',
    icon: '☀️',
    description: 'Solar analysis showing shadow patterns throughout the day with animated playback'
  },
  {
    id: 'isochrone',
    name: 'Isochrone',
    icon: '⏱️',
    description: 'Click to generate travel time zones showing walkable, bikeable, or drivable distances'
  },
  {
    id: 'comparison',
    name: 'Compare',
    icon: '↔️',
    description: 'Swipe slider to visually compare different time periods side by side'
  },
  {
    id: 'roads',
    name: 'Roads',
    icon: '🛣️',
    description: 'Road network density and connectivity analysis with traffic flow visualization'
  },
  {
    id: 'tree-canopy',
    name: 'Tree Canopy',
    icon: '🌳',
    description: 'Urban forest density visualization with hexagonal binning and canopy coverage'
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    icon: '🗼',
    description: 'Dramatic coastal visualization with animated lighthouse beams and atmospheric fog'
  },
  {
    id: '3d-city',
    name: '3D City',
    icon: '🏙️',
    description: 'Stylized 3D city rendering inspired by Milos Makes Maps with extruded buildings'
  }
];

export function MapTypeSelector({ currentStyle, onStyleChange, onReset }: MapTypeSelectorProps) {
  const currentType = mapTypes.find(t => t.id === currentStyle);

  return (
    <div className="bg-[#e8ecef] border-b border-neutral-200/50">
      {/* Map type buttons row */}
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-1 hidden sm:block">
          Type
        </span>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-300">
          {mapTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onStyleChange(type.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                whitespace-nowrap transition-all duration-200
                ${currentStyle === type.id
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'bg-white/60 text-neutral-600 hover:bg-white hover:shadow-sm'
                }
              `}
              title={type.description}
            >
              <span className="text-base">{type.icon}</span>
              <span className="hidden sm:inline">{type.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium
            bg-neutral-200/60 text-neutral-600 hover:bg-neutral-300/60
            transition-all duration-200 whitespace-nowrap"
          title="Reset to default view"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Description row */}
      {currentType && (
        <div className="px-4 pb-2">
          <p className="text-xs italic text-neutral-500 leading-relaxed">
            <span className="font-semibold text-neutral-600 not-italic">{currentType.name}:</span>{' '}
            {currentType.description}
          </p>
        </div>
      )}
    </div>
  );
}
