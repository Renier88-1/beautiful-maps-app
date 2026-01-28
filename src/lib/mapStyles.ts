import type { StyleSpecification, LayerSpecification } from 'maplibre-gl';
import type { Basemap, DataLayer, ColorScheme } from '@/types';

// Basemap tile configurations (only free, no-auth-required sources)
const basemapTiles: Record<Basemap, { tiles: string[]; attribution: string; maxzoom: number }> = {
  'osm': {
    tiles: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; OpenStreetMap contributors',
    maxzoom: 19
  },
  'carto-light': {
    tiles: [
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
    ],
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxzoom: 20
  },
  'carto-dark': {
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
    ],
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxzoom: 20
  },
  // CARTO Voyager - good for data viz with subtle styling
  'carto-voyager': {
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
    ],
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxzoom: 20
  },
  // CARTO Dark Matter (no labels) - good for overlays
  'carto-dark-nolabels': {
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png'
    ],
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxzoom: 20
  }
};

// Color schemes for data visualization
const colorSchemes: Record<ColorScheme, { shadow: string; highlight: string; accent: string; ramp: string[] }> = {
  heat: {
    shadow: '#a50f15',
    highlight: '#fee5d9',
    accent: '#fb6a4a',
    ramp: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15']
  },
  cool: {
    shadow: '#08306b',
    highlight: '#f7fbff',
    accent: '#6baed6',
    ramp: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b']
  },
  viridis: {
    shadow: '#440154',
    highlight: '#fde725',
    accent: '#21908d',
    ramp: ['#440154', '#3b528b', '#21908d', '#5dc863', '#fde725']
  },
  plasma: {
    shadow: '#0d0887',
    highlight: '#fca636',
    accent: '#b12a90',
    ramp: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636']
  }
};

// Get sky colors based on time of day
export function getSkyColors(timeOfDay: number) {
  const hour = timeOfDay % 24;
  if (hour >= 5 && hour < 7) {
    return { skyColor: '#ff9a56', horizonColor: '#ffcf99', fogColor: '#ffeedd' };
  } else if (hour >= 7 && hour < 17) {
    return { skyColor: '#87ceeb', horizonColor: '#c5e5f5', fogColor: '#ffffff' };
  } else if (hour >= 17 && hour < 19) {
    return { skyColor: '#ff6b4a', horizonColor: '#ffaa66', fogColor: '#ffddcc' };
  } else {
    return { skyColor: '#0a1628', horizonColor: '#1a2a48', fogColor: '#0d1a2d' };
  }
}

// Create data overlay layer based on data type and color scheme
function createDataOverlayLayers(
  dataLayer: DataLayer,
  colorScheme: ColorScheme,
  intensity: number = 1.0
): LayerSpecification[] {
  if (dataLayer === 'none') return [];

  const colors = colorSchemes[colorScheme];
  const layers: LayerSpecification[] = [];

  // For elevation - use colored hillshade with strong visibility
  if (dataLayer === 'elevation') {
    layers.push({
      id: 'data-hillshade',
      type: 'hillshade',
      source: 'terrain-data', // Use separate source for data overlays
      paint: {
        'hillshade-exaggeration': Math.min(1.0, 0.7 * intensity),
        'hillshade-shadow-color': colors.shadow,
        'hillshade-highlight-color': colors.highlight,
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 315
      }
    });
  }

  // For population - use inverted hillshade (valleys = urban = more population typically)
  // This is an approximation using terrain data as proxy
  if (dataLayer === 'population') {
    layers.push({
      id: 'data-hillshade',
      type: 'hillshade',
      source: 'terrain-data', // Use separate source for data overlays
      paint: {
        'hillshade-exaggeration': Math.min(1.0, 0.6 * intensity),
        // Invert: highlights in valleys (low areas = cities = population)
        'hillshade-shadow-color': colors.highlight,
        'hillshade-highlight-color': colors.shadow,
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 135
      }
    });
  }

  // For landcover - use terrain with different coloring
  if (dataLayer === 'landcover') {
    layers.push({
      id: 'data-hillshade',
      type: 'hillshade',
      source: 'terrain-data', // Use separate source for data overlays
      paint: {
        'hillshade-exaggeration': Math.min(1.0, 0.5 * intensity),
        'hillshade-shadow-color': '#2d5a27', // Forest green for shadows
        'hillshade-highlight-color': '#f5deb3', // Wheat for highlights (agricultural)
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 270
      }
    });
  }

  return layers;
}

