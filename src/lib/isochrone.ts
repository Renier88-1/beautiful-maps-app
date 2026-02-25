import type { TravelMode, IsochroneColorScale, IsochroneMode } from '@/types';
import type { Map as MapLibreMap } from 'maplibre-gl';

// Travel speeds in km/h (for circle mode)
const TRAVEL_SPEEDS: Record<TravelMode, number> = {
  walking: 5,
  cycling: 15,
  driving: 50
};

// Valhalla costing modes
const VALHALLA_COSTING: Record<TravelMode, string> = {
  walking: 'pedestrian',
  cycling: 'bicycle',
  driving: 'auto'
};

// Generate isochrones based on mode
export async function generateIsochrones(
  center: { lng: number; lat: number },
  intervals: number[], // minutes
  travelMode: TravelMode,
  mode: IsochroneMode = 'circles'
): Promise<GeoJSON.FeatureCollection> {
  if (mode === 'routed') {
    return generateRoutedIsochrones(center, intervals, travelMode);
  }
  return generateCircleIsochrones(center, intervals, travelMode);
}

// Generate concentric circles as approximate isochrones (original implementation)
export function generateCircleIsochrones(
  center: { lng: number; lat: number },
  intervals: number[], // minutes
  travelMode: TravelMode
): GeoJSON.FeatureCollection {
  const speed = TRAVEL_SPEEDS[travelMode]; // km/h

  const features: GeoJSON.Feature[] = intervals.map((minutes, index) => {
    // Distance = speed * time (convert minutes to hours)
    const distanceKm = speed * (minutes / 60);
    const distanceMeters = distanceKm * 1000;

    // Generate circle polygon
    const polygon = createCirclePolygon(center, distanceMeters, 64);

    return {
      type: 'Feature',
      properties: {
        minutes,
        index,
        distance: distanceKm.toFixed(1),
        mode: travelMode,
        isochroneMode: 'circles'
      },
      geometry: polygon
    };
  });

  // Reverse so larger circles are drawn first (underneath)
  return {
    type: 'FeatureCollection',
    features: features.reverse()
  };
}

// Generate routed isochrones using Valhalla API (via public OSM endpoint)
export async function generateRoutedIsochrones(
  center: { lng: number; lat: number },
  intervals: number[], // minutes
  travelMode: TravelMode
): Promise<GeoJSON.FeatureCollection> {
  try {
    // Use Valhalla public endpoint via OpenStreetMap
    const costing = VALHALLA_COSTING[travelMode];

    // Build contours array for Valhalla
    const contours = intervals.map((minutes, index) => ({
      time: minutes,
      color: getContourColor(index, intervals.length)
    }));

    const requestBody = {
      locations: [{ lat: center.lat, lon: center.lng }],
      costing,
      contours,
      polygons: true,
      denoise: 0.5,
      generalize: 50
    };

    // Try multiple Valhalla endpoints
    const endpoints = [
      'https://valhalla1.openstreetmap.de/isochrone',
      'https://routing.openstreetmap.de/valhalla/isochrone'
    ];

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        continue;
      }
    }

    if (!response || !response.ok) {
      console.warn('Valhalla API unavailable, falling back to circles:', lastError);
      return generateCircleIsochrones(center, intervals, travelMode);
    }

    const data = await response.json();

    // Transform Valhalla response to our format
    if (data.features && Array.isArray(data.features)) {
      const features: GeoJSON.Feature[] = data.features.map((feature: GeoJSON.Feature, index: number) => {
        const contour = feature.properties?.contour || intervals[index];
        return {
          type: 'Feature',
          properties: {
            minutes: contour,
            index: intervals.indexOf(contour) >= 0 ? intervals.indexOf(contour) : index,
            mode: travelMode,
            isochroneMode: 'routed'
          },
          geometry: feature.geometry
        };
      });

      // Sort by minutes descending so larger isochrones render underneath
      features.sort((a, b) => (b.properties?.minutes || 0) - (a.properties?.minutes || 0));

      return {
        type: 'FeatureCollection',
        features
      };
    }

    // Fallback if response format is unexpected
    console.warn('Unexpected Valhalla response format, falling back to circles');
    return generateCircleIsochrones(center, intervals, travelMode);

  } catch (error) {
    console.error('Error generating routed isochrones:', error);
    // Fallback to circle isochrones on error
    return generateCircleIsochrones(center, intervals, travelMode);
  }
}

