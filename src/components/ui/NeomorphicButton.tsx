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
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    default: `
      bg-neutral-100 text-neutral-700
      shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]
      hover:shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]
      active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]
      focus:ring-neutral-400
    `,
    primary: `
      bg-blue-500 text-white
      shadow-[4px_4px_8px_#3b82c6,-4px_-4px_8px_#60a5fa]
      hover:shadow-[2px_2px_4px_#3b82c6,-2px_-2px_4px_#60a5fa]
      active:shadow-[inset_2px_2px_4px_#2563eb,inset_-2px_-2px_4px_#60a5fa]
      focus:ring-blue-400
    `,
    danger: `
      bg-red-500 text-white
      shadow-[4px_4px_8px_#dc2626,-4px_-4px_8px_#f87171]
      hover:shadow-[2px_2px_4px_#dc2626,-2px_-2px_4px_#f87171]
      active:shadow-[inset_2px_2px_4px_#b91c1c,inset_-2px_-2px_4px_#f87171]
      focus:ring-red-400
    `
  };

  const activeClasses = active
    ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
    : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${activeClasses} ${className}`}
    >
      {children}
    </button>
  );
}
