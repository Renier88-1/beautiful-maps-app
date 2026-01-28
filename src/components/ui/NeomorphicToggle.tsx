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
            w-12 h-6 rounded-full transition-all duration-200
            shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]
            ${checked ? 'bg-blue-500' : 'bg-neutral-200'}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-5 h-5 rounded-full
              bg-white
              shadow-[2px_2px_4px_rgba(0,0,0,0.1)]
              transition-all duration-200
              ${checked ? 'left-[26px]' : 'left-0.5'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-neutral-700">
          {label}
        </span>
      )}
    </label>
  );
}
