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

// Capture a frame from the map canvas
async function captureFrame(
  map: MapLibreMap,
  width: number,
  height: number
): Promise<ImageData> {
  const canvas = map.getCanvas();

  // Wait for render
  await new Promise<void>((resolve) => {
    map.once('render', resolve);
    map.triggerRepaint();
  });

  // Small delay to ensure render is complete
  await new Promise(resolve => setTimeout(resolve, 50));

  // Create offscreen canvas and capture
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Calculate crop to center
  const sourceAspect = canvas.width / canvas.height;
  const targetAspect = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = canvas.width;
  let sourceHeight = canvas.height;

  if (sourceAspect > targetAspect) {
    sourceWidth = canvas.height * targetAspect;
    sourceX = (canvas.width - sourceWidth) / 2;
  } else {
    sourceHeight = canvas.width / targetAspect;
    sourceY = (canvas.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    canvas,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, width, height
  );

  return ctx.getImageData(0, 0, width, height);
}

// Create a GIF animation (orbit around map)
export async function exportMapAsGif(
  map: MapLibreMap,
  filename: string = 'beautiful-map',
  frames: number = 36,
  duration: number = 5000,
  width: number = 640,
  height: number = 360
): Promise<void> {
  // Dynamically import gif.js
  const GIF = (await import('gif.js')).default;

  const originalBearing = map.getBearing();
  const bearingStep = 360 / frames;
  const frameDelay = Math.round(duration / frames);

  // Create GIF encoder
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width,
    height,
    workerScript: '/gif.worker.js'
  });

  // Capture frames
  for (let i = 0; i < frames; i++) {
    const bearing = originalBearing + (i * bearingStep);
    map.setBearing(bearing);

    const imageData = await captureFrame(map, width, height);
    gif.addFrame(imageData, { delay: frameDelay });
  }

  // Reset bearing
  map.setBearing(originalBearing);

  // Render and save
  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      saveAs(blob, `${filename}.gif`);
      resolve();
    });

    gif.on('error', (err: Error) => {
      reject(err);
    });

    gif.render();
  });
}

// Export map as MP4 video using MediaRecorder
export async function exportMapAsMp4(
  map: MapLibreMap,
  filename: string = 'beautiful-map',
  duration: number = 5000
): Promise<void> {
  const canvas = map.getCanvas();
  const originalBearing = map.getBearing();
  const frames = 60; // 60 frames for smooth animation
  const bearingStep = 360 / frames;

  // Check if MediaRecorder is supported
  if (!MediaRecorder.isTypeSupported('video/webm')) {
    throw new Error('Video recording is not supported in this browser');
  }

  // Create a MediaRecorder
  const stream = canvas.captureStream(30); // 30 fps
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000 // 5 Mbps
  });

  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      // Note: We save as .webm since browsers can't natively encode MP4
      // Users can convert to MP4 using online tools or ffmpeg
      saveAs(blob, `${filename}.webm`);
      map.setBearing(originalBearing);
      resolve();
    };

    mediaRecorder.onerror = (e) => {
      map.setBearing(originalBearing);
      reject(e);
    };

    mediaRecorder.start();

    // Animate the map
    let frameIndex = 0;
    const frameInterval = duration / frames;

    const animate = () => {
      if (frameIndex >= frames) {
        mediaRecorder.stop();
        return;
      }

      const bearing = originalBearing + (frameIndex * bearingStep);
      map.setBearing(bearing);
      map.triggerRepaint();

      frameIndex++;
      setTimeout(animate, frameInterval);
    };

    animate();
  });
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