// Cinematic Day/Night Style
export function getCinematicStyle(
  timeOfDay: number = 12,
  basemap: Basemap = 'osm',
  dataLayer: DataLayer = 'none',
  colorScheme: ColorScheme = 'heat'
): StyleSpecification {
  const { skyColor, horizonColor, fogColor } = getSkyColors(timeOfDay);
  const isNight = timeOfDay < 5 || timeOfDay >= 19;
  const basemapConfig = basemapTiles[basemap];
  const hasDataOverlay = dataLayer !== 'none';

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': isNight ? '#0a1628' : '#f0f4f8' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': hasDataOverlay ? (isNight ? 0.2 : 0.5) : (isNight ? 0.3 : 0.8),
        'raster-saturation': hasDataOverlay ? -0.6 : (isNight ? -0.5 : 0.2),
        'raster-brightness-min': isNight ? 0.1 : 0.0,
        'raster-brightness-max': isNight ? 0.4 : 1.0,
        'raster-contrast': 0.1
      }
    },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'terrain-hillshade', // Separate source for hillshade
      paint: {
        'hillshade-exaggeration': hasDataOverlay ? 0.2 : 0.5,
        'hillshade-shadow-color': isNight ? '#000033' : '#3d5a80',
        'hillshade-highlight-color': isNight ? '#1a2a48' : '#ffffff',
        'hillshade-accent-color': isNight ? '#0d1a2d' : '#98c1d9'
      }
    },
    ...createDataOverlayLayers(dataLayer, colorScheme, 1.2)
  ];

  return {
    version: 8,
    name: 'Cinematic',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      'terrain-data': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: 1.5 },
    sky: {
      'sky-color': skyColor,
      'sky-horizon-blend': 0.5,
      'horizon-color': horizonColor,
      'horizon-fog-blend': 0.8,
      'fog-color': fogColor,
      'fog-ground-blend': 0.9,
      'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 12, 0]
    },
    layers
  };
}

// Modern Minimalist Style
export function getMinimalistStyle(
  theme: 'light' | 'dark' = 'light',
  basemap: Basemap = 'carto-light',
  dataLayer: DataLayer = 'none',
  colorScheme: ColorScheme = 'heat',
  terrainExaggeration: number = 1.2
): StyleSpecification {
  const isLight = theme === 'light';
  const effectiveBasemap = basemap.startsWith('carto')
    ? (isLight ? 'carto-light' : 'carto-dark')
    : basemap;
  const basemapConfig = basemapTiles[effectiveBasemap];
  const hasDataOverlay = dataLayer !== 'none';

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': isLight ? '#f5f7fa' : '#0f0f1a' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': hasDataOverlay ? 0.5 : 0.9,
        'raster-saturation': hasDataOverlay ? -0.7 : -0.3
      }
    },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': hasDataOverlay ? 0.15 : 0.3,
        'hillshade-shadow-color': isLight ? '#c4c4c4' : '#0a0a14',
        'hillshade-highlight-color': isLight ? '#ffffff' : '#2a2a3e'
      }
    },
    ...createDataOverlayLayers(dataLayer, colorScheme, 1.0)
  ];

  return {
    version: 8,
    name: 'Minimalist',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      'terrain-data': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: terrainExaggeration },
    sky: {
      'sky-color': isLight ? '#e8f0f8' : '#1a1a2e',
      'sky-horizon-blend': 0.3,
      'horizon-color': isLight ? '#f5f8fa' : '#16213e',
      'horizon-fog-blend': 0.7,
      'fog-color': isLight ? '#ffffff' : '#0f0f23',
      'fog-ground-blend': 0.8
    },
    layers
  };
}

