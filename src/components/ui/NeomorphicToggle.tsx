'use client';

import React from 'react';

interface NeomorphicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function NeomorphicToggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}: NeomorphicToggleProps) {
  return (
    <label
      className={`
        flex items-center cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-all duration-200
            neu-shadow-inset-sm
            ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-input)]'}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-5 h-5 rounded-full
              bg-[var(--bg-elevated)]
              shadow-sm
              transition-all duration-200
              ${checked ? 'left-[22px]' : 'left-0.5'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
    </label>
  );
}
