import type { StyleSpecification, LayerSpecification, SourceSpecification } from 'maplibre-gl';
import type { Basemap, DataLayer, ColorScheme } from '@/types';

// ============================================================================
// REAL DATA LAYER SOURCES
// These are actual data sources for population, landcover, and tree canopy
// ============================================================================

const dataLayerSources: Record<string, {
  tiles: string[];
  attribution: string;
  maxzoom: number;
  tileSize?: number;
}> = {
  // Population Density - Global Human Settlement Layer
  // Fallback to proxy that serves real population density tiles
  'population-density': {
    tiles: ['/api/tiles?source=ghsl&z={z}&x={x}&y={y}'],
    attribution: '&copy; EU JRC GHSL',
    maxzoom: 14,
    tileSize: 256
  },

  // Land Cover - ESRI 10m Land Cover (publicly accessible)
  'landcover-esri': {
    tiles: [
      'https://lulctimeseries.blob.core.windows.net/lulctimeseriesv003/lc2022/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; ESRI, Impact Observatory',
    maxzoom: 14,
    tileSize: 256
  },

  // Tree Canopy - Global Forest Watch Hansen Tree Cover 2000
  'tree-canopy-gfw': {
    tiles: [
      'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/tree_cover_2000/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; Hansen/UMD/Google/USGS/NASA',
    maxzoom: 12,
    tileSize: 256
  },

  // Tree Cover Loss - Global Forest Watch
  'tree-loss-gfw': {
    tiles: [
      'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/loss_year/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; Hansen/UMD/Google/USGS/NASA',
    maxzoom: 12,
    tileSize: 256
  }
};

// Helper function to create data layer source specifications
function createDataLayerSources(dataLayer: DataLayer): Record<string, SourceSpecification> {
  const sources: Record<string, SourceSpecification> = {};

  if (dataLayer === 'population') {
    sources['data-layer-raster'] = {
      type: 'raster',
      tiles: dataLayerSources['population-density'].tiles,
      tileSize: dataLayerSources['population-density'].tileSize || 256,
      attribution: dataLayerSources['population-density'].attribution,
      maxzoom: dataLayerSources['population-density'].maxzoom
    };
  } else if (dataLayer === 'landcover') {
    sources['data-layer-raster'] = {
      type: 'raster',
      tiles: dataLayerSources['landcover-esri'].tiles,
      tileSize: dataLayerSources['landcover-esri'].tileSize || 256,
      attribution: dataLayerSources['landcover-esri'].attribution,
      maxzoom: dataLayerSources['landcover-esri'].maxzoom
    };
  }
  // Elevation still uses terrain-data (DEM), tree canopy is handled specially

  return sources;
}

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
  },
  // ESRI World Imagery - Satellite imagery (free, no auth required)
  'esri-imagery': {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxzoom: 19
  },
  // ESRI World Terrain - Shaded relief with labels
  'esri-terrain': {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '&copy; Esri, USGS, NOAA',
    maxzoom: 13
  },
  // ESRI National Geographic - Classic NatGeo style
  'esri-natgeo': {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '&copy; Esri, National Geographic',
    maxzoom: 16
  },
  // OpenTopoMap - Topographic map with contours
  'opentopo': {
    tiles: [
      'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
    maxzoom: 17
  },
  // Stadia Stamen Terrain - Artistic terrain visualization
  'stamen-terrain': {
    tiles: [
      'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; Stadia Maps &copy; Stamen Design &copy; OpenMapTiles &copy; OpenStreetMap',
    maxzoom: 18
  },
  // Stadia Stamen Toner - High contrast black and white
  'stamen-toner': {
    tiles: [
      'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png'
    ],
    attribution: '&copy; Stadia Maps &copy; Stamen Design &copy; OpenMapTiles &copy; OpenStreetMap',
    maxzoom: 20
  },
  // Stadia Stamen Watercolor - Artistic watercolor style
  'stamen-watercolor': {
    tiles: [
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
    ],
    attribution: '&copy; Stadia Maps &copy; Stamen Design &copy; OpenMapTiles &copy; OpenStreetMap',
    maxzoom: 16
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
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': Math.min(1.0, 0.7 * intensity),
        'hillshade-shadow-color': colors.shadow,
        'hillshade-highlight-color': colors.highlight,
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 315
      }
    });
  }

  // For population - use REAL population density raster tiles
  // Data source: GHSL (Global Human Settlement Layer) or fallback
  if (dataLayer === 'population') {
    // Add the real raster layer for population density
    layers.push({
      id: 'data-raster-population',
      type: 'raster',
      source: 'data-layer-raster',
      paint: {
        'raster-opacity': Math.min(0.85, 0.7 * intensity),
        'raster-resampling': 'linear',
        'raster-fade-duration': 300
      }
    });

    // Add a subtle hillshade overlay to show terrain context
    layers.push({
      id: 'data-hillshade',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': Math.min(0.3, 0.2 * intensity),
        'hillshade-shadow-color': colors.shadow,
        'hillshade-highlight-color': 'rgba(255,255,255,0.3)',
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 315
      }
    });
  }

  // For landcover - use REAL land cover raster tiles
  // Data source: ESRI 10m Land Cover
  if (dataLayer === 'landcover') {
    // Add the real raster layer for land cover
    layers.push({
      id: 'data-raster-landcover',
      type: 'raster',
      source: 'data-layer-raster',
      paint: {
        'raster-opacity': Math.min(0.8, 0.65 * intensity),
        'raster-resampling': 'nearest', // Preserve discrete classes
        'raster-fade-duration': 300
      }
    });

    // Add hillshade for terrain context
    layers.push({
      id: 'data-hillshade',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': Math.min(0.4, 0.3 * intensity),
        'hillshade-shadow-color': '#2d5a27',
        'hillshade-highlight-color': 'rgba(255,255,255,0.4)',
        'hillshade-accent-color': '#6b8e23',
        'hillshade-illumination-direction': 315
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

  // Build sources including real data layer sources if needed
  const sources: Record<string, SourceSpecification> = {
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
    },
    // Add real data layer sources
    ...createDataLayerSources(dataLayer)
  };

  return {
    version: 8,
    name: 'Cinematic',
    sources,
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

  // Build sources including real data layer sources if needed
  const sources: Record<string, SourceSpecification> = {
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
    },
    // Add real data layer sources
    ...createDataLayerSources(dataLayer)
  };

  return {
    version: 8,
    name: 'Minimalist',
    sources,
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

  // Build sources including real data layer sources if needed
  const sources: Record<string, SourceSpecification> = {
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
    },
    // Add real data layer sources
    ...createDataLayerSources(dataLayer)
  };

  return {
    version: 8,
    name: 'Data Visualization',
    sources,
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
// Nolli Style - architectural mapping with REAL building footprints
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
        'raster-opacity': 0.4,
        'raster-saturation': -1.0,
        'raster-contrast': 0.5,
        'raster-brightness-min': 0.4,
        'raster-brightness-max': 0.9
      }
    },
    // Subtle terrain context
    {
      id: 'terrain-context',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.2,
        'hillshade-shadow-color': '#d0d0d0',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-illumination-direction': 315
      }
    },
    // REAL Building footprints from Overture Maps - Nolli-style solid black
    {
      id: 'buildings-fill',
      type: 'fill',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 12,
      paint: {
        'fill-color': '#1a1a1a',
        'fill-opacity': 0.95
      }
    },
    // Building outlines for crisp definition
    {
      id: 'buildings-outline',
      type: 'line',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'line-color': '#000000',
        'line-width': 0.5,
        'line-opacity': 0.8
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
      // Overture Maps Buildings - REAL building footprints
      'overture-buildings': {
        type: 'vector',
        url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
        attribution: '&copy; Overture Maps Foundation'
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
    terrain: { source: 'terrain-3d', exaggeration: 0.3 },
    sky: {
      'sky-color': '#f8f8f8',
      'horizon-color': '#f0f0f0',
      'fog-color': '#ffffff'
    },
    layers
  };
}

