'use client';

import React from 'react';

interface NeomorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  active?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function NeomorphicButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  active = false,
  className = '',
  type = 'button'
}: NeomorphicButtonProps) {
  const baseClasses = `
    relative rounded-xl font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    border border-[var(--border-subtle)]
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getVariantClasses = () => {
    if (variant === 'primary') {
      return `
        bg-[var(--accent)] text-white border-transparent
        neu-shadow-btn-primary
        hover:bg-[var(--accent-hover)] hover:neu-shadow-btn-primary-hover
        active:neu-shadow-active
        focus:ring-[var(--accent-light)]
      `;
    }
    if (variant === 'danger') {
      return `
        bg-red-500 text-white border-transparent
        neu-shadow-btn-danger
        hover:bg-red-600
        active:neu-shadow-active
        focus:ring-red-400
      `;
    }
    return `
      bg-[var(--bg-card)] text-[var(--text-primary)]
      neu-shadow-raised-sm
      hover:neu-shadow-raised-hover
      active:neu-shadow-active
      focus:ring-[var(--accent)]
    `;
  };

  const activeClasses = active ? 'neu-shadow-active' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${getVariantClasses()} ${activeClasses} ${className}`}
    >
      {children}
    </button>
  );
}
