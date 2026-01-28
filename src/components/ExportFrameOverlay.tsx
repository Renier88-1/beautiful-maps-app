'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ExportFrameOverlayProps {
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  isVisible: boolean;
  containerWidth: number;
  containerHeight: number;
}

const aspectRatioValues: Record<string, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16
};

export function ExportFrameOverlay({
  aspectRatio,
  isVisible,
  containerWidth,
  containerHeight
}: ExportFrameOverlayProps) {
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Calculate frame size based on aspect ratio and container
  useEffect(() => {
    if (!containerWidth || !containerHeight) return;

    const ratio = aspectRatioValues[aspectRatio];
    let width: number;
    let height: number;

    // Fit frame within container with some padding
    const maxWidth = containerWidth * 0.8;
    const maxHeight = containerHeight * 0.8;

    if (maxWidth / ratio <= maxHeight) {
      width = maxWidth;
      height = maxWidth / ratio;
    } else {
      height = maxHeight;
      width = maxHeight * ratio;
    }

    setFrameSize({ width, height });
    setPosition({
      x: (containerWidth - width) / 2,
      y: (containerHeight - height) / 2
    });
  }, [aspectRatio, containerWidth, containerHeight]);

  if (!isVisible || !frameSize.width || !frameSize.height) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Dark overlay outside the frame */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="export-frame-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={position.x}
              y={position.y}
              width={frameSize.width}
              height={frameSize.height}
              fill="black"
              rx="4"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#export-frame-mask)"
        />
      </svg>

      {/* Frame border */}
      <div
        className="absolute border-2 border-white rounded shadow-lg"
        style={{
          left: position.x,
          top: position.y,
          width: frameSize.width,
          height: frameSize.height,
          boxShadow: '0 0 0 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {/* Corner handles (visual only for now) */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500" />

        {/* Aspect ratio label */}
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {aspectRatio}
        </div>

        {/* Export area label */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Export Area
        </div>
      </div>
    </div>
  );
}
