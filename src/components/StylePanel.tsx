'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NeomorphicSlider, NeomorphicSelect, NeomorphicCard, NeomorphicButton } from './ui';
import type { MapStyle, CinematicSettings, MinimalistSettings, DataSettings, SunpathSettings, LulcSettings, IsochroneSettings, ComparisonSettings, RoadsSettings, TreeCanopySettings, LighthouseSettings, City3DSettings, Basemap, DataLayer, ColorScheme, TravelMode, IsochroneColorScale, IsochroneMode, ComparisonDataset, RoadType, RoadColorMode, TreeCanopyColorMode, LighthouseBeamStyle, CityRenderStyle } from '@/types';

interface StylePanelProps {
  currentStyle: MapStyle;
  cinematicSettings: CinematicSettings;
  minimalistSettings: MinimalistSettings;
  dataSettings: DataSettings;
  sunpathSettings?: SunpathSettings;
  lulcSettings?: LulcSettings;
  isochroneSettings?: IsochroneSettings;
  comparisonSettings?: ComparisonSettings;
  roadsSettings?: RoadsSettings;
  treeCanopySettings?: TreeCanopySettings;
  lighthouseSettings?: LighthouseSettings;
  city3dSettings?: City3DSettings;
  onCinematicChange: (settings: Partial<CinematicSettings>) => void;
  onMinimalistChange: (settings: Partial<MinimalistSettings>) => void;
  onDataChange: (settings: Partial<DataSettings>) => void;
  onSunpathChange?: (settings: Partial<SunpathSettings>) => void;
  onLulcChange?: (settings: Partial<LulcSettings>) => void;
  onIsochroneChange?: (settings: Partial<IsochroneSettings>) => void;
  onComparisonChange?: (settings: Partial<ComparisonSettings>) => void;
  onRoadsChange?: (settings: Partial<RoadsSettings>) => void;
  onTreeCanopyChange?: (settings: Partial<TreeCanopySettings>) => void;
  onLighthouseChange?: (settings: Partial<LighthouseSettings>) => void;
  onCity3dChange?: (settings: Partial<City3DSettings>) => void;
  onClearIsochrones?: () => void;
}

const basemapOptions = [
  { value: 'osm', label: 'OpenStreetMap' },
  { value: 'carto-light', label: 'CARTO Positron' },
  { value: 'carto-dark', label: 'CARTO Dark Matter' },
  { value: 'carto-voyager', label: 'CARTO Voyager' },
  { value: 'carto-dark-nolabels', label: 'CARTO Dark (No Labels)' },
  { value: 'esri-imagery', label: 'ESRI Satellite' },
  { value: 'esri-terrain', label: 'ESRI Terrain' },
  { value: 'esri-natgeo', label: 'National Geographic' },
  { value: 'opentopo', label: 'OpenTopoMap' },
  { value: 'stamen-terrain', label: 'Stamen Terrain' },
  { value: 'stamen-toner', label: 'Stamen Toner' },
  { value: 'stamen-watercolor', label: 'Stamen Watercolor' }
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

const travelModeOptions = [
  { value: 'walking', label: 'Walking (5 km/h)' },
  { value: 'cycling', label: 'Cycling (15 km/h)' },
  { value: 'driving', label: 'Driving (50 km/h)' }
];

const isochroneModeOptions = [
  { value: 'circles', label: 'Concentric Circles' },
  { value: 'routed', label: 'Road Network (Routed)' }
];

const isochroneColorOptions = [
  { value: 'green-red', label: 'Green to Red' },
  { value: 'blue-purple', label: 'Blue to Purple' },
  { value: 'yellow-orange', label: 'Yellow to Orange' },
  { value: 'monochrome', label: 'Monochrome' }
];

const comparisonDatasetOptions = [
  { value: 'satellite', label: 'Satellite Imagery' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'street', label: 'Street Map' }
];

const yearOptions = Array.from({ length: 25 }, (_, i) => {
  const year = 2000 + i;
  return { value: year.toString(), label: year.toString() };
});

const roadTypeOptions = [
  { value: 'all', label: 'All Roads' },
  { value: 'highways', label: 'Highways Only' },
  { value: 'arterial', label: 'Arterial Roads' },
  { value: 'local', label: 'Local Streets' }
];

const roadColorModeOptions = [
  { value: 'type', label: 'By Road Type' },
  { value: 'density', label: 'By Density' },
  { value: 'connectivity', label: 'By Connectivity' }
];

const treeCanopyColorModeOptions = [
  { value: 'density', label: 'Canopy Density' },
  { value: 'height', label: 'Tree Height' },
  { value: 'coverage', label: 'Area Coverage' }
];

const lighthouseBeamStyleOptions = [
  { value: 'classic', label: 'Classic Beam' },
  { value: 'modern', label: 'Modern LED' },
  { value: 'dramatic', label: 'Dramatic Sweep' }
];

const cityRenderStyleOptions = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'stylized', label: 'Stylized' },
  { value: 'blueprint', label: 'Blueprint' },
  { value: 'neon', label: 'Neon Cyberpunk' }
];