// Data Visualization Style
export function getDataStyle(
  colorScheme: ColorScheme = 'heat',
  dataLayer: DataLayer = 'elevation',
  basemap: Basemap = 'carto-light',
  intensity: number = 1.0
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];
  const hasDataOverlay = dataLayer !== 'none';

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f8fafc' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': hasDataOverlay ? 0.3 : 0.8,
        'raster-saturation': hasDataOverlay ? -0.9 : -0.3
      }
    },
    {
      id: 'hillshade-base',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.15,
        'hillshade-shadow-color': '#d0d0d0',
        'hillshade-highlight-color': '#ffffff'
      }
    },
    ...createDataOverlayLayers(dataLayer, colorScheme, intensity)
  ];

  return {
    version: 8,
    name: 'Data Visualization',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      'terrain-data': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: 1.0 },
    sky: {
      'sky-color': '#f0f4f8',
      'horizon-color': '#e8eef4',
      'fog-color': '#ffffff'
    },
    layers,
    metadata: { colorScheme, dataLayer }
  };
}

// Nolli Map Style - shows public/private space distinction
// Uses high-contrast black & white rendering to emphasize urban form
export function getNolliStyle(
  basemap: Basemap = 'carto-light'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#ffffff' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.7,
        'raster-saturation': -1.0,
        'raster-contrast': 0.8,
        'raster-brightness-min': 0.0,
        'raster-brightness-max': 0.6
      }
    },
    {
      id: 'hillshade-base',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.8,
        'hillshade-shadow-color': '#000000',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-accent-color': '#333333',
        'hillshade-illumination-direction': 315
      }
    }
  ];

  return {
    version: 8,
    name: 'Nolli',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: 0.5 },
    sky: {
      'sky-color': '#f0f0f0',
      'horizon-color': '#e0e0e0',
      'fog-color': '#ffffff'
    },
    layers
  };
}

// Figure Ground Style - building footprints / urban mass diagram
// Dark background with light built form - classic architectural diagram style
export function getFigureGroundStyle(
  basemap: Basemap = 'carto-dark-nolabels'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0a0a0a' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.6,
        'raster-saturation': -1.0,
        'raster-contrast': 0.9,
        'raster-brightness-min': 0.0,
        'raster-brightness-max': 0.5
      }
    },
    {
      id: 'hillshade-inverted',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.9,
        'hillshade-shadow-color': '#ffffff',
        'hillshade-highlight-color': '#0a0a0a',
        'hillshade-accent-color': '#666666',
        'hillshade-illumination-direction': 135
      }
    }
  ];

  return {
    version: 8,
    name: 'Figure Ground',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: 0.8 },
    sky: {
      'sky-color': '#050505',
      'horizon-color': '#0a0a0a',
      'fog-color': '#000000'
    },
    layers
  };
}

// LULC (Land Use Land Cover) Style
// Uses terrain elevation as proxy for land cover types
// Low areas (green) = vegetation/forest, High areas (tan) = urban/agricultural
export function getLulcStyle(
  colorScheme: ColorScheme = 'viridis',
  basemap: Basemap = 'carto-light'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#e8f0e8' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.2,
        'raster-saturation': -0.9
      }
    },
    {
      id: 'lulc-hillshade',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 1.0,
        'hillshade-shadow-color': '#1a5c1a',
        'hillshade-highlight-color': '#d4a574',
        'hillshade-accent-color': '#8b7355',
        'hillshade-illumination-direction': 315
      }
    },
    {
      id: 'lulc-hillshade-2',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': 0.6,
        'hillshade-shadow-color': '#2d8a2d',
        'hillshade-highlight-color': '#f5e6d3',
        'hillshade-accent-color': '#6b8e23',
        'hillshade-illumination-direction': 225
      }
    }
  ];

  return {
    version: 8,
    name: 'LULC',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      'terrain-data': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: 1.2 },
    sky: {
      'sky-color': '#c5e8c5',
      'horizon-color': '#a8d8a8',
      'fog-color': '#d8f0d8'
    },
    layers
  };
}

