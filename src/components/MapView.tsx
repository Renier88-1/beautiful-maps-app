'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import { getMapStyle } from '@/lib/mapStyles';
import type { MapStyle, Basemap, DataLayer, ColorScheme } from '@/types';

// Register PMTiles protocol globally (only once)
let pmtilesProtocolRegistered = false;

export interface MapViewRef {
  map: MapLibreMap | null;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  setStyle: (style: MapStyle, options?: Record<string, unknown>) => void;
  getCanvas: () => HTMLCanvasElement | null;
  getCenter: () => { lng: number; lat: number } | null;
  getZoom: () => number | null;
  getPitch: () => number | null;
  getBearing: () => number | null;
}

interface MapViewProps {
  initialStyle?: MapStyle;
  initialCenter?: [number, number];
  initialZoom?: number;
  initialPitch?: number;
  initialBearing?: number;
  onLoad?: () => void;
  onMoveEnd?: (center: { lng: number; lat: number }, zoom: number) => void;
  onClick?: (lng: number, lat: number) => void;
  className?: string;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(function MapView(
  {
    initialStyle = 'cinematic',
    initialCenter = [28.2293, -25.7479], // Pretoria, South Africa
    initialZoom = 12,
    initialPitch = 60,
    initialBearing = -17.6,
    onLoad,
    onMoveEnd,
    onClick,
    className = ''
  },
  ref
) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use refs to store the latest callbacks so they're always current
  const onClickRef = useRef(onClick);
  const onMoveEndRef = useRef(onMoveEnd);

  // Keep refs updated with latest callbacks
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    onMoveEndRef.current = onMoveEnd;
  }, [onMoveEnd]);

  useImperativeHandle(ref, () => ({
    map: mapRef.current,
    flyTo: (lng: number, lat: number, zoom?: number) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: zoom || mapRef.current.getZoom(),
          pitch: 60,
          bearing: -17.6,
          duration: 2000,
          essential: true
        });
      }
    },
    setStyle: (style: MapStyle, options?: Record<string, unknown>) => {
      if (mapRef.current) {
        const styleSpec = getMapStyle(style, {
          timeOfDay: options?.timeOfDay as number,
          theme: options?.theme as 'light' | 'dark',
          colorScheme: options?.colorScheme as ColorScheme,
          basemap: options?.basemap as Basemap,
          dataLayer: options?.dataLayer as DataLayer,
          terrainExaggeration: options?.terrainExaggeration as number,
          intensity: options?.intensity as number
        });
        mapRef.current.setStyle(styleSpec);
      }
    },
    getCanvas: () => {
      return mapRef.current?.getCanvas() || null;
    },
    getCenter: () => {
      if (!mapRef.current) return null;
      const center = mapRef.current.getCenter();
      return { lng: center.lng, lat: center.lat };
    },
    getZoom: () => {
      return mapRef.current?.getZoom() ?? null;
    },
    getPitch: () => {
      return mapRef.current?.getPitch() ?? null;
    },
    getBearing: () => {
      return mapRef.current?.getBearing() ?? null;
    }
  }));

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Register PMTiles protocol for vector tile support (only once)
    if (!pmtilesProtocolRegistered) {
      const protocol = new Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
      pmtilesProtocolRegistered = true;
    }

    const styleSpec = getMapStyle(initialStyle, { timeOfDay: 12 });

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleSpec,
      center: initialCenter,
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      maxPitch: 85,
      attributionControl: false,
      canvasContextAttributes: {
        antialias: true,
        preserveDrawingBuffer: true // Required for canvas export
      }
    });

    // Add attribution control
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true
      }),
      'bottom-right'
    );

    // Add navigation controls
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true
      }),
      'top-right'
    );

    // Add scale control
    map.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100
      }),
      'bottom-left'
    );

    // Add fullscreen control
    map.addControl(
      new maplibregl.FullscreenControl(),
      'top-right'
    );

    map.on('load', () => {
      setIsLoaded(true);
      onLoad?.();
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMoveEndRef.current?.({ lng: center.lng, lat: center.lat }, zoom);
    });

    map.on('click', (e) => {
      onClickRef.current?.(e.lngLat.lng, e.lngLat.lat);
    });

    mapRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-600 text-sm">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
});
