'use client';

import React from 'react';

interface NeomorphicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

export function NeomorphicCard({
  children,
  className = '',
  variant = 'raised',
  padding = 'md',
  onClick,
  hoverable = false
}: NeomorphicCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantClasses = {
    raised: `
      bg-neutral-100
      shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]
    `,
    inset: `
      bg-neutral-100
      shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]
    `,
    flat: `
      bg-neutral-100
      shadow-sm
    `
  };

  const hoverClasses = hoverable
    ? 'hover:shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] cursor-pointer transition-shadow duration-200'
    : '';

  const clickableClasses = onClick
    ? 'cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        ${hoverClasses}
        ${clickableClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
