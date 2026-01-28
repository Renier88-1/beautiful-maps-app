'use client';

import React from 'react';
import { NeomorphicSlider, NeomorphicSelect, NeomorphicCard } from './ui';
import type { MapStyle, CinematicSettings, MinimalistSettings, DataSettings, Basemap, DataLayer, ColorScheme } from '@/types';

interface StylePanelProps {
  currentStyle: MapStyle;
  cinematicSettings: CinematicSettings;
  minimalistSettings: MinimalistSettings;
  dataSettings: DataSettings;
  onCinematicChange: (settings: Partial<CinematicSettings>) => void;
  onMinimalistChange: (settings: Partial<MinimalistSettings>) => void;
  onDataChange: (settings: Partial<DataSettings>) => void;
}

const basemapOptions = [
  { value: 'osm', label: 'OpenStreetMap' },
  { value: 'carto-light', label: 'CARTO Positron' },
  { value: 'carto-dark', label: 'CARTO Dark Matter' },
  { value: 'carto-voyager', label: 'CARTO Voyager' },
  { value: 'carto-dark-nolabels', label: 'CARTO Dark (No Labels)' }
];

const dataLayerOptions = [
  { value: 'none', label: 'None' },
  { value: 'elevation', label: 'Elevation' },
  { value: 'population', label: 'Population Density' },
  { value: 'landcover', label: 'Land Cover' }
];

const colorSchemeOptions = [
  { value: 'heat', label: 'Heat (Red-Yellow)' },
  { value: 'cool', label: 'Cool (Blue)' },
  { value: 'viridis', label: 'Viridis' },
  { value: 'plasma', label: 'Plasma' }
];

const dataLayerInfo: Record<string, { source: string; description: string }> = {
  elevation: {
    source: 'AWS Terrain Tiles (Mapzen)',
    description: 'Terrain elevation visualization. Higher areas shown in warmer colors.'
  },
  population: {
    source: 'WorldPop / GHSL',
    description: 'Population density overlay. Denser areas shown with stronger coloring.'
  },
  landcover: {
    source: 'ESA WorldCover',
    description: 'Land use classification showing urban, forest, water, and agricultural areas.'
  },
  none: { source: '', description: '' }
};

const colorGradients: Record<ColorScheme, string> = {
  heat: 'linear-gradient(to right, #fee5d9, #fcae91, #fb6a4a, #de2d26, #a50f15)',
  cool: 'linear-gradient(to right, #f7fbff, #c6dbef, #6baed6, #2171b5, #08306b)',
  viridis: 'linear-gradient(to right, #440154, #3b528b, #21908d, #5dc863, #fde725)',
  plasma: 'linear-gradient(to right, #0d0887, #6a00a8, #b12a90, #e16462, #fca636)'
};