// Figure Ground Style - REAL building footprints / urban mass diagram
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
        'raster-opacity': 0.2,
        'raster-saturation': -1.0,
        'raster-contrast': 0.5,
        'raster-brightness-min': 0.0,
        'raster-brightness-max': 0.2
      }
    },
    // Subtle terrain shadow
    {
      id: 'terrain-shadow',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.15,
        'hillshade-shadow-color': '#000000',
        'hillshade-highlight-color': '#1a1a1a',
        'hillshade-illumination-direction': 315
      }
    },
    // REAL Building footprints from Overture Maps - white on black
    {
      id: 'buildings-fill',
      type: 'fill',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 12,
      paint: {
        'fill-color': '#ffffff',
        'fill-opacity': 0.95
      }
    },
    // Building outlines for definition
    {
      id: 'buildings-outline',
      type: 'line',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.3,
        'line-opacity': 0.5
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
      // Overture Maps Buildings - REAL building footprints
      'overture-buildings': {
        type: 'vector',
        url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
        attribution: '&copy; Overture Maps Foundation'
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
      'sky-color': '#050505',
      'horizon-color': '#0a0a0a',
      'fog-color': '#000000'
    },
    layers
  };
}

// LULC (Land Use Land Cover) Style - using REAL ESRI 10m Land Cover data
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
        'raster-opacity': 0.3,
        'raster-saturation': -0.7
      }
    },
    // REAL Land Cover data from ESRI 10m classification
    {
      id: 'lulc-esri',
      type: 'raster',
      source: 'esri-landcover',
      paint: {
        'raster-opacity': 0.8,
        'raster-resampling': 'nearest', // Preserve discrete class colors
        'raster-fade-duration': 300
      }
    },
    // Subtle terrain hillshade for context
    {
      id: 'terrain-context',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.25,
        'hillshade-shadow-color': '#4a4a4a',
        'hillshade-highlight-color': 'rgba(255,255,255,0.4)',
        'hillshade-illumination-direction': 315
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
      // ESRI 10m Land Cover 2022 - REAL data
      'esri-landcover': {
        type: 'raster',
        tiles: dataLayerSources['landcover-esri'].tiles,
        tileSize: 256,
        attribution: dataLayerSources['landcover-esri'].attribution,
        maxzoom: dataLayerSources['landcover-esri'].maxzoom
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
    terrain: { source: 'terrain-3d', exaggeration: 1.0 },
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

// Isochrone Style - light background optimized for colored isochrone overlays
// Includes REAL building footprints from Overture Maps and 3D terrain
export function getIsochroneStyle(
  basemap: Basemap = 'carto-light'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f0f4f8' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.85,
        'raster-saturation': -0.2
      }
    },
    // Enhanced hillshade for 3D terrain effect
    {
      id: 'hillshade-subtle',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.35,
        'hillshade-shadow-color': '#a0a0a0',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-accent-color': '#c0c0c0',
        'hillshade-illumination-direction': 315
      }
    },
    // REAL Building footprints from Overture Maps - subtle gray fill
    {
      id: 'buildings-fill',
      type: 'fill',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': '#d0d0d0',
        'fill-opacity': 0.6
      }
    },
    // Building outlines for crisp definition
    {
      id: 'buildings-outline',
      type: 'line',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'line-color': '#b0b0b0',
        'line-width': 0.5,
        'line-opacity': 0.7
      }
    }
  ];

  return {
    version: 8,
    name: 'Isochrone',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      // Overture Maps Buildings - REAL building footprints
      'overture-buildings': {
        type: 'vector',
        url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
        attribution: '&copy; Overture Maps Foundation'
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
    terrain: { source: 'terrain-3d', exaggeration: 1.2 },
    sky: {
      'sky-color': '#e8f0f8',
      'horizon-color': '#f5f8fa',
      'fog-color': '#ffffff'
    },
    layers
  };
}

