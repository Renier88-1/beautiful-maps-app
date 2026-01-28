'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface NeomorphicSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function NeomorphicSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select...',
  disabled = false,
  className = ''
}: NeomorphicSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-600 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between
          px-4 py-3 rounded-xl
          bg-neutral-100 text-left
          shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]
          transition-all duration-200
          ${isOpen ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className={selectedOption ? 'text-neutral-700' : 'text-neutral-400'}>
          {selectedOption?.icon && (
            <span className="mr-2">{selectedOption.icon}</span>
          )}
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-neutral-100 rounded-xl
            shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]
            overflow-hidden
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center px-4 py-3 text-left
                transition-colors duration-150
                ${option.value === value
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-neutral-700 hover:bg-neutral-50'
                }
              `}
            >
              {option.icon && (
                <span className="mr-2">{option.icon}</span>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