// Shared Data Layer Controls Component
function DataLayerControls({
  dataLayer,
  colorScheme,
  onDataLayerChange,
  onColorSchemeChange
}: {
  dataLayer: DataLayer;
  colorScheme: ColorScheme;
  onDataLayerChange: (layer: DataLayer) => void;
  onColorSchemeChange: (scheme: ColorScheme) => void;
}) {
  return (
    <div className="space-y-3 pt-2 border-t border-neutral-200">
      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        Data Overlay
      </h4>

      <NeomorphicSelect
        label="Data Layer"
        value={dataLayer}
        onChange={(value) => onDataLayerChange(value as DataLayer)}
        options={dataLayerOptions}
      />

      {dataLayer !== 'none' && (
        <>
          {dataLayerInfo[dataLayer] && (
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-medium text-blue-700">
                {dataLayerInfo[dataLayer].source}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {dataLayerInfo[dataLayer].description}
              </p>
            </div>
          )}

          <NeomorphicSelect
            label="Color Scheme"
            value={colorScheme}
            onChange={(value) => onColorSchemeChange(value as ColorScheme)}
            options={colorSchemeOptions}
          />

          <div>
            <div className="text-xs text-neutral-500 mb-1">Color Preview</div>
            <div
              className="h-3 rounded-lg overflow-hidden"
              style={{ background: colorGradients[colorScheme] }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function StylePanel({
  currentStyle,
  cinematicSettings,
  minimalistSettings,
  dataSettings,
  onCinematicChange,
  onMinimalistChange,
  onDataChange
}: StylePanelProps) {
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const getCurrentBasemap = (): Basemap => {
    if (currentStyle === 'cinematic') return cinematicSettings.basemap;
    if (currentStyle === 'minimalist') return minimalistSettings.basemap;
    return dataSettings.basemap;
  };

  const handleBasemapChange = (basemap: Basemap) => {
    if (currentStyle === 'cinematic') {
      onCinematicChange({ basemap });
    } else if (currentStyle === 'minimalist') {
      onMinimalistChange({ basemap });
    } else {
      onDataChange({ basemap });
    }
  };

  return (
    <NeomorphicCard variant="raised" padding="md" className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
        Style Settings
      </h3>

      {/* Basemap selector - available for all styles */}
      <NeomorphicSelect
        label="Basemap"
        value={getCurrentBasemap()}
        onChange={(value) => handleBasemapChange(value as Basemap)}
        options={basemapOptions}
      />

      {currentStyle === 'cinematic' && (
        <div className="space-y-4">
          <NeomorphicSlider
            label="Time of Day"
            value={cinematicSettings.timeOfDay}
            onChange={(value) => onCinematicChange({ timeOfDay: value })}
            min={0}
            max={24}
            step={0.5}
            formatValue={formatTime}
          />

          <div className="grid grid-cols-4 gap-2">
            {[
              { time: 6, label: 'Dawn', emoji: '🌅' },
              { time: 12, label: 'Noon', emoji: '☀️' },
              { time: 18, label: 'Dusk', emoji: '🌇' },
              { time: 22, label: 'Night', emoji: '🌙' }
            ].map((preset) => (
              <button
                key={preset.time}
                onClick={() => onCinematicChange({ timeOfDay: preset.time })}
                className={`
                  p-2 rounded-lg text-center transition-all duration-200
                  ${cinematicSettings.timeOfDay === preset.time
                    ? 'bg-blue-100 shadow-inner'
                    : 'bg-neutral-50 hover:bg-neutral-100'
                  }
                `}
              >
                <div className="text-lg">{preset.emoji}</div>
                <div className="text-xs text-neutral-600">{preset.label}</div>
              </button>
            ))}
          </div>

          {/* Data Layer Controls for Cinematic */}
          <DataLayerControls
            dataLayer={cinematicSettings.dataLayer}
            colorScheme={cinematicSettings.colorScheme}
            onDataLayerChange={(layer) => onCinematicChange({ dataLayer: layer })}
            onColorSchemeChange={(scheme) => onCinematicChange({ colorScheme: scheme })}
          />
        </div>
      )}

      {currentStyle === 'minimalist' && (
        <div className="space-y-4">
          <NeomorphicSelect
            label="Color Theme"
            value={minimalistSettings.colorTheme}
            onChange={(value) => onMinimalistChange({ colorTheme: value as 'light' | 'dark' })}
            options={[
              { value: 'light', label: 'Light Mode' },
              { value: 'dark', label: 'Dark Mode' }
            ]}
          />

          <NeomorphicSlider
            label="Terrain Exaggeration"
            value={minimalistSettings.terrainExaggeration}
            onChange={(value) => onMinimalistChange({ terrainExaggeration: value })}
            min={0}
            max={3}
            step={0.1}
            formatValue={(v) => `${v.toFixed(1)}x`}
          />

          {/* Data Layer Controls for Minimalist */}
          <DataLayerControls
            dataLayer={minimalistSettings.dataLayer}
            colorScheme={minimalistSettings.colorScheme}
            onDataLayerChange={(layer) => onMinimalistChange({ dataLayer: layer })}
            onColorSchemeChange={(scheme) => onMinimalistChange({ colorScheme: scheme })}
          />
        </div>
      )}

      {currentStyle === 'data' && (
        <div className="space-y-4">
          <NeomorphicSelect
            label="Data Layer"
            value={dataSettings.dataLayer}
            onChange={(value) => onDataChange({ dataLayer: value as DataLayer })}
            options={dataLayerOptions}
          />

          {/* Data source info */}
          {dataSettings.dataLayer !== 'none' && dataLayerInfo[dataSettings.dataLayer] && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-medium text-blue-700">
                Source: {dataLayerInfo[dataSettings.dataLayer].source}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {dataLayerInfo[dataSettings.dataLayer].description}
              </p>
            </div>
          )}

          <NeomorphicSelect
            label="Color Scheme"
            value={dataSettings.colorScheme}
            onChange={(value) => onDataChange({ colorScheme: value as ColorScheme })}
            options={colorSchemeOptions}
          />

          <NeomorphicSlider
            label="Intensity"
            value={dataSettings.extrusionScale}
            onChange={(value) => onDataChange({ extrusionScale: value })}
            min={0}
            max={5}
            step={0.1}
            formatValue={(v) => `${v.toFixed(1)}x`}
          />

          {/* Color scheme preview */}
          <div className="pt-2">
            <div className="text-xs text-neutral-500 mb-2">Color Preview</div>
            <div
              className="h-4 rounded-lg overflow-hidden"
              style={{ background: colorGradients[dataSettings.colorScheme] }}
            />
          </div>
        </div>
      )}
    </NeomorphicCard>
  );
}