// Sun Path / Shadow Analysis Style
// Shows dramatic shadows based on sun position (time of day)
export function getSunpathStyle(
  timeOfDay: number = 10,
  basemap: Basemap = 'carto-light'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  // Calculate sun angle based on time of day (6am = sunrise, 6pm = sunset)
  const sunAngle = ((timeOfDay - 6) / 12) * 180;
  const illuminationDirection = (sunAngle + 90) % 360;

  // Shadow intensity - longer shadows at dawn/dusk
  const hourFromNoon = Math.abs(timeOfDay - 12);
  const shadowIntensity = 0.4 + (hourFromNoon / 6) * 0.6; // 0.4 at noon, 1.0 at 6am/6pm

  // Determine lighting colors based on time
  const isMorning = timeOfDay < 10;
  const isEvening = timeOfDay > 16;
  const isGoldenHour = isMorning || isEvening;

  const shadowColor = isGoldenHour ? '#2d1b4e' : '#1a2744';
  const highlightColor = isGoldenHour ? '#ffdd88' : '#fff8dc';
  const accentColor = isGoldenHour ? '#ff6600' : '#ffa500';

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': isGoldenHour ? '#fff0d4' : '#f5f8fa' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.25,
        'raster-saturation': isGoldenHour ? 0.2 : -0.3
      }
    },
    {
      id: 'shadow-hillshade',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': Math.min(1.0, shadowIntensity),
        'hillshade-shadow-color': shadowColor,
        'hillshade-highlight-color': highlightColor,
        'hillshade-accent-color': accentColor,
        'hillshade-illumination-direction': illuminationDirection
      }
    },
    {
      id: 'shadow-overlay',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': Math.min(0.8, shadowIntensity * 0.7),
        'hillshade-shadow-color': '#000033',
        'hillshade-highlight-color': 'transparent',
        'hillshade-accent-color': '#333366',
        'hillshade-illumination-direction': illuminationDirection
      }
    }
  ];

  return {
    version: 8,
    name: 'Sun Path',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      'terrain-3d': {
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
      'terrain-data': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15
      }
    },
    terrain: { source: 'terrain-3d', exaggeration: 2.0 },
    sky: {
      'sky-color': isGoldenHour ? '#ff9966' : '#87ceeb',
      'horizon-color': isGoldenHour ? '#ffcc99' : '#c5e5f5',
      'fog-color': isGoldenHour ? '#ffeedd' : '#f0f8ff'
    },
    layers
  };
}

// Get style by name
import type { MapStyle } from '@/types';

export function getMapStyle(
  styleName: MapStyle,
  options?: {
    timeOfDay?: number;
    theme?: 'light' | 'dark';
    colorScheme?: ColorScheme;
    basemap?: Basemap;
    dataLayer?: DataLayer;
    terrainExaggeration?: number;
    intensity?: number;
  }
): StyleSpecification {
  const basemap = options?.basemap || 'osm';
  const dataLayer = options?.dataLayer || 'none';
  const colorScheme = options?.colorScheme || 'heat';

  switch (styleName) {
    case 'cinematic':
      return getCinematicStyle(
        options?.timeOfDay ?? 12,
        basemap,
        dataLayer,
        colorScheme
      );
    case 'minimalist':
      return getMinimalistStyle(
        options?.theme ?? 'light',
        basemap,
        dataLayer,
        colorScheme,
        options?.terrainExaggeration ?? 1.2
      );
    case 'data':
      return getDataStyle(
        colorScheme,
        dataLayer === 'none' ? 'elevation' : dataLayer,
        basemap,
        options?.intensity ?? 1.0
      );
    case 'nolli':
      return getNolliStyle(basemap);
    case 'figure-ground':
      return getFigureGroundStyle(basemap);
    case 'lulc':
      return getLulcStyle(colorScheme, basemap);
    case 'sunpath':
      return getSunpathStyle(options?.timeOfDay ?? 10, basemap);
    default:
      return getCinematicStyle(12, basemap, dataLayer, colorScheme);
  }
}
