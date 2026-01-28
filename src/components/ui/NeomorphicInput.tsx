'use client';

import React from 'react';

interface NeomorphicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function NeomorphicInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  className = '',
  icon,
  onFocus,
  onBlur,
  onKeyDown
}: NeomorphicInputProps) {
  return (
    <div
      className={`
        relative flex items-center
        bg-neutral-100 rounded-xl
        shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]
        transition-shadow duration-200
        focus-within:shadow-[inset_3px_3px_6px_#c1c1c1,inset_-3px_-3px_6px_#ffffff]
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && (
        <div className="absolute left-3 text-neutral-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`
          w-full py-3 bg-transparent
          text-neutral-700 placeholder-neutral-400
          focus:outline-none
          ${icon ? 'pl-10 pr-4' : 'px-4'}
        `}
      />
    </div>
  );
}
