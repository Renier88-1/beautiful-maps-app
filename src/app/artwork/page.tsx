'use client';

import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import maplibregl, { Map as MapLibreMap, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import { SearchBar, NeomorphicCard, NeomorphicButton, NeomorphicSlider, NeomorphicSelect } from '@/components';

// Shapefile parsing utilities
async function parseShapefile(files: FileList): Promise<GeoJSON.FeatureCollection | null> {
  // Look for .shp file
  let shpFile: File | null = null;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'shp') {
      shpFile = file;
      break;
    }
  }

  if (!shpFile) {
    alert('No .shp file found. Please select a .shp file.');
    return null;
  }

  // Use dynamic import for shpjs
  const shp = (await import('shpjs')).default;

  // Read the shapefile as ArrayBuffer
  const shpBuffer = await shpFile.arrayBuffer();

  // shpjs can parse .shp files directly
  const geojson = await shp(shpBuffer);
  return Array.isArray(geojson) ? geojson[0] : geojson;
}

// Parse GeoJSON file
async function parseGeoJSON(file: File): Promise<GeoJSON.FeatureCollection | null> {
  const text = await file.text();
  try {
    const geojson = JSON.parse(text);
    if (geojson.type === 'FeatureCollection') {
      return geojson;
    } else if (geojson.type === 'Feature') {
      return { type: 'FeatureCollection', features: [geojson] };
    } else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
      return {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: geojson }]
      };
    }
    alert('Invalid GeoJSON format');
    return null;
  } catch {
    alert('Failed to parse GeoJSON file');
    return null;
  }
}

// Milos-style artwork presets
type ArtworkStyle = 'monochrome' | 'earth' | 'ocean' | 'sunset' | 'forest' | 'minimal' | 'neon';
type DrawMode = 'none' | 'rectangle' | 'polygon';

interface ArtworkSettings {
  style: ArtworkStyle;
  terrainExaggeration: number;
  shadowIntensity: number;
  showRoads: boolean;
  showWater: boolean;
  showBuildings: boolean;
  lightAngle: number;
  resolution: 'standard' | 'high' | 'ultra';
}

const ARTWORK_STYLES: Record<ArtworkStyle, {
  name: string;
  description: string;
  colors: {
    background: string;
    lowElevation: string;
    midElevation: string;
    highElevation: string;
    water: string;
    roads: string;
    shadow: string;
  };
  preview: string;
}> = {
  monochrome: {
    name: 'Monochrome',
    description: 'Classic black & white relief',
    colors: {
      background: '#1a1a1a',
      lowElevation: '#2a2a2a',
      midElevation: '#808080',
      highElevation: '#ffffff',
      water: '#0a0a0a',
      roads: '#404040',
      shadow: '#000000'
    },
    preview: 'linear-gradient(135deg, #1a1a1a 0%, #808080 50%, #ffffff 100%)'
  },
  earth: {
    name: 'Earth Tones',
    description: 'Natural terrain colors',
    colors: {
      background: '#2d3a2d',
      lowElevation: '#3d5c3d',
      midElevation: '#8b7355',
      highElevation: '#d4c4a8',
      water: '#1a3a4a',
      roads: '#4a4a3a',
      shadow: '#1a1a1a'
    },
    preview: 'linear-gradient(135deg, #2d3a2d 0%, #8b7355 50%, #d4c4a8 100%)'
  },
  ocean: {
    name: 'Ocean Blue',
    description: 'Deep blues to coastal whites',
    colors: {
      background: '#0a1628',
      lowElevation: '#1a3a5c',
      midElevation: '#4a7c9b',
      highElevation: '#a8d4e6',
      water: '#051020',
      roads: '#2a4a6a',
      shadow: '#000814'
    },
    preview: 'linear-gradient(135deg, #0a1628 0%, #4a7c9b 50%, #a8d4e6 100%)'
  },
  sunset: {
    name: 'Sunset',
    description: 'Warm orange to purple gradient',
    colors: {
      background: '#1a0a1a',
      lowElevation: '#4a1a3a',
      midElevation: '#c44a1a',
      highElevation: '#ffa040',
      water: '#0a0a2a',
      roads: '#6a3a4a',
      shadow: '#0a0510'
    },
    preview: 'linear-gradient(135deg, #1a0a1a 0%, #c44a1a 50%, #ffa040 100%)'
  },
  forest: {
    name: 'Forest',
    description: 'Rich greens and browns',
    colors: {
      background: '#0a1a0a',
      lowElevation: '#1a3a1a',
      midElevation: '#4a6a2a',
      highElevation: '#8ab04a',
      water: '#0a1a2a',
      roads: '#3a4a2a',
      shadow: '#050a05'
    },
    preview: 'linear-gradient(135deg, #0a1a0a 0%, #4a6a2a 50%, #8ab04a 100%)'
  },
  minimal: {
    name: 'Minimal White',
    description: 'Clean white background with subtle relief',
    colors: {
      background: '#f8f8f8',
      lowElevation: '#e0e0e0',
      midElevation: '#c0c0c0',
      highElevation: '#808080',
      water: '#d0e8f0',
      roads: '#b0b0b0',
      shadow: '#a0a0a0'
    },
    preview: 'linear-gradient(135deg, #f8f8f8 0%, #c0c0c0 50%, #808080 100%)'
  },
  neon: {
    name: 'Neon Cyber',
    description: 'Vibrant cyberpunk aesthetic',
    colors: {
      background: '#0a0014',
      lowElevation: '#1a0a3a',
      midElevation: '#4a1a8a',
      highElevation: '#ff00ff',
      water: '#001428',
      roads: '#00ffff',
      shadow: '#000008'
    },
    preview: 'linear-gradient(135deg, #0a0014 0%, #4a1a8a 50%, #ff00ff 100%)'
  }
};