// Comparison Style - clean basemap for before/after comparison
export function getComparisonStyle(
  basemap: Basemap = 'carto-voyager'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f5f5f5' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.95,
        'raster-saturation': 0.0
      }
    },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.3,
        'hillshade-shadow-color': '#a0a0a0',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-illumination-direction': 315
      }
    }
  ];

  return {
    version: 8,
    name: 'Comparison',
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
    terrain: { source: 'terrain-3d', exaggeration: 1.0 },
    sky: {
      'sky-color': '#e0e8f0',
      'horizon-color': '#f0f4f8',
      'fog-color': '#ffffff'
    },
    layers
  };
}

// Roads Style - optimized for road network visualization
export function getRoadsStyle(
  basemap: Basemap = 'carto-dark',
  colorScheme: ColorScheme = 'heat'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];
  const colors = colorSchemes[colorScheme];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#1a1a2e' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.3,
        'raster-saturation': -0.8,
        'raster-brightness-max': 0.4
      }
    },
    {
      id: 'hillshade-subtle',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.4,
        'hillshade-shadow-color': colors.shadow,
        'hillshade-highlight-color': colors.highlight,
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 315
      }
    },
    // Road network overlay using hillshade patterns
    {
      id: 'road-density',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': 0.6,
        'hillshade-shadow-color': colors.ramp[4],
        'hillshade-highlight-color': colors.ramp[0],
        'hillshade-accent-color': colors.ramp[2],
        'hillshade-illumination-direction': 45
      }
    }
  ];

  return {
    version: 8,
    name: 'Roads',
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
    terrain: { source: 'terrain-3d', exaggeration: 0.8 },
    sky: {
      'sky-color': '#0a0a1a',
      'horizon-color': '#1a1a2e',
      'fog-color': '#0d0d1a'
    },
    layers
  };
}

