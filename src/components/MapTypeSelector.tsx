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
    description: 'Dynamic day/night with atmospheric effects'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '◻️',
    description: 'Clean, neutral canvas for overlays'
  },
  {
    id: 'data',
    name: 'Data Viz',
    icon: '📊',
    description: '3D data visualization'
  },
  {
    id: 'nolli',
    name: 'Nolli',
    icon: '🏛️',
    description: 'Public/private space analysis'
  },
  {
    id: 'figure-ground',
    name: 'Figure Ground',
    icon: '⬛',
    description: 'Building footprints diagram'
  },
  {
    id: 'lulc',
    name: 'LULC',
    icon: '🌿',
    description: 'Land use / land cover'
  },
  {
    id: 'sunpath',
    name: 'Sun Path',
    icon: '☀️',
    description: 'Solar analysis & shadows'
  }
];

export function MapTypeSelector({ currentStyle, onStyleChange, onReset }: MapTypeSelectorProps) {
  return (
    <div className="bg-[#e8ecef] border-b border-neutral-200/50 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-2">
          Map Type
        </span>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {mapTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onStyleChange(type.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                whitespace-nowrap transition-all duration-200
                ${currentStyle === type.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white/60 text-neutral-600 hover:bg-white hover:shadow-sm'
                }
              `}
              title={type.description}
            >
              <span>{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
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
    </div>
  );
}