// Helper to get contour color for Valhalla request
function getContourColor(index: number, total: number): string {
  const colors = ['ff0000', 'ff7f00', 'ffff00', '7fff00', '00ff00'];
  const colorIndex = Math.min(Math.floor((index / total) * colors.length), colors.length - 1);
  return colors[colorIndex];
}

// Create a circular polygon
function createCirclePolygon(
  center: { lng: number; lat: number },
  radiusMeters: number,
  points: number
): GeoJSON.Polygon {
  const coords: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const point = destinationPoint(center, radiusMeters, angle);
    coords.push([point.lng, point.lat]);
  }

  return {
    type: 'Polygon',
    coordinates: [coords]
  };
}

// Calculate destination point given start, distance and bearing
function destinationPoint(
  start: { lng: number; lat: number },
  distanceMeters: number,
  bearing: number
): { lng: number; lat: number } {
  const R = 6371000; // Earth radius in meters
  const d = distanceMeters / R;
  const lat1 = (start.lat * Math.PI) / 180;
  const lon1 = (start.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
  );

  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lon2 * 180) / Math.PI
  };
}

// Color scales for isochrones
export const ISOCHRONE_COLOR_SCALES: Record<IsochroneColorScale, string[]> = {
  'green-red': ['#00ff00', '#7fff00', '#ffff00', '#ff7f00', '#ff0000'],
  'blue-purple': ['#00bfff', '#1e90ff', '#6a5acd', '#8b008b', '#4b0082'],
  'yellow-orange': ['#ffffe0', '#fffacd', '#ffd700', '#ffa500', '#ff4500'],
  'monochrome': ['#e0e0e0', '#b0b0b0', '#808080', '#505050', '#202020']
};

// Get color for a specific interval index
export function getIsochroneColor(
  colorScale: IsochroneColorScale,
  index: number,
  total: number
): string {
  const colors = ISOCHRONE_COLOR_SCALES[colorScale];
  const colorIndex = Math.min(
    Math.floor((index / total) * colors.length),
    colors.length - 1
  );
  return colors[colorIndex];
}

// Add isochrones to map
export function addIsochronesToMap(
  map: MapLibreMap,
  isochrones: GeoJSON.FeatureCollection,
  colorScale: IsochroneColorScale,
  transparency: number
): void {
  const sourceId = 'isochrone-source';
  const layerId = 'isochrone-layer';
  const outlineLayerId = 'isochrone-outline';
  const labelLayerId = 'isochrone-labels';

  // Remove existing layers and source
  if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
  if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);

  // Add source
  map.addSource(sourceId, {
    type: 'geojson',
    data: isochrones
  });

  // Generate colors for each feature
  const total = isochrones.features.length;
  const fillColors: (string | number | string[])[] = ['match', ['get', 'index']];
  const strokeColors: (string | number | string[])[] = ['match', ['get', 'index']];

  isochrones.features.forEach((feature) => {
    const idx = (feature.properties as { index: number }).index;
    const color = getIsochroneColor(colorScale, idx, total);
    fillColors.push(idx, color);
    strokeColors.push(idx, color);
  });

  fillColors.push('#808080'); // default
  strokeColors.push('#606060');

  // Add fill layer
  map.addLayer({
    id: layerId,
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': fillColors as maplibregl.ExpressionSpecification,
      'fill-opacity': transparency * 0.5
    }
  });

  // Add outline layer
  map.addLayer({
    id: outlineLayerId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': strokeColors as maplibregl.ExpressionSpecification,
      'line-width': 2,
      'line-opacity': transparency
    }
  });

  // Add labels - position them on the edge of each isochrone
  const labelFeatures: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: isochrones.features.map(f => {
      const geometry = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
      let labelCoord: [number, number];

      if (geometry.type === 'Polygon') {
        // For regular polygons, use the top edge
        const coords = geometry.coordinates[0];
        const topIndex = Math.floor(coords.length / 4);
        labelCoord = coords[topIndex] as [number, number];
      } else if (geometry.type === 'MultiPolygon') {
        // For multipolygons, use the first polygon's top edge
        const coords = geometry.coordinates[0][0];
        const topIndex = Math.floor(coords.length / 4);
        labelCoord = coords[topIndex] as [number, number];
      } else {
        // Fallback
        labelCoord = [0, 0];
      }

      return {
        type: 'Feature',
        properties: f.properties,
        geometry: {
          type: 'Point',
          coordinates: labelCoord
        }
      };
    })
  };

  const labelSourceId = 'isochrone-label-source';
  if (map.getSource(labelSourceId)) map.removeSource(labelSourceId);

  map.addSource(labelSourceId, {
    type: 'geojson',
    data: labelFeatures
  });

  map.addLayer({
    id: labelLayerId,
    type: 'symbol',
    source: labelSourceId,
    layout: {
      'text-field': ['concat', ['get', 'minutes'], ' min'],
      'text-size': 12,
      'text-anchor': 'center'
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1.5
    }
  });
}

