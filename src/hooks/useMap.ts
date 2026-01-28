'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { getMapStyle } from '@/lib/mapStyles';
import type { MapStyle } from '@/types';

interface UseMapOptions {
  container: string | HTMLElement;
  initialStyle?: MapStyle;
  initialCenter?: [number, number];
  initialZoom?: number;
  initialPitch?: number;
  initialBearing?: number;
}

interface UseMapReturn {
  map: MapLibreMap | null;
  isLoaded: boolean;
  error: string | null;
  setStyle: (style: MapStyle, options?: Record<string, unknown>) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  getCenter: () => { lng: number; lat: number } | null;
  getZoom: () => number | null;
  getPitch: () => number | null;
  getBearing: () => number | null;
  setTimeOfDay: (time: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setColorScheme: (scheme: 'heat' | 'cool' | 'viridis' | 'plasma') => void;
  setTerrainExaggeration: (exaggeration: number) => void;
}

export function useMap(options: UseMapOptions): UseMapReturn {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<MapStyle>(options.initialStyle || 'cinematic');
  const [styleOptions, setStyleOptions] = useState<Record<string, unknown>>({});

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    try {
      const initialStyleSpec = getMapStyle(options.initialStyle || 'cinematic', {
        timeOfDay: 12,
        theme: 'light',
        colorScheme: 'heat'
      });

      const map = new maplibregl.Map({
        container: options.container,
        style: initialStyleSpec,
        center: options.initialCenter || [28.2293, -25.7479], // Pretoria, South Africa
        zoom: options.initialZoom || 12,
        pitch: options.initialPitch || 60,
        bearing: options.initialBearing || -17.6,
        maxPitch: 85,
        canvasContextAttributes: {
          antialias: true,
          preserveDrawingBuffer: true
        }
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      map.on('load', () => {
        setIsLoaded(true);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError(e.error?.message || 'Map error occurred');
      });

      mapRef.current = map;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [options.container, options.initialCenter, options.initialZoom, options.initialPitch, options.initialBearing, options.initialStyle]);

  // Set map style
  const setStyle = useCallback((style: MapStyle, opts?: Record<string, unknown>) => {
    if (!mapRef.current) return;

    const newOptions = { ...styleOptions, ...opts };
    setStyleOptions(newOptions);
    setCurrentStyle(style);

    const styleSpec = getMapStyle(style, {
      timeOfDay: (newOptions.timeOfDay as number) || 12,
      theme: (newOptions.theme as 'light' | 'dark') || 'light',
      colorScheme: (newOptions.colorScheme as 'heat' | 'cool' | 'viridis' | 'plasma') || 'heat'
    });

    mapRef.current.setStyle(styleSpec);
  }, [styleOptions]);

  // Fly to location
  const flyTo = useCallback((lng: number, lat: number, zoom?: number) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoom || mapRef.current.getZoom(),
      pitch: 60,
      bearing: -17.6,
      duration: 2000,
      essential: true
    });
  }, []);

  // Get current center
  const getCenter = useCallback(() => {
    if (!mapRef.current) return null;
    const center = mapRef.current.getCenter();
    return { lng: center.lng, lat: center.lat };
  }, []);

  // Get current zoom
  const getZoom = useCallback(() => {
    if (!mapRef.current) return null;
    return mapRef.current.getZoom();
  }, []);

  // Get current pitch
  const getPitch = useCallback(() => {
    if (!mapRef.current) return null;
    return mapRef.current.getPitch();
  }, []);

  // Get current bearing
  const getBearing = useCallback(() => {
    if (!mapRef.current) return null;
    return mapRef.current.getBearing();
  }, []);

  // Set time of day (for cinematic style)
  const setTimeOfDay = useCallback((time: number) => {
    setStyle(currentStyle, { ...styleOptions, timeOfDay: time });
  }, [currentStyle, styleOptions, setStyle]);

  // Set theme (for minimalist style)
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setStyle(currentStyle, { ...styleOptions, theme });
  }, [currentStyle, styleOptions, setStyle]);

  // Set color scheme (for data style)
  const setColorScheme = useCallback((scheme: 'heat' | 'cool' | 'viridis' | 'plasma') => {
    setStyle(currentStyle, { ...styleOptions, colorScheme: scheme });
  }, [currentStyle, styleOptions, setStyle]);

  // Set terrain exaggeration
  const setTerrainExaggeration = useCallback((exaggeration: number) => {
    if (!mapRef.current) return;

    const style = mapRef.current.getStyle();
    if (style && style.terrain) {
      style.terrain.exaggeration = exaggeration;
      mapRef.current.setStyle(style);
    }
  }, []);

  return {
    map: mapRef.current,
    isLoaded,
    error,
    setStyle,
    flyTo,
    getCenter,
    getZoom,
    getPitch,
    getBearing,
    setTimeOfDay,
    setTheme,
    setColorScheme,
    setTerrainExaggeration
  };
}