// Tree Canopy Style - urban forest visualization using REAL GFW data
export function getTreeCanopyStyle(
  basemap: Basemap = 'carto-light',
  colorScheme: ColorScheme = 'viridis'
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f0f5f0' }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': 0.5,
        'raster-saturation': -0.3
      }
    },
    // REAL tree canopy data from Global Forest Watch
    {
      id: 'tree-canopy-gfw',
      type: 'raster',
      source: 'gfw-tree-cover',
      paint: {
        'raster-opacity': 0.75,
        'raster-resampling': 'linear',
        'raster-fade-duration': 300
      }
    },
    // Subtle terrain hillshade for context
    {
      id: 'terrain-context',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.3,
        'hillshade-shadow-color': '#2d5a27',
        'hillshade-highlight-color': 'rgba(255,255,255,0.3)',
        'hillshade-accent-color': '#4da64d',
        'hillshade-illumination-direction': 315
      }
    }
  ];

  return {
    version: 8,
    name: 'Tree Canopy',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      // Global Forest Watch Tree Cover 2000 - REAL data
      'gfw-tree-cover': {
        type: 'raster',
        tiles: dataLayerSources['tree-canopy-gfw'].tiles,
        tileSize: 256,
        attribution: dataLayerSources['tree-canopy-gfw'].attribution,
        maxzoom: dataLayerSources['tree-canopy-gfw'].maxzoom
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
    terrain: { source: 'terrain-3d', exaggeration: 1.2 },
    sky: {
      'sky-color': '#b8d4b8',
      'horizon-color': '#d0e8d0',
      'fog-color': '#e8f0e8'
    },
    layers
  };
}

// Lighthouse Style - dramatic coastal visualization with atmospheric effects
export function getLighthouseStyle(
  basemap: Basemap = 'carto-dark',
  colorScheme: ColorScheme = 'cool',
  nightMode: boolean = true,
  fogDensity: number = 0.5
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];
  const colors = colorSchemes[colorScheme];

  const bgColor = nightMode ? '#0a1628' : '#2c3e50';
  const fogColor = nightMode ? '#1a2a4a' : '#5a6a7a';
  const beamColor = nightMode ? '#fffde0' : '#fff8dc';

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': bgColor }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': nightMode ? 0.2 : 0.4,
        'raster-saturation': nightMode ? -0.8 : -0.4,
        'raster-brightness-max': nightMode ? 0.3 : 0.6
      }
    },
    // Atmospheric fog layer
    {
      id: 'atmospheric-fog',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.3 * fogDensity,
        'hillshade-shadow-color': fogColor,
        'hillshade-highlight-color': nightMode ? '#2a3a5a' : '#7a8a9a',
        'hillshade-illumination-direction': 315
      }
    },
    // Coastal terrain
    {
      id: 'coastal-terrain',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': 0.8,
        'hillshade-shadow-color': colors.shadow,
        'hillshade-highlight-color': nightMode ? beamColor : colors.highlight,
        'hillshade-accent-color': colors.accent,
        'hillshade-illumination-direction': 45
      }
    },
    // Simulated beam effect using terrain patterns
    {
      id: 'lighthouse-beam',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': nightMode ? 0.7 : 0.3,
        'hillshade-shadow-color': 'transparent',
        'hillshade-highlight-color': beamColor,
        'hillshade-accent-color': nightMode ? '#ffd700' : '#f0e68c',
        'hillshade-illumination-direction': 90
      }
    }
  ];

  return {
    version: 8,
    name: 'Lighthouse',
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
    terrain: { source: 'terrain-3d', exaggeration: 1.8 },
    sky: {
      'sky-color': nightMode ? '#0a0a1a' : '#4a6a8a',
      'horizon-color': nightMode ? '#1a2a4a' : '#6a8aaa',
      'fog-color': fogColor
    },
    layers
  };
}

