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

// ESRI 10m Land Cover classification colors
const landcoverClasses = [
  { color: '#006400', label: 'Trees', value: 10 },
  { color: '#ffbb22', label: 'Shrubland', value: 20 },
  { color: '#ffff4c', label: 'Grassland', value: 30 },
  { color: '#f096ff', label: 'Cropland', value: 40 },
  { color: '#fa0000', label: 'Built-up', value: 50 },
  { color: '#b4b4b4', label: 'Bare/Sparse', value: 60 },
  { color: '#f0f0f0', label: 'Snow/Ice', value: 70 },
  { color: '#0064c8', label: 'Water', value: 80 },
  { color: '#0096a0', label: 'Wetland', value: 90 },
  { color: '#00cf75', label: 'Mangroves', value: 95 }
];

const dataLayerLabels: Record<DataLayer, {
  title: string;
  lowLabel: string;
  highLabel: string;
  source: string;
  sourceUrl?: string;
}> = {
  elevation: {
    title: 'Elevation',
    lowLabel: 'Low',
    highLabel: 'High',
    source: 'AWS Terrain Tiles (Mapzen)',
    sourceUrl: 'https://registry.opendata.aws/terrain-tiles/'
  },
  population: {
    title: 'Population Density',
    lowLabel: 'Low',
    highLabel: 'High',
    source: 'GHSL / EU JRC',
    sourceUrl: 'https://ghsl.jrc.ec.europa.eu/'
  },
  landcover: {
    title: 'Land Cover (2022)',
    lowLabel: '',
    highLabel: '',
    source: 'ESRI 10m Land Cover',
    sourceUrl: 'https://www.arcgis.com/home/item.html?id=d6642f8a4f6d4685a24ae2dc0c73d4ac'
  },
  none: {
    title: '',
    lowLabel: '',
    highLabel: '',
    source: ''
  }
};

export function MapLegend({ dataLayer, colorScheme, isVisible }: MapLegendProps) {
  if (!isVisible || dataLayer === 'none') {
    return null;
  }

  const colors = colorGradients[colorScheme];
  const labels = dataLayerLabels[dataLayer];

  // Special rendering for land cover (categorical data)
  if (dataLayer === 'landcover') {
    return (
      <div className="absolute bottom-12 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[160px] max-w-[200px]">
        <div className="text-xs font-semibold text-neutral-700 mb-2">
          {labels.title}
        </div>

        {/* Categorical legend */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2">
          {landcoverClasses.map((cls) => (
            <div key={cls.value} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 border border-neutral-200"
                style={{ backgroundColor: cls.color }}
              />
              <span className="text-[10px] text-neutral-600 truncate">{cls.label}</span>
            </div>
          ))}
        </div>

        {/* Data source */}
        <div className="pt-2 border-t border-neutral-200">
          <div className="text-[9px] text-neutral-400 flex items-center gap-1">
            <span>Source:</span>
            {labels.sourceUrl ? (
              <a
                href={labels.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {labels.source}
              </a>
            ) : (
              <span>{labels.source}</span>
            )}
          </div>
          <div className="text-[8px] text-neutral-300 mt-0.5">
            10m resolution, Sentinel-2 derived
          </div>
        </div>
      </div>
    );
  }

  // Gradient legend for continuous data (elevation, population)
  const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

  return (
    <div className="absolute bottom-12 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="text-xs font-semibold text-neutral-700 mb-2">
        {labels.title}
      </div>

      {/* Color bar */}
      <div
        className="h-3 rounded-sm mb-1 border border-neutral-200"
        style={{ background: gradient }}
      />

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-neutral-500">
        <span>{labels.lowLabel}</span>
        <span>{labels.highLabel}</span>
      </div>

      {/* Data source */}
      <div className="mt-2 pt-2 border-t border-neutral-200">
        <div className="text-[9px] text-neutral-400 flex items-center gap-1">
          <span>Source:</span>
          {labels.sourceUrl ? (
            <a
              href={labels.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {labels.source}
            </a>
          ) : (
            <span>{labels.source}</span>
          )}
        </div>
        {dataLayer === 'population' && (
          <div className="text-[8px] text-neutral-300 mt-0.5">
            100m resolution grid
          </div>
        )}
        {dataLayer === 'elevation' && (
          <div className="text-[8px] text-neutral-300 mt-0.5">
            30m resolution DEM
          </div>
        )}
      </div>
    </div>
  );
}
