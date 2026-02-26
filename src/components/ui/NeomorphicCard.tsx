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
    raised: 'bg-[var(--bg-card)] neu-shadow-raised',
    inset: 'bg-[var(--bg-card)] neu-shadow-inset',
    flat: 'bg-[var(--bg-card)] neu-shadow-flat'
  };

  const hoverClasses = hoverable
    ? 'hover:neu-shadow-raised-hover cursor-pointer transition-shadow duration-200'
    : '';

  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-[var(--border-subtle)]
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
