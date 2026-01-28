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
            <label className="text-sm font-medium text-neutral-600">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-mono text-neutral-500">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="relative h-8 flex items-center">
        <div
          className="
            absolute w-full h-2 rounded-full
            bg-neutral-100
            shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]
          "
        >
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
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
          className="
            absolute w-full h-2 opacity-0 cursor-pointer z-10
          "
        />
        <div
          className="
            absolute w-5 h-5 rounded-full
            bg-white
            shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]
            border-2 border-blue-500
            pointer-events-none
            transition-transform duration-100
            hover:scale-110
          "
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    </div>
  );
}
