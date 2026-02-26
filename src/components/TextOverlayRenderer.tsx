'use client';

import React from 'react';
import type { TextOverlaySettings } from '@/types';

interface TextOverlayRendererProps {
  settings: TextOverlaySettings;
  isVisible: boolean;
}

const fontFamilyMap = {
  serif: 'var(--font-dm-serif), Georgia, serif',
  sans: 'var(--font-inter), system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, monospace'
};

const positionClasses: Record<string, string> = {
  'top-left': 'items-start justify-start text-left',
  'top-center': 'items-start justify-center text-center',
  'top-right': 'items-start justify-end text-right',
  'center': 'items-center justify-center text-center',
  'bottom-left': 'items-end justify-start text-left',
  'bottom-center': 'items-end justify-center text-center',
  'bottom-right': 'items-end justify-end text-right'
};

const getFrameStyles = (settings: TextOverlaySettings): React.CSSProperties => {
  const base: React.CSSProperties = {
    padding: `${settings.framePadding}px`,
  };

  switch (settings.frameStyle) {
    case 'thin':
      return { ...base, border: `1px solid ${settings.frameColor}` };
    case 'thick':
      return { ...base, border: `3px solid ${settings.frameColor}` };
    case 'double':
      return {
        ...base,
        border: `3px double ${settings.frameColor}`,
        outline: `1px solid ${settings.frameColor}`,
        outlineOffset: '4px'
      };
    case 'ornate':
      return {
        ...base,
        border: `2px solid ${settings.frameColor}`,
        outline: `1px solid ${settings.frameColor}`,
        outlineOffset: '6px',
        boxShadow: `inset 0 0 0 4px transparent, inset 0 0 0 5px ${settings.frameColor}40`
      };
    default:
      return base;
  }
};

export function TextOverlayRenderer({ settings, isVisible }: TextOverlayRendererProps) {
  if (!isVisible || !settings.enabled) return null;
  if (!settings.title && !settings.subtitle) return null;

  const posClass = positionClasses[settings.titlePosition] || positionClasses['bottom-center'];
  const frameStyles = getFrameStyles(settings);

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none flex" style={frameStyles}>
      <div className={`flex flex-col gap-2 w-full h-full ${posClass} p-8`}>
        {/* Title */}
        {settings.title && (
          <h2
            className="leading-tight drop-shadow-lg"
            style={{
              fontFamily: fontFamilyMap[settings.titleFontFamily],
              fontSize: `${settings.titleFontSize}px`,
              color: settings.titleColor,
              textTransform: settings.titleUppercase ? 'uppercase' : 'none',
              letterSpacing: `${settings.titleLetterSpacing}px`,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              maxWidth: '90%'
            }}
          >
            {settings.title}
          </h2>
        )}

        {/* Subtitle */}
        {settings.subtitle && (
          <p
            className="leading-relaxed drop-shadow-md"
            style={{
              fontFamily: fontFamilyMap[settings.subtitleFontFamily],
              fontSize: `${settings.subtitleFontSize}px`,
              color: settings.subtitleColor,
              textTransform: settings.subtitleUppercase ? 'uppercase' : 'none',
              letterSpacing: settings.subtitleFontFamily === 'mono' ? '2px' : '1px',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              maxWidth: '90%'
            }}
          >
            {settings.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
