'use client';

import React from 'react';
import { NeomorphicCard } from './ui';
import type { MapStyle } from '@/types';

interface StyleSelectorProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const styles: { id: MapStyle; name: string; description: string; icon: string }[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Dynamic day/night lighting with atmospheric effects',
    icon: '🎬'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, neutral canvas perfect for overlays',
    icon: '🎨'
  },
  {
    id: 'data',
    name: 'Data Viz',
    description: '3D data visualization with extruded overlays',
    icon: '📊'
  }
];

export function StyleSelector({ currentStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
        Map Style
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {styles.map((style) => (
          <NeomorphicCard
            key={style.id}
            variant={currentStyle === style.id ? 'inset' : 'raised'}
            padding="sm"
            onClick={() => onStyleChange(style.id)}
            hoverable
            className={`
              text-center cursor-pointer transition-all duration-200
              ${currentStyle === style.id ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            <div className="text-2xl mb-1">{style.icon}</div>
            <div className="text-xs font-medium text-neutral-700">{style.name}</div>
          </NeomorphicCard>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        {styles.find(s => s.id === currentStyle)?.description}
      </p>
    </div>
  );
}
