'use client';

import React from 'react';
import type { DataLayer, ColorScheme } from '@/types';

interface MapLegendProps {
  dataLayer: DataLayer;
  colorScheme: ColorScheme;
  isVisible: boolean;
}

const colorGradients: Record<ColorScheme, string[]> = {
  heat: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
  cool: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b'],
  viridis: ['#440154', '#3b528b', '#21908d', '#5dc863', '#fde725'],
  plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636']
};

const dataLayerLabels: Record<DataLayer, { title: string; lowLabel: string; highLabel: string }> = {
  elevation: {
    title: 'Elevation',
    lowLabel: 'Low',
    highLabel: 'High'
  },
  population: {
    title: 'Population Density',
    lowLabel: 'Low',
    highLabel: 'High'
  },
  landcover: {
    title: 'Land Cover',
    lowLabel: 'Forest',
    highLabel: 'Urban/Agri'
  },
  none: {
    title: '',
    lowLabel: '',
    highLabel: ''
  }
};

export function MapLegend({ dataLayer, colorScheme, isVisible }: MapLegendProps) {
  if (!isVisible || dataLayer === 'none') {
    return null;
  }

  const colors = colorGradients[colorScheme];
  const labels = dataLayerLabels[dataLayer];
  const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

  return (
    <div className="absolute bottom-12 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="text-xs font-semibold text-neutral-700 mb-2">
        {labels.title}
      </div>

      {/* Color bar */}
      <div
        className="h-3 rounded-sm mb-1"
        style={{ background: gradient }}
      />

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-neutral-500">
        <span>{labels.lowLabel}</span>
        <span>{labels.highLabel}</span>
      </div>

      {/* Data source */}
      <div className="mt-2 pt-2 border-t border-neutral-200">
        <div className="text-[9px] text-neutral-400">
          {dataLayer === 'elevation' && 'Source: AWS Terrain Tiles'}
          {dataLayer === 'population' && 'Source: Terrain-based proxy'}
          {dataLayer === 'landcover' && 'Source: Terrain-based proxy'}
        </div>
      </div>
    </div>
  );
}
