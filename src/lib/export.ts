import { saveAs } from 'file-saver';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { ExportSettings } from '@/types';

// Export map with specific dimensions and aspect ratio
export async function exportMapWithSettings(
  map: MapLibreMap,
  settings: ExportSettings,
  filename: string = 'beautiful-map'
): Promise<void> {
  const canvas = map.getCanvas();
  const { width, height, format, quality } = settings;

  // Create an offscreen canvas with the target dimensions
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Calculate crop/scale to fit the aspect ratio
  const sourceAspect = canvas.width / canvas.height;
  const targetAspect = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = canvas.width;
  let sourceHeight = canvas.height;

  if (sourceAspect > targetAspect) {
    // Source is wider - crop horizontally
    sourceWidth = canvas.height * targetAspect;
    sourceX = (canvas.width - sourceWidth) / 2;
  } else {
    // Source is taller - crop vertically
    sourceHeight = canvas.width / targetAspect;
    sourceY = (canvas.height - sourceHeight) / 2;
  }

  // Draw the cropped map onto the export canvas
  ctx.drawImage(
    canvas,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, width, height
  );

  // Get quality value
  const jpegQuality = quality === 'ultra' ? 0.95 : quality === 'high' ? 0.92 : 0.85;

  // Export based on format
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpg' ? 'jpg' : 'png';

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          saveAs(blob, `${filename}.${ext}`);
          resolve();
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      mimeType,
      format === 'jpg' ? jpegQuality : undefined
    );
  });
}

// Export map as PNG (simple, current canvas size)
export async function exportMapAsPng(
  map: MapLibreMap,
  filename: string = 'beautiful-map'
): Promise<void> {
  const canvas = map.getCanvas();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}.png`);
      }
      resolve();
    }, 'image/png');
  });
}

// Export map as JPEG (simple, current canvas size)
export async function exportMapAsJpeg(
  map: MapLibreMap,
  filename: string = 'beautiful-map',
  quality: number = 0.92
): Promise<void> {
  const canvas = map.getCanvas();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}.jpg`);
      }
      resolve();
    }, 'image/jpeg', quality);
  });
}

// Create a simple GIF animation (orbit around map)
export async function exportMapAsGif(
  map: MapLibreMap,
  filename: string = 'beautiful-map',
  frames: number = 36,
  duration: number = 5000
): Promise<void> {
  const canvas = map.getCanvas();

  // For a simple implementation, we'll export multiple PNGs
  // A full GIF implementation would require gif.js or similar
  const originalBearing = map.getBearing();
  const bearingStep = 360 / frames;
  const frameDelay = duration / frames;

  const capturedFrames: Blob[] = [];

  for (let i = 0; i < frames; i++) {
    map.setBearing(originalBearing + (i * bearingStep));

    // Wait for map to render
    await new Promise<void>((resolve) => {
      map.once('render', () => {
        canvas.toBlob((blob) => {
          if (blob) capturedFrames.push(blob);
          resolve();
        }, 'image/png');
      });
      map.triggerRepaint();
    });

    await new Promise(resolve => setTimeout(resolve, frameDelay / 10));
  }

  // Reset bearing
  map.setBearing(originalBearing);

  // For now, just save the first frame as PNG
  // Full GIF encoding would require additional library
  if (capturedFrames.length > 0) {
    saveAs(capturedFrames[0], `${filename}.png`);
  }
}

// Get aspect ratio dimensions
export function getAspectRatioDimensions(
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16',
  baseWidth: number = 1920
): { width: number; height: number } {
  const ratios: Record<string, number> = {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '9:16': 9 / 16
  };

  const ratio = ratios[aspectRatio] || 16 / 9;
  return {
    width: baseWidth,
    height: Math.round(baseWidth / ratio)
  };
}

// Quality presets
export function getQualitySettings(quality: 'standard' | 'high' | 'ultra'): {
  width: number;
  dpr: number;
  jpegQuality: number;
} {
  switch (quality) {
    case 'standard':
      return { width: 1280, dpr: 1, jpegQuality: 0.8 };
    case 'high':
      return { width: 1920, dpr: 1.5, jpegQuality: 0.9 };
    case 'ultra':
      return { width: 3840, dpr: 2, jpegQuality: 0.95 };
    default:
      return { width: 1920, dpr: 1, jpegQuality: 0.9 };
  }
}
