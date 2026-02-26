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
        bg-[var(--bg-input)] rounded-xl
        border border-[var(--border-subtle)]
        neu-shadow-inset-sm
        transition-shadow duration-200
        focus-within:neu-shadow-inset-focus focus-within:border-[var(--accent)]
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && (
        <div className="absolute left-3 text-[var(--text-muted)]">
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
          w-full py-2.5 bg-transparent text-sm
          text-[var(--text-primary)] placeholder-[var(--text-muted)]
          focus:outline-none
          ${icon ? 'pl-10 pr-4' : 'px-4'}
        `}
      />
    </div>
  );
}