export function StylePanel({
  currentStyle,
  cinematicSettings,
  minimalistSettings,
  dataSettings,
  sunpathSettings,
  lulcSettings,
  isochroneSettings,
  comparisonSettings,
  roadsSettings,
  treeCanopySettings,
  lighthouseSettings,
  city3dSettings,
  onCinematicChange,
  onMinimalistChange,
  onDataChange,
  onSunpathChange,
  onLulcChange,
  onIsochroneChange,
  onComparisonChange,
  onRoadsChange,
  onTreeCanopyChange,
  onLighthouseChange,
  onCity3dChange,
  onClearIsochrones
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
    if (currentStyle === 'isochrone' && isochroneSettings) return isochroneSettings.basemap;
    if (currentStyle === 'comparison' && comparisonSettings) return comparisonSettings.basemap;
    if (currentStyle === 'roads' && roadsSettings) return roadsSettings.basemap;
    if (currentStyle === 'tree-canopy' && treeCanopySettings) return treeCanopySettings.basemap;
    if (currentStyle === 'lighthouse' && lighthouseSettings) return lighthouseSettings.basemap;
    if (currentStyle === '3d-city' && city3dSettings) return city3dSettings.basemap;
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
    } else if (currentStyle === 'isochrone' && onIsochroneChange) {
      onIsochroneChange({ basemap });
    } else if (currentStyle === 'comparison' && onComparisonChange) {
      onComparisonChange({ basemap });
    } else if (currentStyle === 'roads' && onRoadsChange) {
      onRoadsChange({ basemap });
    } else if (currentStyle === 'tree-canopy' && onTreeCanopyChange) {
      onTreeCanopyChange({ basemap });
    } else if (currentStyle === 'lighthouse' && onLighthouseChange) {
      onLighthouseChange({ basemap });
    } else if (currentStyle === '3d-city' && onCity3dChange) {
      onCity3dChange({ basemap });
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

      {/* Isochrone Controls */}
      {currentStyle === 'isochrone' && isochroneSettings && onIsochroneChange && (
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs text-teal-700">
              Click anywhere on the map to generate travel time zones (isochrones). Zones show how far you can travel in the specified time intervals.
            </p>
          </div>

          <NeomorphicSelect
            label="Isochrone Mode"
            value={isochroneSettings.mode}
            onChange={(value) => onIsochroneChange({ mode: value as IsochroneMode })}
            options={isochroneModeOptions}
          />

          {isochroneSettings.mode === 'circles' && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                Simple distance-based circles. Fast but doesn't account for road network.
              </p>
            </div>
          )}

          {isochroneSettings.mode === 'routed' && (
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-700">
                Uses OpenStreetMap road network for accurate travel times. May take a moment to calculate.
              </p>
            </div>
          )}

          <NeomorphicSelect
            label="Travel Mode"
            value={isochroneSettings.travelMode}
            onChange={(value) => onIsochroneChange({ travelMode: value as TravelMode })}
            options={travelModeOptions}
          />

          <NeomorphicSlider
            label="Maximum Time"
            value={isochroneSettings.maxTime}
            onChange={(value) => {
              const intervals = [];
              const step = value / 4;
              for (let i = 1; i <= 4; i++) {
                intervals.push(Math.round(step * i));
              }
              onIsochroneChange({ maxTime: value, intervals });
            }}
            min={5}
            max={60}
            step={5}
            formatValue={(v) => `${v} min`}
          />

          <div className="text-xs text-neutral-500">
            Intervals: {isochroneSettings.intervals.map(i => `${i}min`).join(', ')}
          </div>

          <NeomorphicSelect
            label="Color Scale"
            value={isochroneSettings.colorScale}
            onChange={(value) => onIsochroneChange({ colorScale: value as IsochroneColorScale })}
            options={isochroneColorOptions}
          />

          <NeomorphicSlider
            label="Transparency"
            value={isochroneSettings.transparency}
            onChange={(value) => onIsochroneChange({ transparency: value })}
            min={0.2}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          {isochroneSettings.isLoading && (
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-teal-700">
                Calculating {isochroneSettings.mode === 'routed' ? 'routed ' : ''}isochrones...
              </p>
            </div>
          )}

          {/* Draggable and Heartbeat toggles */}
          <div className="pt-2 border-t border-neutral-200 space-y-2">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-neutral-600">Draggable Marker</span>
                <p className="text-xs text-neutral-400">Drag to update isochrones</p>
              </div>
              <button
                onClick={() => onIsochroneChange({ draggable: !isochroneSettings.draggable })}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${isochroneSettings.draggable ? 'bg-teal-500' : 'bg-neutral-300'}
                `}
              >
                <div className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                  ${isochroneSettings.draggable ? 'translate-x-7' : 'translate-x-1'}
                `} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-neutral-600">Heartbeat Animation</span>
                <p className="text-xs text-neutral-400">Pulsing color effect</p>
              </div>
              <button
                onClick={() => onIsochroneChange({ heartbeat: !isochroneSettings.heartbeat })}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${isochroneSettings.heartbeat ? 'bg-pink-500' : 'bg-neutral-300'}
                `}
              >
                <div className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                  ${isochroneSettings.heartbeat ? 'translate-x-7' : 'translate-x-1'}
                `} />
              </button>
            </div>
          </div>

          {isochroneSettings.clickedPoint && !isochroneSettings.isLoading && (
            <div className="pt-2 border-t border-neutral-200 space-y-2">
              <div className="text-xs text-neutral-600">
                Origin: {isochroneSettings.clickedPoint.lat.toFixed(4)}, {isochroneSettings.clickedPoint.lng.toFixed(4)}
              </div>
              <NeomorphicButton
                onClick={onClearIsochrones}
                variant="default"
                size="sm"
                className="w-full"
              >
                Clear Isochrones
              </NeomorphicButton>
            </div>
          )}

          {!isochroneSettings.clickedPoint && !isochroneSettings.isLoading && (
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center">
                Click on the map to set origin point
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comparison Controls */}
      {currentStyle === 'comparison' && comparisonSettings && onComparisonChange && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-xs text-indigo-700">
              Drag the slider on the map to compare different time periods. Select the dataset and years to compare.
            </p>
          </div>

          <NeomorphicSelect
            label="Dataset"
            value={comparisonSettings.dataset}
            onChange={(value) => onComparisonChange({ dataset: value as ComparisonDataset })}
            options={comparisonDatasetOptions}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Left Year</label>
              <select
                value={comparisonSettings.leftYear}
                onChange={(e) => onComparisonChange({ leftYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {yearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Right Year</label>
              <select
                value={comparisonSettings.rightYear}
                onChange={(e) => onComparisonChange({ rightYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {yearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <NeomorphicSlider
            label="Slider Position"
            value={comparisonSettings.sliderPosition}
            onChange={(value) => onComparisonChange({ sliderPosition: value })}
            min={0}
            max={100}
            step={1}
            formatValue={(v) => `${Math.round(v)}%`}
          />

          <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              Note: Historical imagery is simulated. In production, this would connect to satellite imagery archives.
            </p>
          </div>
        </div>
      )}

      {/* Roads Controls */}
      {currentStyle === 'roads' && roadsSettings && onRoadsChange && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-700">
              Road network visualization. Analyze road density, connectivity, and hierarchies for urban planning insights.
            </p>
          </div>

          <NeomorphicSelect
            label="Road Type"
            value={roadsSettings.roadType}
            onChange={(value) => onRoadsChange({ roadType: value as RoadType })}
            options={roadTypeOptions}
          />

          <NeomorphicSelect
            label="Color Mode"
            value={roadsSettings.colorMode}
            onChange={(value) => onRoadsChange({ colorMode: value as RoadColorMode })}
            options={roadColorModeOptions}
          />

          <NeomorphicSelect
            label="Color Scheme"
            value={roadsSettings.colorScheme}
            onChange={(value) => onRoadsChange({ colorScheme: value as ColorScheme })}
            options={colorSchemeOptions}
          />

          <NeomorphicSlider
            label="Line Width"
            value={roadsSettings.lineWidth}
            onChange={(value) => onRoadsChange({ lineWidth: value })}
            min={1}
            max={10}
            step={0.5}
            formatValue={(v) => `${v.toFixed(1)}px`}
          />

          <NeomorphicSlider
            label="Transparency"
            value={roadsSettings.transparency}
            onChange={(value) => onRoadsChange({ transparency: value })}
            min={0.2}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          {/* Color preview */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">Color Preview</div>
            <div
              className="h-3 rounded-lg overflow-hidden"
              style={{ background: colorGradients[roadsSettings.colorScheme] }}
            />
          </div>
        </div>
      )}

      {/* Tree Canopy Controls */}
      {currentStyle === 'tree-canopy' && treeCanopySettings && onTreeCanopyChange && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs text-emerald-700">
              Urban forest visualization. Analyze tree canopy density, height distribution, and coverage for environmental planning.
            </p>
          </div>

          <NeomorphicSelect
            label="Analysis Mode"
            value={treeCanopySettings.colorMode}
            onChange={(value) => onTreeCanopyChange({ colorMode: value as TreeCanopyColorMode })}
            options={treeCanopyColorModeOptions}
          />

          <NeomorphicSlider
            label="Hexagon Size"
            value={treeCanopySettings.hexagonSize}
            onChange={(value) => onTreeCanopyChange({ hexagonSize: value })}
            min={50}
            max={500}
            step={25}
            formatValue={(v) => `${v}m`}
          />

          {treeCanopySettings.colorMode === 'height' && (
            <div className="grid grid-cols-2 gap-3">
              <NeomorphicSlider
                label="Min Height"
                value={treeCanopySettings.minHeight}
                onChange={(value) => onTreeCanopyChange({ minHeight: value })}
                min={0}
                max={20}
                step={1}
                formatValue={(v) => `${v}m`}
              />
              <NeomorphicSlider
                label="Max Height"
                value={treeCanopySettings.maxHeight}
                onChange={(value) => onTreeCanopyChange({ maxHeight: value })}
                min={10}
                max={50}
                step={5}
                formatValue={(v) => `${v}m`}
              />
            </div>
          )}

          <NeomorphicSelect
            label="Color Scheme"
            value={treeCanopySettings.colorScheme}
            onChange={(value) => onTreeCanopyChange({ colorScheme: value as ColorScheme })}
            options={colorSchemeOptions}
          />

          <NeomorphicSlider
            label="Transparency"
            value={treeCanopySettings.transparency}
            onChange={(value) => onTreeCanopyChange({ transparency: value })}
            min={0.2}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-600">3D Extrusion</span>
            <button
              onClick={() => onTreeCanopyChange({ show3D: !treeCanopySettings.show3D })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${treeCanopySettings.show3D ? 'bg-emerald-500' : 'bg-neutral-300'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${treeCanopySettings.show3D ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>

          {/* Canopy Legend */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="text-xs font-semibold text-neutral-600 mb-2">Density Scale</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 rounded-lg" style={{ background: 'linear-gradient(to right, #d4e8d4, #2d8a2d, #0a5c0a)' }} />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      )}

      {/* Lighthouse Controls */}
      {currentStyle === 'lighthouse' && lighthouseSettings && onLighthouseChange && (
        <div className="space-y-4">
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
            <p className="text-xs text-sky-700">
              Dramatic coastal visualization with animated lighthouse beams. Perfect for maritime-themed data stories.
            </p>
          </div>

          <NeomorphicSelect
            label="Beam Style"
            value={lighthouseSettings.beamStyle}
            onChange={(value) => onLighthouseChange({ beamStyle: value as LighthouseBeamStyle })}
            options={lighthouseBeamStyleOptions}
          />

          <NeomorphicSlider
            label="Beam Intensity"
            value={lighthouseSettings.beamIntensity}
            onChange={(value) => onLighthouseChange({ beamIntensity: value })}
            min={0.2}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          <NeomorphicSlider
            label="Beam Rotation"
            value={lighthouseSettings.beamRotation}
            onChange={(value) => onLighthouseChange({ beamRotation: value })}
            min={0}
            max={360}
            step={15}
            formatValue={(v) => `${v}°`}
          />

          <NeomorphicSlider
            label="Fog Density"
            value={lighthouseSettings.fogDensity}
            onChange={(value) => onLighthouseChange({ fogDensity: value })}
            min={0}
            max={1}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-600">Night Mode</span>
            <button
              onClick={() => onLighthouseChange({ nightMode: !lighthouseSettings.nightMode })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${lighthouseSettings.nightMode ? 'bg-indigo-600' : 'bg-neutral-300'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${lighthouseSettings.nightMode ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-600">Animate Beam</span>
            <button
              onClick={() => onLighthouseChange({ animateBeam: !lighthouseSettings.animateBeam })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${lighthouseSettings.animateBeam ? 'bg-sky-500' : 'bg-neutral-300'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${lighthouseSettings.animateBeam ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <NeomorphicSelect
            label="Color Scheme"
            value={lighthouseSettings.colorScheme}
            onChange={(value) => onLighthouseChange({ colorScheme: value as ColorScheme })}
            options={colorSchemeOptions}
          />
        </div>
      )}

      {/* 3D City Controls */}
      {currentStyle === '3d-city' && city3dSettings && onCity3dChange && (
        <div className="space-y-4">
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
            <p className="text-xs text-violet-700">
              Stylized 3D city rendering inspired by Milos Makes Maps. Create stunning urban visualizations with extruded buildings.
            </p>
          </div>

          <NeomorphicSelect
            label="Render Style"
            value={city3dSettings.renderStyle}
            onChange={(value) => onCity3dChange({ renderStyle: value as CityRenderStyle })}
            options={cityRenderStyleOptions}
          />

          <NeomorphicSlider
            label="Building Height"
            value={city3dSettings.buildingHeight}
            onChange={(value) => onCity3dChange({ buildingHeight: value })}
            min={0.5}
            max={5}
            step={0.25}
            formatValue={(v) => `${v.toFixed(2)}x`}
          />

          <NeomorphicSlider
            label="Lighting Angle"
            value={city3dSettings.lightingAngle}
            onChange={(value) => onCity3dChange({ lightingAngle: value })}
            min={0}
            max={360}
            step={15}
            formatValue={(v) => `${v}°`}
          />

          <NeomorphicSlider
            label="Transparency"
            value={city3dSettings.transparency}
            onChange={(value) => onCity3dChange({ transparency: value })}
            min={0.5}
            max={1}
            step={0.05}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-600">Show Roofs</span>
            <button
              onClick={() => onCity3dChange({ showRoofs: !city3dSettings.showRoofs })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${city3dSettings.showRoofs ? 'bg-violet-500' : 'bg-neutral-300'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${city3dSettings.showRoofs ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-600">Ambient Occlusion</span>
            <button
              onClick={() => onCity3dChange({ ambientOcclusion: !city3dSettings.ambientOcclusion })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${city3dSettings.ambientOcclusion ? 'bg-violet-500' : 'bg-neutral-300'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${city3dSettings.ambientOcclusion ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-600">Camera Orbit</span>
            <button
              onClick={() => onCity3dChange({ cameraOrbit: !city3dSettings.cameraOrbit })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${city3dSettings.cameraOrbit ? 'bg-violet-500' : 'bg-neutral-300'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${city3dSettings.cameraOrbit ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <NeomorphicSelect
            label="Color Scheme"
            value={city3dSettings.colorScheme}
            onChange={(value) => onCity3dChange({ colorScheme: value as ColorScheme })}
            options={colorSchemeOptions}
          />

          {/* Style previews */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="text-xs font-semibold text-neutral-600 mb-2">Style Preview</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { style: 'realistic', bg: 'linear-gradient(135deg, #4a5568, #718096)', label: 'Real' },
                { style: 'stylized', bg: 'linear-gradient(135deg, #667eea, #764ba2)', label: 'Style' },
                { style: 'blueprint', bg: 'linear-gradient(135deg, #1e3a5f, #4a90b8)', label: 'Blue' },
                { style: 'neon', bg: 'linear-gradient(135deg, #0f0c29, #302b63)', label: 'Neon' }
              ].map((item) => (
                <button
                  key={item.style}
                  onClick={() => onCity3dChange({ renderStyle: item.style as CityRenderStyle })}
                  className={`
                    p-2 rounded-lg text-center transition-all duration-200
                    ${city3dSettings.renderStyle === item.style
                      ? 'ring-2 ring-violet-500 scale-105'
                      : 'hover:scale-105'
                    }
                  `}
                  style={{ background: item.bg }}
                >
                  <div className="text-xs text-white font-medium">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </NeomorphicCard>
  );
}