// Remove isochrones from map
export function removeIsochronesFromMap(map: MapLibreMap): void {
  const layers = ['isochrone-labels', 'isochrone-outline', 'isochrone-layer'];
  const sources = ['isochrone-label-source', 'isochrone-source'];

  layers.forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id);
  });

  sources.forEach(id => {
    if (map.getSource(id)) map.removeSource(id);
  });
}

// Store drag handler references for cleanup
let dragHandlers: {
  onMouseDown?: (e: maplibregl.MapMouseEvent) => void;
  onMouseMove?: (e: maplibregl.MapMouseEvent) => void;
  onMouseUp?: () => void;
  onTouchStart?: (e: maplibregl.MapTouchEvent) => void;
  onTouchMove?: (e: maplibregl.MapTouchEvent) => void;
  onTouchEnd?: () => void;
} = {};

// Add click marker with optional drag support
export function addClickMarker(
  map: MapLibreMap,
  point: { lng: number; lat: number },
  draggable: boolean = false,
  onDrag?: (newPoint: { lng: number; lat: number }) => void,
  onDragEnd?: (newPoint: { lng: number; lat: number }) => void
): void {
  const sourceId = 'isochrone-marker-source';
  const layerId = 'isochrone-marker';
  const outerLayerId = 'isochrone-marker-outer';

  // Remove existing layers
  if (map.getLayer(outerLayerId)) map.removeLayer(outerLayerId);
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);

  // Clean up old drag handlers
  removeDragHandlers(map);

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      }
    }
  });

  // Outer pulsing ring (for visual feedback when draggable)
  if (draggable) {
    map.addLayer({
      id: outerLayerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': 16,
        'circle-color': 'transparent',
        'circle-stroke-color': '#ff0000',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': 0.5
      }
    });
  }

  // Main marker
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-radius': draggable ? 10 : 8,
      'circle-color': '#ff0000',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3
    }
  });

  // Add drag functionality if enabled
  if (draggable) {
    setupDragHandlers(map, sourceId, layerId, onDrag, onDragEnd);
    // Change cursor on hover
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'grab';
    });
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  }
}

// Setup drag handlers for the marker
function setupDragHandlers(
  map: MapLibreMap,
  sourceId: string,
  layerId: string,
  onDrag?: (newPoint: { lng: number; lat: number }) => void,
  onDragEnd?: (newPoint: { lng: number; lat: number }) => void
): void {
  let isDragging = false;
  let currentPoint: { lng: number; lat: number } | null = null;

  const onMouseDown = (e: maplibregl.MapMouseEvent) => {
    // Check if clicking on the marker
    const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
    if (features.length === 0) return;

    e.preventDefault();
    isDragging = true;
    map.getCanvas().style.cursor = 'grabbing';

    // Disable map dragging
    map.dragPan.disable();
  };

  const onMouseMove = (e: maplibregl.MapMouseEvent) => {
    if (!isDragging) return;

    currentPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };

    // Update marker position
    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [currentPoint.lng, currentPoint.lat]
        }
      });
    }

    if (onDrag) {
      onDrag(currentPoint);
    }
  };

  const onMouseUp = () => {
    if (!isDragging) return;

    isDragging = false;
    map.getCanvas().style.cursor = '';
    map.dragPan.enable();

    if (currentPoint && onDragEnd) {
      onDragEnd(currentPoint);
    }
  };

  // Touch support
  const onTouchStart = (e: maplibregl.MapTouchEvent) => {
    if (e.points.length !== 1) return;
    const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
    if (features.length === 0) return;

    e.preventDefault();
    isDragging = true;
    map.dragPan.disable();
  };

  const onTouchMove = (e: maplibregl.MapTouchEvent) => {
    if (!isDragging || e.points.length !== 1) return;

    currentPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };

    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [currentPoint.lng, currentPoint.lat]
        }
      });
    }

    if (onDrag) {
      onDrag(currentPoint);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;

    isDragging = false;
    map.dragPan.enable();

    if (currentPoint && onDragEnd) {
      onDragEnd(currentPoint);
    }
  };

  // Store handlers for cleanup
  dragHandlers = {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };

  // Attach event listeners
  map.on('mousedown', onMouseDown);
  map.on('mousemove', onMouseMove);
  map.on('mouseup', onMouseUp);
  map.on('touchstart', onTouchStart);
  map.on('touchmove', onTouchMove);
  map.on('touchend', onTouchEnd);
}