const RESOLUTION_OPTIONS = [
  { value: 'standard', label: 'Standard (1920×1080)' },
  { value: 'high', label: 'High (3840×2160)' },
  { value: 'ultra', label: 'Ultra (7680×4320)' }
];

// Register PMTiles protocol
let pmtilesProtocolRegistered = false;

export default function ArtworkPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [boundary, setBoundary] = useState<LngLatBounds | null>(null);
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importLoading, setImportLoading] = useState(false);

  // Use refs for drawing state to avoid closure issues
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<{ lng: number; lat: number } | null>(null);
  const drawModeRef = useRef<DrawMode>('none');

  const [settings, setSettings] = useState<ArtworkSettings>({
    style: 'monochrome',
    terrainExaggeration: 2.0,
    shadowIntensity: 0.8,
    showRoads: true,
    showWater: true,
    showBuildings: false,
    lightAngle: 315,
    resolution: 'high'
  });

  // Keep refs in sync with state
  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (!pmtilesProtocolRegistered) {
      const protocol = new Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
      pmtilesProtocolRegistered = true;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getArtworkMapStyle(settings),
      center: [28.2, -25.7], // Pretoria
      zoom: 10,
      pitch: 60,
      bearing: -20,
      maxPitch: 85
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    // Drawing handlers using refs to avoid closure issues
    map.on('mousedown', (e) => {
      if (drawModeRef.current === 'rectangle') {
        isDrawingRef.current = true;
        drawStartRef.current = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        map.dragPan.disable();
      }
    });

    map.on('mousemove', (e) => {
      if (isDrawingRef.current && drawStartRef.current && drawModeRef.current === 'rectangle') {
        updateDrawingPreview(map, drawStartRef.current, { lng: e.lngLat.lng, lat: e.lngLat.lat });
      }
    });

    map.on('mouseup', (e) => {
      if (isDrawingRef.current && drawStartRef.current && drawModeRef.current === 'rectangle') {
        const start = drawStartRef.current;
        const bounds = new LngLatBounds(
          [Math.min(start.lng, e.lngLat.lng), Math.min(start.lat, e.lngLat.lat)],
          [Math.max(start.lng, e.lngLat.lng), Math.max(start.lat, e.lngLat.lat)]
        );
        setBoundary(bounds);
        setBoundaryGeoJSON(null); // Clear any imported boundary
        finalizeBoundary(map, bounds);
        isDrawingRef.current = false;
        drawStartRef.current = null;
        setDrawMode('none');
        map.dragPan.enable();
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style when settings change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.setStyle(getArtworkMapStyle(settings));
  }, [settings.style, settings.terrainExaggeration, settings.shadowIntensity, settings.lightAngle, mapLoaded]);

  const handleLocationSelect = useCallback((lat: number, lng: number, name: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        pitch: 60,
        bearing: -20,
        duration: 2000
      });
    }
  }, []);

  const handleClearBoundary = useCallback(() => {
    setBoundary(null);
    setBoundaryGeoJSON(null);
    if (mapRef.current) {
      if (mapRef.current.getLayer('boundary-fill')) {
        mapRef.current.removeLayer('boundary-fill');
      }
      if (mapRef.current.getLayer('boundary-outline')) {
        mapRef.current.removeLayer('boundary-outline');
      }
      if (mapRef.current.getSource('boundary')) {
        mapRef.current.removeSource('boundary');
      }
    }
  }, []);

  // Handle file import (shapefile or GeoJSON)
  const handleFileImport = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImportLoading(true);
    try {
      let geojson: GeoJSON.FeatureCollection | null = null;

      // Check file types
      const firstFile = files[0];
      const ext = firstFile.name.split('.').pop()?.toLowerCase();

      if (ext === 'geojson' || ext === 'json') {
        geojson = await parseGeoJSON(firstFile);
      } else if (ext === 'shp' || ext === 'dbf' || ext === 'prj' || ext === 'zip') {
        // For zip files containing shapefiles
        if (ext === 'zip') {
          const shp = (await import('shpjs')).default;
          const buffer = await firstFile.arrayBuffer();
          const result = await shp(buffer);
          geojson = Array.isArray(result) ? result[0] : result;
        } else {
          geojson = await parseShapefile(files);
        }
      } else {
        alert('Unsupported file format. Please use .shp, .geojson, .json, or .zip');
        return;
      }

      if (geojson && geojson.features.length > 0 && mapRef.current) {
        // Calculate bounds from features
        const bounds = new LngLatBounds();
        geojson.features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach(coord => {
              bounds.extend([coord[0], coord[1]]);
            });
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
              polygon[0].forEach(coord => {
                bounds.extend([coord[0], coord[1]]);
              });
            });
          }
        });

        if (!bounds.isEmpty()) {
          setBoundary(bounds);
          setBoundaryGeoJSON(geojson);

          // Add to map
          const map = mapRef.current;

          // Remove existing boundary layers
          if (map.getLayer('boundary-fill')) map.removeLayer('boundary-fill');
          if (map.getLayer('boundary-outline')) map.removeLayer('boundary-outline');
          if (map.getSource('boundary')) map.removeSource('boundary');

          // Add imported boundary
          map.addSource('boundary', {
            type: 'geojson',
            data: geojson
          });
          map.addLayer({
            id: 'boundary-fill',
            type: 'fill',
            source: 'boundary',
            paint: {
              'fill-color': '#10b981',
              'fill-opacity': 0.1
            }
          });
          map.addLayer({
            id: 'boundary-outline',
            type: 'line',
            source: 'boundary',
            paint: {
              'line-color': '#10b981',
              'line-width': 3
            }
          });

          // Fly to bounds
          map.fitBounds(bounds, { padding: 50, duration: 1500 });
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import file. Please check the format.');
    } finally {
      setImportLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!mapRef.current || !boundary) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const map = mapRef.current;

      // Get resolution dimensions
      const resolutions = {
        standard: { width: 1920, height: 1080 },
        high: { width: 3840, height: 2160 },
        ultra: { width: 7680, height: 4320 }
      };
      const { width, height } = resolutions[settings.resolution];

      // Fit map to boundary
      map.fitBounds(boundary, { padding: 50, duration: 0 });

      setExportProgress(30);

      // Wait for map to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      setExportProgress(60);

      // Get canvas and export
      const canvas = map.getCanvas();

      // Create high-res canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width;
      exportCanvas.height = height;
      const ctx = exportCanvas.getContext('2d');

      if (ctx) {
        // Draw with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, width, height);

        setExportProgress(90);

        // Download
        const link = document.createElement('a');
        link.download = `artwork-${settings.style}-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png', 1.0);
        link.click();
      }

      setExportProgress(100);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  }, [boundary, settings]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#e8ecef]">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 flex items-center justify-between gap-4 bg-[#e8ecef] border-b border-neutral-200/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg">🗺️</span>
            </div>
            <span className="text-lg font-semibold text-neutral-800 hidden sm:block">Beautiful Maps</span>
          </Link>
          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 rounded-lg p-1 border border-neutral-200">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map Types
            </Link>
            <Link
              href="/data-sources"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Data Sources
            </Link>
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Artwork
            </span>
          </nav>
        </div>

        <div className="flex-1 max-w-md">
          <SearchBar onLocationSelect={handleLocationSelect} />
        </div>

        <div className="flex items-center gap-2">
          {boundary && (
            <NeomorphicButton
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            >
              {isExporting ? `Exporting ${exportProgress}%` : '📥 Export Artwork'}
            </NeomorphicButton>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <main className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Draw Mode Indicator */}
          {drawMode !== 'none' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Click and drag to draw {drawMode}
              </div>
            </div>
          )}

          {/* Boundary Info */}
          {boundary && (
            <div className="absolute bottom-4 left-4 z-10">
              <NeomorphicCard variant="raised" padding="sm">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-neutral-600">
                    <span className="font-medium">Selected Area:</span>
                    <br />
                    {(boundary.getNorthEast().lat - boundary.getSouthWest().lat).toFixed(3)}° × {(boundary.getNorthEast().lng - boundary.getSouthWest().lng).toFixed(3)}°
                  </div>
                  <button
                    onClick={handleClearBoundary}
                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                  >
                    Clear
                  </button>
                </div>
              </NeomorphicCard>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-[#e8ecef] border-l border-neutral-200/50 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Boundary Selection */}
            <NeomorphicCard variant="inset" padding="md">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">1. Select Boundary</h3>
              <p className="text-xs text-neutral-500 mb-3">
                Define the area for your artwork. Draw a rectangle or import a shapefile.
              </p>
              <div className="flex gap-2 mb-2">
                <NeomorphicButton
                  onClick={() => setDrawMode(drawMode === 'rectangle' ? 'none' : 'rectangle')}
                  variant={drawMode === 'rectangle' ? 'primary' : 'default'}
                  size="sm"
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                  </svg>
                  Rectangle
                </NeomorphicButton>
              </div>

              {/* Import Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".shp,.dbf,.prj,.geojson,.json,.zip"
                multiple
                onChange={handleFileImport}
                className="hidden"
              />
              <NeomorphicButton
                onClick={() => fileInputRef.current?.click()}
                variant="default"
                size="sm"
                className="w-full"
                disabled={importLoading}
              >
                {importLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import Shapefile / GeoJSON
                  </>
                )}
              </NeomorphicButton>
              <p className="text-[10px] text-neutral-400 mt-1.5 text-center">
                Supports .shp, .geojson, .json, .zip
              </p>

              {boundary && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {boundaryGeoJSON ? 'Boundary imported' : 'Boundary selected'}
                    {boundaryGeoJSON && ` (${boundaryGeoJSON.features.length} feature${boundaryGeoJSON.features.length > 1 ? 's' : ''})`}
                  </p>
                </div>
              )}
            </NeomorphicCard>

            {/* Style Presets */}
            <NeomorphicCard variant="inset" padding="md">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">2. Choose Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(ARTWORK_STYLES) as [ArtworkStyle, typeof ARTWORK_STYLES[ArtworkStyle]][]).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => setSettings(s => ({ ...s, style: key }))}
                    className={`
                      p-2 rounded-lg border-2 transition-all text-left
                      ${settings.style === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent bg-neutral-100 hover:bg-neutral-200'}
                    `}
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{ background: style.preview }}
                    />
                    <p className="text-xs font-medium text-neutral-700">{style.name}</p>
                    <p className="text-[10px] text-neutral-500">{style.description}</p>
                  </button>
                ))}
              </div>
            </NeomorphicCard>

            {/* Fine-tune Settings */}
            <NeomorphicCard variant="inset" padding="md">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">3. Fine-tune</h3>

              <div className="space-y-4">
                <NeomorphicSlider
                  label="Terrain Exaggeration"
                  value={settings.terrainExaggeration}
                  onChange={(v) => setSettings(s => ({ ...s, terrainExaggeration: v }))}
                  min={0.5}
                  max={5}
                  step={0.1}
                />

                <NeomorphicSlider
                  label="Shadow Intensity"
                  value={settings.shadowIntensity}
                  onChange={(v) => setSettings(s => ({ ...s, shadowIntensity: v }))}
                  min={0}
                  max={1}
                  step={0.1}
                />

                <NeomorphicSlider
                  label="Light Angle"
                  value={settings.lightAngle}
                  onChange={(v) => setSettings(s => ({ ...s, lightAngle: v }))}
                  min={0}
                  max={360}
                  step={15}
                />

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showRoads}
                      onChange={(e) => setSettings(s => ({ ...s, showRoads: e.target.checked }))}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-xs text-neutral-600">Show Roads</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showWater}
                      onChange={(e) => setSettings(s => ({ ...s, showWater: e.target.checked }))}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-xs text-neutral-600">Show Water</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showBuildings}
                      onChange={(e) => setSettings(s => ({ ...s, showBuildings: e.target.checked }))}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-xs text-neutral-600">Show Buildings</span>
                  </label>
                </div>
              </div>
            </NeomorphicCard>

            {/* Export Settings */}
            <NeomorphicCard variant="inset" padding="md">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">4. Export</h3>

              <NeomorphicSelect
                label="Resolution"
                value={settings.resolution}
                onChange={(v) => setSettings(s => ({ ...s, resolution: v as 'standard' | 'high' | 'ultra' }))}
                options={RESOLUTION_OPTIONS}
              />

              <div className="mt-4">
                <NeomorphicButton
                  onClick={handleExport}
                  disabled={!boundary || isExporting}
                  variant="primary"
                  className="w-full"
                >
                  {isExporting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting {exportProgress}%
                    </span>
                  ) : !boundary ? (
                    'Select boundary first'
                  ) : (
                    '📥 Export High-Res Artwork'
                  )}
                </NeomorphicButton>
              </div>

              {!boundary && (
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  Draw a boundary on the map to enable export
                </p>
              )}
            </NeomorphicCard>

            {/* Info */}
            <NeomorphicCard variant="flat" padding="sm">
              <p className="text-xs text-neutral-500">
                <strong>Tip:</strong> Inspired by Milos Makes Maps style. Use high terrain exaggeration and strong shadows for dramatic relief effects.
              </p>
            </NeomorphicCard>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Helper to update drawing preview
function updateDrawingPreview(
  map: MapLibreMap,
  start: { lng: number; lat: number },
  end: { lng: number; lat: number }
) {
  const coords = [
    [start.lng, start.lat],
    [end.lng, start.lat],
    [end.lng, end.lat],
    [start.lng, end.lat],
    [start.lng, start.lat]
  ];

  const geojson: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };

  if (map.getSource('drawing-preview')) {
    (map.getSource('drawing-preview') as maplibregl.GeoJSONSource).setData(geojson);
  } else {
    map.addSource('drawing-preview', {
      type: 'geojson',
      data: geojson
    });
    map.addLayer({
      id: 'drawing-preview-fill',
      type: 'fill',
      source: 'drawing-preview',
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.2
      }
    });
    map.addLayer({
      id: 'drawing-preview-outline',
      type: 'line',
      source: 'drawing-preview',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    });
  }
}

// Helper to finalize boundary
function finalizeBoundary(map: MapLibreMap, bounds: LngLatBounds) {
  // Remove preview
  if (map.getLayer('drawing-preview-fill')) map.removeLayer('drawing-preview-fill');
  if (map.getLayer('drawing-preview-outline')) map.removeLayer('drawing-preview-outline');
  if (map.getSource('drawing-preview')) map.removeSource('drawing-preview');

  // Add final boundary
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const coords = [
    [sw.lng, sw.lat],
    [ne.lng, sw.lat],
    [ne.lng, ne.lat],
    [sw.lng, ne.lat],
    [sw.lng, sw.lat]
  ];

  const geojson: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };

  if (map.getSource('boundary')) {
    (map.getSource('boundary') as maplibregl.GeoJSONSource).setData(geojson);
  } else {
    map.addSource('boundary', {
      type: 'geojson',
      data: geojson
    });
    map.addLayer({
      id: 'boundary-fill',
      type: 'fill',
      source: 'boundary',
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.1
      }
    });
    map.addLayer({
      id: 'boundary-outline',
      type: 'line',
      source: 'boundary',
      paint: {
        'line-color': '#10b981',
        'line-width': 3
      }
    });
  }
}

// Generate artwork map style
function getArtworkMapStyle(settings: ArtworkSettings): maplibregl.StyleSpecification {
  const styleColors = ARTWORK_STYLES[settings.style].colors;

  // Use different basemaps based on style
  const isDarkStyle = ['monochrome', 'ocean', 'sunset', 'forest', 'neon'].includes(settings.style);
  const basemapUrl = isDarkStyle
    ? 'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png'
    : 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png';

  return {
    version: 8,
    name: 'Artwork',
    sources: {
      'terrain-dem': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      },
      'terrain-hillshade': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      },
      'carto-basemap': {
        type: 'raster',
        tiles: [basemapUrl],
        tileSize: 256,
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxzoom: 20
      },
      'esri-imagery': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; Esri',
        maxzoom: 19
      },
      'overture-transportation': {
        type: 'vector',
        url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/transportation.pmtiles',
        attribution: '&copy; Overture Maps Foundation'
      }
    },
    terrain: {
      source: 'terrain-dem',
      exaggeration: settings.terrainExaggeration
    },
    sky: {
      'sky-color': styleColors.background,
      'horizon-color': styleColors.lowElevation,
      'fog-color': styleColors.shadow,
      'fog-ground-blend': 0.5
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': styleColors.background
        }
      },
      // Satellite imagery as base (very subtle)
      {
        id: 'satellite-base',
        type: 'raster',
        source: 'esri-imagery',
        paint: {
          'raster-opacity': 0.3,
          'raster-saturation': -0.8
        }
      },
      // CARTO basemap for structure/context
      {
        id: 'basemap',
        type: 'raster',
        source: 'carto-basemap',
        paint: {
          'raster-opacity': 0.5,
          'raster-saturation': -1,
          'raster-brightness-max': isDarkStyle ? 0.5 : 0.9
        }
      },
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'terrain-hillshade',
        paint: {
          'hillshade-exaggeration': settings.shadowIntensity,
          'hillshade-shadow-color': styleColors.shadow,
          'hillshade-highlight-color': styleColors.highElevation,
          'hillshade-accent-color': styleColors.midElevation,
          'hillshade-illumination-direction': settings.lightAngle
        }
      },
      ...(settings.showRoads ? [{
        id: 'roads',
        type: 'line' as const,
        source: 'overture-transportation',
        'source-layer': 'segment',
        minzoom: 8,
        paint: {
          'line-color': styleColors.roads,
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            8, 0.5,
            14, 2,
            18, 4
          ] as maplibregl.ExpressionSpecification,
          'line-opacity': 0.7
        }
      }] : [])
    ]
  };
}
