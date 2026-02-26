'use client';

import React from 'react';

interface NeomorphicSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function NeomorphicSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue,
  className = ''
}: NeomorphicSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-md">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="relative h-8 flex items-center">
        <div className="absolute w-full h-1.5 rounded-full bg-[var(--bg-input)] neu-shadow-inset-sm">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--accent)] neu-shadow-raised-hover pointer-events-none transition-transform duration-100 hover:scale-110"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