// Remove drag handlers
function removeDragHandlers(map: MapLibreMap): void {
  if (dragHandlers.onMouseDown) {
    map.off('mousedown', dragHandlers.onMouseDown);
  }
  if (dragHandlers.onMouseMove) {
    map.off('mousemove', dragHandlers.onMouseMove);
  }
  if (dragHandlers.onMouseUp) {
    map.off('mouseup', dragHandlers.onMouseUp);
  }
  if (dragHandlers.onTouchStart) {
    map.off('touchstart', dragHandlers.onTouchStart);
  }
  if (dragHandlers.onTouchMove) {
    map.off('touchmove', dragHandlers.onTouchMove);
  }
  if (dragHandlers.onTouchEnd) {
    map.off('touchend', dragHandlers.onTouchEnd);
  }
  dragHandlers = {};
}

export function removeClickMarker(map: MapLibreMap): void {
  removeDragHandlers(map);
  if (map.getLayer('isochrone-marker-outer')) map.removeLayer('isochrone-marker-outer');
  if (map.getLayer('isochrone-marker')) map.removeLayer('isochrone-marker');
  if (map.getSource('isochrone-marker-source')) map.removeSource('isochrone-marker-source');
}

// Heartbeat animation state
let heartbeatAnimationId: number | null = null;
let heartbeatColors: string[] = [];
let heartbeatNumFeatures: number = 0;

// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 128, g: 128, b: 128 };
}

// Helper to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Brighten a color by a factor (1.0 = no change, 1.5 = 50% brighter)
function brightenColor(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  // Brighten towards white
  const newR = r + (255 - r) * (factor - 1);
  const newG = g + (255 - g) * (factor - 1);
  const newB = b + (255 - b) * (factor - 1);
  return rgbToHex(newR, newG, newB);
}

