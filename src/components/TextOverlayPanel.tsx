'use client';

import React from 'react';
import { NeomorphicCard, NeomorphicSlider, NeomorphicSelect, NeomorphicToggle, NeomorphicInput } from './ui';
import type { TextOverlaySettings, OverlayFontFamily, OverlayPosition, OverlayFrameStyle } from '@/types';

interface TextOverlayPanelProps {
  settings: TextOverlaySettings;
  onChange: (settings: Partial<TextOverlaySettings>) => void;
  locationName: string;
  coordinates?: { lat: number; lng: number } | null;
}

const fontOptions = [
  { value: 'serif', label: 'Serif (Elegant)' },
  { value: 'sans', label: 'Sans-Serif (Modern)' },
  { value: 'mono', label: 'Monospace (Technical)' }
];

const positionOptions = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center', label: 'Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' }
];

const frameOptions = [
  { value: 'none', label: 'No Frame' },
  { value: 'thin', label: 'Thin Line' },
  { value: 'thick', label: 'Thick Line' },
  { value: 'double', label: 'Double Line' },
  { value: 'ornate', label: 'Ornate' }
];

const colorPresets = [
  { color: '#ffffff', label: 'White' },
  { color: '#000000', label: 'Black' },
  { color: '#f1f5f9', label: 'Silver' },
  { color: '#d4af37', label: 'Gold' },
  { color: '#e2e8f0', label: 'Light Gray' },
  { color: '#1e293b', label: 'Dark' }
];

export function TextOverlayPanel({ settings, onChange, locationName, coordinates }: TextOverlayPanelProps) {
  const formatCoords = () => {
    if (!coordinates) return '';
    const lat = coordinates.lat;
    const lng = coordinates.lng;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <NeomorphicToggle
        label="Enable Text Overlay"
        checked={settings.enabled}
        onChange={(enabled) => onChange({ enabled })}
      />

      {settings.enabled && (
        <div className="space-y-5 animate-fadeIn">
          {/* Title Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Title
            </h4>

            <NeomorphicInput
              value={settings.title}
              onChange={(title) => onChange({ title })}
              placeholder={locationName || 'City Name'}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange({ title: locationName })}
                className="text-xs px-2 py-1 rounded-lg bg-[var(--accent-surface)] text-[var(--accent)] hover:bg-[var(--bg-selected)] transition-colors"
              >
                Use Location
              </button>
              <button
                onClick={() => onChange({ title: locationName.toUpperCase() })}
                className="text-xs px-2 py-1 rounded-lg bg-[var(--accent-surface)] text-[var(--accent)] hover:bg-[var(--bg-selected)] transition-colors"
              >
                UPPERCASE
              </button>
            </div>

            <NeomorphicSelect
              label="Font"
              value={settings.titleFontFamily}
              onChange={(v) => onChange({ titleFontFamily: v as OverlayFontFamily })}
              options={fontOptions}
            />

            <NeomorphicSlider
              label="Font Size"
              value={settings.titleFontSize}
              onChange={(titleFontSize) => onChange({ titleFontSize })}
              min={24}
              max={120}
              step={2}
              formatValue={(v) => `${v}px`}
            />

            <NeomorphicSlider
              label="Letter Spacing"
              value={settings.titleLetterSpacing}
              onChange={(titleLetterSpacing) => onChange({ titleLetterSpacing })}
              min={0}
              max={20}
              step={1}
              formatValue={(v) => `${v}px`}
            />

            <NeomorphicToggle
              label="Uppercase"
              checked={settings.titleUppercase}
              onChange={(titleUppercase) => onChange({ titleUppercase })}
            />

            {/* Color presets */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Title Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => onChange({ titleColor: preset.color })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      settings.titleColor === preset.color
                        ? 'border-[var(--accent)] scale-110'
                        : 'border-[var(--border-subtle)] hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.label}
                  />
                ))}
                <input
                  type="color"
                  value={settings.titleColor}
                  onChange={(e) => onChange({ titleColor: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-[var(--border-subtle)]"
                />
              </div>
            </div>

            <NeomorphicSelect
              label="Position"
              value={settings.titlePosition}
              onChange={(v) => onChange({ titlePosition: v as OverlayPosition })}
              options={positionOptions}
            />
          </div>

          {/* Subtitle Section */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Subtitle
            </h4>

            <NeomorphicToggle
              label="Show Coordinates"
              checked={settings.showCoordinates}
              onChange={(showCoordinates) => {
                onChange({
                  showCoordinates,
                  subtitle: showCoordinates ? formatCoords() : settings.subtitle
                });
              }}
            />

            {!settings.showCoordinates && (
              <NeomorphicInput
                value={settings.subtitle}
                onChange={(subtitle) => onChange({ subtitle })}
                placeholder="Custom subtitle text..."
              />
            )}

            {settings.showCoordinates && coordinates && (
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                <span className="text-xs font-mono text-[var(--text-secondary)]">{formatCoords()}</span>
              </div>
            )}

            <NeomorphicSelect
              label="Font"
              value={settings.subtitleFontFamily}
              onChange={(v) => onChange({ subtitleFontFamily: v as OverlayFontFamily })}
              options={fontOptions}
            />

            <NeomorphicSlider
              label="Font Size"
              value={settings.subtitleFontSize}
              onChange={(subtitleFontSize) => onChange({ subtitleFontSize })}
              min={10}
              max={48}
              step={1}
              formatValue={(v) => `${v}px`}
            />

            {/* Subtitle color */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Subtitle Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => onChange({ subtitleColor: preset.color })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      settings.subtitleColor === preset.color
                        ? 'border-[var(--accent)] scale-110'
                        : 'border-[var(--border-subtle)] hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Frame Section */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Frame
            </h4>

            <NeomorphicSelect
              label="Frame Style"
              value={settings.frameStyle}
              onChange={(v) => onChange({ frameStyle: v as OverlayFrameStyle })}
              options={frameOptions}
            />

            {settings.frameStyle !== 'none' && (
              <>
                <NeomorphicSlider
                  label="Frame Padding"
                  value={settings.framePadding}
                  onChange={(framePadding) => onChange({ framePadding })}
                  min={10}
                  max={60}
                  step={5}
                  formatValue={(v) => `${v}px`}
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Frame Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => onChange({ frameColor: preset.color })}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${
                          settings.frameColor === preset.color
                            ? 'border-[var(--accent)] scale-110'
                            : 'border-[var(--border-subtle)] hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
