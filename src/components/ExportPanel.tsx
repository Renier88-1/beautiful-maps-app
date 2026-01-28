'use client';

import React, { useState, useEffect } from 'react';
import { NeomorphicButton, NeomorphicSelect, NeomorphicCard, NeomorphicToggle } from './ui';
import type { ExportSettings } from '@/types';

interface ExportPanelProps {
  onExport: (settings: ExportSettings) => void;
  isExporting: boolean;
  showPreview?: boolean;
  onPreviewChange?: (show: boolean) => void;
  onSettingsChange?: (settings: ExportSettings) => void;
}

export function ExportPanel({
  onExport,
  isExporting,
  showPreview = false,
  onPreviewChange,
  onSettingsChange
}: ExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    aspectRatio: '16:9',
    quality: 'high',
    width: 1920,
    height: 1080
  });

  // Notify parent of settings changes
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const aspectRatioToSize = (ratio: string, quality: string): { width: number; height: number } => {
    const baseWidths = { standard: 1280, high: 1920, ultra: 3840 };
    const ratios: Record<string, number> = {
      '16:9': 16 / 9,
      '4:3': 4 / 3,
      '1:1': 1,
      '9:16': 9 / 16
    };

    const width = baseWidths[quality as keyof typeof baseWidths];
    const height = Math.round(width / ratios[ratio]);
    return { width, height };
  };

  const updateSettings = (updates: Partial<ExportSettings>) => {
    const newSettings = { ...settings, ...updates };

    // Recalculate dimensions if aspect ratio or quality changes
    if (updates.aspectRatio || updates.quality) {
      const { width, height } = aspectRatioToSize(
        updates.aspectRatio || settings.aspectRatio,
        updates.quality || settings.quality
      );
      newSettings.width = width;
      newSettings.height = height;
    }

    setSettings(newSettings);
  };

  const handleExport = () => {
    onExport(settings);
  };

  return (
    <NeomorphicCard variant="raised" padding="md" className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
        Export
      </h3>

      <NeomorphicSelect
        label="Format"
        value={settings.format}
        onChange={(value) => updateSettings({ format: value as ExportSettings['format'] })}
        options={[
          { value: 'png', label: 'PNG (Lossless)' },
          { value: 'jpg', label: 'JPEG (Smaller)' },
          { value: 'gif', label: 'GIF (Animation)' }
        ]}
      />

      <NeomorphicSelect
        label="Aspect Ratio"
        value={settings.aspectRatio}
        onChange={(value) => updateSettings({ aspectRatio: value as ExportSettings['aspectRatio'] })}
        options={[
          { value: '16:9', label: '16:9 (Widescreen)' },
          { value: '4:3', label: '4:3 (Standard)' },
          { value: '1:1', label: '1:1 (Square)' },
          { value: '9:16', label: '9:16 (Portrait)' }
        ]}
      />

      <NeomorphicSelect
        label="Quality"
        value={settings.quality}
        onChange={(value) => updateSettings({ quality: value as ExportSettings['quality'] })}
        options={[
          { value: 'standard', label: 'Standard (1280px)' },
          { value: 'high', label: 'High (1920px)' },
          { value: 'ultra', label: 'Ultra (4K)' }
        ]}
      />

      <div className="text-xs text-neutral-500 pt-2">
        Output size: {settings.width} x {settings.height}px
      </div>

      {onPreviewChange && (
        <NeomorphicToggle
          label="Show Export Frame"
          checked={showPreview}
          onChange={onPreviewChange}
        />
      )}

      {settings.format === 'gif' && (
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-700">
            GIF export will create a rotating animation around your current view.
          </p>
        </div>
      )}

      <NeomorphicButton
        onClick={handleExport}
        variant="primary"
        size="lg"
        disabled={isExporting}
        className="w-full"
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Exporting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Map
          </span>
        )}
      </NeomorphicButton>
    </NeomorphicCard>
  );
}