// Start heartbeat animation - pulses colors from centroid outward through the isochrone zones
export function startHeartbeatAnimation(
  map: MapLibreMap,
  colorScale: IsochroneColorScale,
  baseTransparency: number
): void {
  // Stop any existing animation
  stopHeartbeatAnimation();

  const layerId = 'isochrone-layer';
  const outlineLayerId = 'isochrone-outline';

  if (!map.getLayer(layerId)) return;

  // Get the base colors for this scale
  const baseColors = ISOCHRONE_COLOR_SCALES[colorScale];

  // Get feature count from source
  const source = map.getSource('isochrone-source') as maplibregl.GeoJSONSource;
  if (!source) return;

  // Store colors for each feature index
  const data = (source as unknown as { _data: GeoJSON.FeatureCollection })._data;
  if (!data || !data.features) return;

  heartbeatNumFeatures = data.features.length;
  heartbeatColors = [];

  // Pre-calculate base colors for each feature
  for (let i = 0; i < heartbeatNumFeatures; i++) {
    const colorIndex = Math.min(
      Math.floor((i / heartbeatNumFeatures) * baseColors.length),
      baseColors.length - 1
    );
    heartbeatColors.push(baseColors[colorIndex]);
  }

  let startTime = performance.now();
  const cycleDuration = 1500; // 1.5 seconds per cycle for snappier pulse
  const waveWidth = 0.4; // Width of the pulse wave

  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = (elapsed % cycleDuration) / cycleDuration; // 0 to 1

    // Wave moves from center (0) outward (1)
    const wavePosition = progress;

    // Create color expression - each zone gets brightened as the wave passes
    const colorExpression: (string | number | string[])[] = ['match', ['get', 'index']];
    const opacityExpression: (string | number | string[])[] = ['match', ['get', 'index']];

    for (let i = 0; i < heartbeatNumFeatures; i++) {
      // Features are sorted largest to smallest (outer first), so reverse for wave direction
      // Index 0 = largest/outer, higher index = inner/smaller
      const featurePosition = i / (heartbeatNumFeatures - 1 || 1); // 0 = outer, 1 = inner
      const normalizedPosition = 1 - featurePosition; // Flip: 0 = inner, 1 = outer

      const distanceFromWave = Math.abs(normalizedPosition - wavePosition);

      // Calculate pulse intensity (1 at wave center, 0 at edges)
      let pulseIntensity = 0;
      if (distanceFromWave < waveWidth) {
        pulseIntensity = 1 - (distanceFromWave / waveWidth);
        // Smooth the pulse with easing
        pulseIntensity = Math.sin(pulseIntensity * Math.PI / 2);
      }

      // Brighten color based on pulse intensity
      const brightenFactor = 1 + pulseIntensity * 0.6; // Up to 60% brighter
      const pulsedColor = brightenColor(heartbeatColors[i], brightenFactor);

      // Also pulse opacity for more dramatic effect
      const baseOpacity = baseTransparency * 0.5;
      const maxOpacity = baseTransparency * 0.85;
      const opacity = baseOpacity + (maxOpacity - baseOpacity) * pulseIntensity;

      colorExpression.push(i, pulsedColor);
      opacityExpression.push(i, opacity);
    }

    colorExpression.push('#808080'); // default
    opacityExpression.push(baseTransparency * 0.5);

    // Update both color and opacity
    try {
      map.setPaintProperty(layerId, 'fill-color', colorExpression as maplibregl.ExpressionSpecification);
      map.setPaintProperty(layerId, 'fill-opacity', opacityExpression as maplibregl.ExpressionSpecification);

      // Also pulse the outline
      if (map.getLayer(outlineLayerId)) {
        map.setPaintProperty(outlineLayerId, 'line-color', colorExpression as maplibregl.ExpressionSpecification);
      }
    } catch {
      // Layer might have been removed
      stopHeartbeatAnimation();
      return;
    }

    heartbeatAnimationId = requestAnimationFrame(animate);
  };

  heartbeatAnimationId = requestAnimationFrame(animate);
}

// Stop heartbeat animation and reset colors
export function stopHeartbeatAnimation(map?: MapLibreMap, colorScale?: IsochroneColorScale, transparency?: number): void {
  if (heartbeatAnimationId !== null) {
    cancelAnimationFrame(heartbeatAnimationId);
    heartbeatAnimationId = null;
  }

  // Reset to default state if map is provided
  if (map) {
    const layerId = 'isochrone-layer';
    const outlineLayerId = 'isochrone-outline';

    if (map.getLayer(layerId) && heartbeatColors.length > 0) {
      try {
        // Restore original colors
        const colorExpression: (string | number | string[])[] = ['match', ['get', 'index']];
        for (let i = 0; i < heartbeatNumFeatures; i++) {
          colorExpression.push(i, heartbeatColors[i]);
        }
        colorExpression.push('#808080');

        map.setPaintProperty(layerId, 'fill-color', colorExpression as maplibregl.ExpressionSpecification);
        map.setPaintProperty(layerId, 'fill-opacity', (transparency || 0.7) * 0.5);

        if (map.getLayer(outlineLayerId)) {
          map.setPaintProperty(outlineLayerId, 'line-color', colorExpression as maplibregl.ExpressionSpecification);
        }
      } catch {
        // Ignore errors if layer doesn't exist
      }
    }
  }

  // Clear stored colors
  heartbeatColors = [];
  heartbeatNumFeatures = 0;
}

// Update marker position (for real-time drag updates)
export function updateMarkerPosition(
  map: MapLibreMap,
  point: { lng: number; lat: number }
): void {
  const sourceId = 'isochrone-marker-source';
  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (source) {
    source.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      }
    });
  }
}
