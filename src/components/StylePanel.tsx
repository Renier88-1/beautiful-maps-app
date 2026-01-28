'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NeomorphicSlider, NeomorphicSelect, NeomorphicCard, NeomorphicButton } from './ui';
import type { MapStyle, CinematicSettings, MinimalistSettings, DataSettings, SunpathSettings, LulcSettings, Basemap, DataLayer, ColorScheme } from '@/types';

interface StylePanelProps {
  currentStyle: MapStyle;
  cinematicSettings: CinematicSettings;
  minimalistSettings: MinimalistSettings;
  dataSettings: DataSettings;
  sunpathSettings?: SunpathSettings;
  lulcSettings?: LulcSettings;
  onCinematicChange: (settings: Partial<CinematicSettings>) => void;
  onMinimalistChange: (settings: Partial<MinimalistSettings>) => void;
  onDataChange: (settings: Partial<DataSettings>) => void;
  onSunpathChange?: (settings: Partial<SunpathSettings>) => void;
  onLulcChange?: (settings: Partial<LulcSettings>) => void;
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
  sunpathSettings,
  lulcSettings,
  onCinematicChange,
  onMinimalistChange,
  onDataChange,
  onSunpathChange,
  onLulcChange
}: StylePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  // Sun path animation
  useEffect(() => {
    if (isPlaying && currentStyle === 'sunpath' && onSunpathChange && sunpathSettings) {
      playIntervalRef.current = setInterval(() => {
        const newTime = (sunpathSettings.time + 0.5) % 24;
        onSunpathChange({ time: newTime < 5 ? 5 : newTime > 21 ? 5 : newTime });
      }, 200);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentStyle, sunpathSettings, onSunpathChange]);

  const getCurrentBasemap = (): Basemap => {
    if (currentStyle === 'cinematic') return cinematicSettings.basemap;
    if (currentStyle === 'minimalist') return minimalistSettings.basemap;
    if (currentStyle === 'sunpath' && sunpathSettings) return sunpathSettings.basemap;
    if (currentStyle === 'lulc' && lulcSettings) return lulcSettings.basemap;
    return dataSettings.basemap;
  };

  const handleBasemapChange = (basemap: Basemap) => {
    if (currentStyle === 'cinematic') {
      onCinematicChange({ basemap });
    } else if (currentStyle === 'minimalist') {
      onMinimalistChange({ basemap });
    } else if (currentStyle === 'sunpath' && onSunpathChange) {
      onSunpathChange({ basemap });
    } else if (currentStyle === 'lulc' && onLulcChange) {
      onLulcChange({ basemap });
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

      {/* Sun Path Controls */}
      {currentStyle === 'sunpath' && sunpathSettings && onSunpathChange && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              Visualize sun position and shadows throughout the day. Use the play button to animate.
            </p>
          </div>

          <NeomorphicSlider
            label="Time of Day"
            value={sunpathSettings.time}
            onChange={(value) => onSunpathChange({ time: value })}
            min={5}
            max={21}
            step={0.5}
            formatValue={formatTime}
          />

          {/* Time presets */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { time: 6, label: 'Dawn', emoji: '🌅' },
              { time: 10, label: 'Morning', emoji: '🌤️' },
              { time: 14, label: 'Afternoon', emoji: '☀️' },
              { time: 18, label: 'Dusk', emoji: '🌇' }
            ].map((preset) => (
              <button
                key={preset.time}
                onClick={() => onSunpathChange({ time: preset.time })}
                className={`
                  p-2 rounded-lg text-center transition-all duration-200
                  ${Math.abs(sunpathSettings.time - preset.time) < 1
                    ? 'bg-amber-100 shadow-inner'
                    : 'bg-neutral-50 hover:bg-neutral-100'
                  }
                `}
              >
                <div className="text-lg">{preset.emoji}</div>
                <div className="text-xs text-neutral-600">{preset.label}</div>
              </button>
            ))}
          </div>

          {/* Play/Pause button */}
          <div className="flex items-center gap-3">
            <NeomorphicButton
              onClick={() => setIsPlaying(!isPlaying)}
              variant={isPlaying ? 'primary' : 'default'}
              size="md"
              className="flex-1"
            >
              {isPlaying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                  Pause
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Play Animation
                </span>
              )}
            </NeomorphicButton>
          </div>

          <div className="pt-2 border-t border-neutral-200">
            <label className="block text-xs text-neutral-500 mb-1">Date</label>
            <input
              type="date"
              value={sunpathSettings.date}
              onChange={(e) => onSunpathChange({ date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <NeomorphicSlider
            label="Shadow Opacity"
            value={sunpathSettings.shadowOpacity}
            onChange={(value) => onSunpathChange({ shadowOpacity: value })}
            min={0.1}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        </div>
      )}

      {/* LULC Controls */}
      {currentStyle === 'lulc' && lulcSettings && onLulcChange && (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              Land Use / Land Cover visualization. Green areas indicate vegetation, tan indicates developed/agricultural land.
            </p>
          </div>

          <NeomorphicSelect
            label="Color Scheme"
            value={lulcSettings.colorScheme}
            onChange={(value) => onLulcChange({ colorScheme: value as ColorScheme })}
            options={colorSchemeOptions}
          />

          <NeomorphicSlider
            label="Transparency"
            value={lulcSettings.transparency}
            onChange={(value) => onLulcChange({ transparency: value })}
            min={0.3}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          {/* LULC Legend */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="text-xs font-semibold text-neutral-600 mb-2">Legend</div>
            <div className="space-y-1.5">
              {[
                { color: '#1a5c1a', label: 'Forest / Vegetation' },
                { color: '#2d8a2d', label: 'Grassland / Shrubs' },
                { color: '#6b8e23', label: 'Agriculture' },
                { color: '#d4a574', label: 'Urban / Built-up' },
                { color: '#f5e6d3', label: 'Bare Land' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm border border-neutral-300"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-neutral-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nolli & Figure Ground info */}
      {(currentStyle === 'nolli' || currentStyle === 'figure-ground') && (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg border ${
            currentStyle === 'nolli'
              ? 'bg-neutral-50 border-neutral-200'
              : 'bg-neutral-800 border-neutral-700'
          }`}>
            <p className={`text-xs ${currentStyle === 'nolli' ? 'text-neutral-700' : 'text-neutral-300'}`}>
              {currentStyle === 'nolli'
                ? 'Nolli map style shows urban form with emphasis on public vs private space. Building footprints require vector tile data.'
                : 'Figure-ground diagram emphasizes built mass against open space. Currently showing terrain-based approximation.'
              }
            </p>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              Note: True building footprints require vector tile integration (coming soon).
            </p>
          </div>
        </div>
      )}
    </NeomorphicCard>
  );
}