// 3D City Style - stylized urban visualization with REAL building footprints
// Uses Overture Maps buildings PMTiles for actual building data
export function get3DCityStyle(
  basemap: Basemap = 'carto-dark-nolabels',
  colorScheme: ColorScheme = 'plasma',
  renderStyle: 'realistic' | 'stylized' | 'blueprint' | 'neon' = 'stylized',
  buildingHeight: number = 2.0
): StyleSpecification {
  const basemapConfig = basemapTiles[basemap];

  // Define style-specific colors
  const styleColors = {
    realistic: {
      bg: '#2d3436',
      building: '#636e72',
      highlight: '#dfe6e9',
      accent: '#74b9ff',
      shadow: '#1e272e',
      outline: '#2d3436'
    },
    stylized: {
      bg: '#1a1a2e',
      building: '#4a3f5c',
      highlight: '#e94560',
      accent: '#0f3460',
      shadow: '#16213e',
      outline: '#e94560'
    },
    blueprint: {
      bg: '#0a1929',
      building: '#1e3a5f',
      highlight: '#4fc3f7',
      accent: '#29b6f6',
      shadow: '#0d47a1',
      outline: '#4fc3f7'
    },
    neon: {
      bg: '#0f0c29',
      building: '#302b63',
      highlight: '#ff00ff',
      accent: '#00ffff',
      shadow: '#24243e',
      outline: '#00ffff'
    }
  };

  const sc = styleColors[renderStyle];

  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': sc.bg }
    },
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap',
      paint: {
        'raster-opacity': renderStyle === 'blueprint' ? 0.15 : 0.25,
        'raster-saturation': renderStyle === 'neon' ? 0.5 : -0.7,
        'raster-brightness-max': 0.4,
        'raster-contrast': renderStyle === 'neon' ? 0.5 : 0
      }
    },
    // Subtle terrain context
    {
      id: 'terrain-context',
      type: 'hillshade',
      source: 'terrain-hillshade',
      paint: {
        'hillshade-exaggeration': 0.3,
        'hillshade-shadow-color': sc.shadow,
        'hillshade-highlight-color': sc.building,
        'hillshade-illumination-direction': 315
      }
    },
    // REAL 3D Buildings from Overture Maps
    {
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'height'], 10],
          0, sc.building,
          20, sc.highlight,
          50, sc.accent,
          100, sc.highlight
        ],
        'fill-extrusion-height': [
          '*',
          ['coalesce', ['get', 'height'], ['get', 'num_floors'], 10],
          buildingHeight
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.9
      }
    },
    // Building outlines for definition
    {
      id: 'buildings-outline',
      type: 'line',
      source: 'overture-buildings',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'line-color': sc.outline,
        'line-width': renderStyle === 'neon' ? 1.5 : 0.5,
        'line-opacity': renderStyle === 'neon' ? 0.8 : 0.4
      }
    }
  ];

  // Add neon glow effect for neon style
  if (renderStyle === 'neon') {
    // Insert glow layer before buildings
    layers.splice(3, 0, {
      id: 'neon-glow-base',
      type: 'hillshade',
      source: 'terrain-data',
      paint: {
        'hillshade-exaggeration': 0.3,
        'hillshade-shadow-color': 'transparent',
        'hillshade-highlight-color': '#ff00ff',
        'hillshade-accent-color': '#00ffff',
        'hillshade-illumination-direction': 270
      }
    });
  }

  return {
    version: 8,
    name: '3D City',
    sources: {
      'basemap': {
        type: 'raster',
        tiles: basemapConfig.tiles,
        tileSize: 256,
        attribution: basemapConfig.attribution,
        maxzoom: basemapConfig.maxzoom
      },
      // Overture Maps Buildings - REAL building footprints
      'overture-buildings': {
        type: 'vector',
        url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
        attribution: '&copy; Overture Maps Foundation'
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
    terrain: { source: 'terrain-3d', exaggeration: buildingHeight * 0.8 },
    sky: {
      'sky-color': sc.bg,
      'horizon-color': sc.shadow,
      'fog-color': sc.shadow
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
    case 'isochrone':
      return getIsochroneStyle(basemap);
    case 'comparison':
      return getComparisonStyle(basemap);
    case 'roads':
      return getRoadsStyle(basemap, colorScheme);
    case 'tree-canopy':
      return getTreeCanopyStyle(basemap, colorScheme);
    case 'lighthouse':
      return getLighthouseStyle(basemap, colorScheme);
    case '3d-city':
      return get3DCityStyle(basemap, colorScheme);
    default:
      return getCinematicStyle(12, basemap, dataLayer, colorScheme);
  }
}
