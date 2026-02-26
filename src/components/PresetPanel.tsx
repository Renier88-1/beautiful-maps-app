'use client';

import React from 'react';
import type { MapPreset } from '@/types';

interface PresetPanelProps {
  onApplyPreset: (preset: MapPreset) => void;
}

const presets: MapPreset[] = [
  {
    id: 'minimalist-city',
    name: 'Minimalist City Print',
    description: 'Clean white background with dark roads. Classic Etsy bestseller.',
    thumbnail: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #94a3b8)',
    style: 'minimalist',
    pitch: 0,
    bearing: 0,
    zoom: 13,
    textOverlay: {
      enabled: true,
      titleFontFamily: 'serif',
      titleFontSize: 64,
      titleColor: '#1e293b',
      titlePosition: 'bottom-center',
      titleUppercase: true,
      titleLetterSpacing: 12,
      showCoordinates: true,
      subtitleFontFamily: 'mono',
      subtitleFontSize: 14,
      subtitleColor: '#64748b',
      frameStyle: 'thin',
      frameColor: '#1e293b',
      framePadding: 30,
    },
    styleSettings: { colorTheme: 'light', basemap: 'carto-light' }
  },
  {
    id: 'neon-cityscape',
    name: 'Neon Cityscape',
    description: 'Dark cyberpunk style with glowing buildings. Eye-catching wall art.',
    thumbnail: 'linear-gradient(135deg, #0f172a, #4c1d95, #c026d3)',
    style: '3d-city',
    pitch: 60,
    bearing: -30,
    zoom: 14,
    textOverlay: {
      enabled: true,
      titleFontFamily: 'sans',
      titleFontSize: 72,
      titleColor: '#e879f9',
      titlePosition: 'bottom-left',
      titleUppercase: true,
      titleLetterSpacing: 8,
      showCoordinates: true,
      subtitleFontFamily: 'mono',
      subtitleFontSize: 12,
      subtitleColor: '#a78bfa',
      frameStyle: 'none',
      framePadding: 20,
    },
    styleSettings: { renderStyle: 'neon', basemap: 'carto-dark-nolabels', colorScheme: 'plasma' }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm sunset cinematic lighting. Premium feel.',
    thumbnail: 'linear-gradient(135deg, #f97316, #f59e0b, #fbbf24)',
    style: 'cinematic',
    pitch: 50,
    bearing: -20,
    zoom: 13,
    textOverlay: {
      enabled: true,
      titleFontFamily: 'serif',
      titleFontSize: 56,
      titleColor: '#ffffff',
      titlePosition: 'bottom-center',
      titleUppercase: false,
      titleLetterSpacing: 4,
      showCoordinates: false,
      subtitle: '',
      subtitleFontSize: 16,
      subtitleColor: '#fef3c7',
      frameStyle: 'none',
      framePadding: 20,
    },
    styleSettings: { timeOfDay: 18, basemap: 'osm' }
  },
  {
    id: 'urban-blueprint',
    name: 'Urban Blueprint',
    description: 'Technical blueprint style with white roads on deep blue.',
    thumbnail: 'linear-gradient(135deg, #0c1e3f, #1e3a5f, #2563eb)',
    style: '3d-city',
    pitch: 45,
    bearing: 0,
    zoom: 14,
    textOverlay: {
      enabled: true,
      titleFontFamily: 'mono',
      titleFontSize: 48,
      titleColor: '#93c5fd',
      titlePosition: 'top-left',
      titleUppercase: true,
      titleLetterSpacing: 6,
      showCoordinates: true,
      subtitleFontFamily: 'mono',
      subtitleFontSize: 11,
      subtitleColor: '#60a5fa',
      frameStyle: 'double',
      frameColor: '#3b82f6',
      framePadding: 24,
    },
    styleSettings: { renderStyle: 'blueprint', basemap: 'carto-dark-nolabels' }
  },
  {
    id: 'nature-topo',
    name: 'Nature Topographic',
    description: 'Earthy terrain visualization. Great for hiking/nature lovers.',
    thumbnail: 'linear-gradient(135deg, #365314, #65a30d, #d9f99d)',
    style: 'data',
    pitch: 55,
    bearing: -15,
    zoom: 11,
    textOverlay: {
      enabled: true,
      titleFontFamily: 'serif',
      titleFontSize: 52,
      titleColor: '#ffffff',
      titlePosition: 'bottom-left',
      titleUppercase: false,
      titleLetterSpacing: 3,
      showCoordinates: true,
      subtitleFontFamily: 'sans',
      subtitleFontSize: 13,
      subtitleColor: '#d9f99d',
      frameStyle: 'none',
      framePadding: 20,
    },
    styleSettings: { dataLayer: 'elevation', colorScheme: 'viridis', basemap: 'opentopo' }
  },
  {
    id: 'midnight-noir',
    name: 'Midnight Noir',
    description: 'Dark & moody figure-ground style. Sophisticated wall art.',
    thumbnail: 'linear-gradient(135deg, #09090b, #18181b, #3f3f46)',
    style: 'figure-ground',
    pitch: 0,
    bearing: 0,
    zoom: 14,
    textOverlay: {
      enabled: true,
      titleFontFamily: 'sans',
      titleFontSize: 60,
      titleColor: '#ffffff',
      titlePosition: 'bottom-center',
      titleUppercase: true,
      titleLetterSpacing: 16,
      showCoordinates: true,
      subtitleFontFamily: 'mono',
      subtitleFontSize: 12,
      subtitleColor: '#a1a1aa',
      frameStyle: 'thin',
      frameColor: '#52525b',
      framePadding: 32,
    },
    styleSettings: { basemap: 'carto-dark-nolabels' }
  }
];

export function PresetPanel({ onApplyPreset }: PresetPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)]">
        One-click styles optimized for Etsy & print-on-demand. Applies map style, camera angle, and text overlay.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset)}
            className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all duration-200 hover:scale-[1.02] text-left"
          >
            {/* Thumbnail */}
            <div
              className="h-20 w-full"
              style={{ background: preset.thumbnail }}
            />
            {/* Info */}
            <div className="p-2 bg-[var(--bg-card)]">
              <div className="text-xs font-medium text-[var(--text-primary)] leading-tight">
                {preset.name}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                {preset.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
