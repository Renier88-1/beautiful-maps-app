'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ComparisonSliderProps {
  leftLabel: string;
  rightLabel: string;
  position: number; // 0-100
  onPositionChange: (position: number) => void;
  isVisible: boolean;
}

export function ComparisonSlider({
  leftLabel,
  rightLabel,
  position,
  onPositionChange,
  isVisible
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide tooltip after 3 seconds
  useEffect(() => {
    if (isVisible && showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, showTooltip]);

  // Reset tooltip when component becomes visible
  useEffect(() => {
    if (isVisible) setShowTooltip(true);
  }, [isVisible]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    onPositionChange(percentage);
  }, [onPositionChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none"
    >
      {/* Left side overlay with sepia tint to simulate "older" view */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          background: 'rgba(139, 119, 101, 0.15)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Right side overlay with modern tint */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 0 0 ${position}%)`,
          background: 'rgba(100, 150, 200, 0.08)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Slider line and handle - only this is interactive */}
      <div
        className="absolute top-0 bottom-0 w-8 cursor-ew-resize pointer-events-auto"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white shadow-lg" />

        {/* Handle circle */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-12 h-12 bg-white rounded-full shadow-xl
            flex items-center justify-center border-3
            transition-all duration-150
            ${isDragging ? 'border-blue-600 scale-110' : 'border-blue-500'}
          `}
        >
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-2 bg-amber-900/80 rounded-lg shadow-lg text-sm font-semibold text-white z-30 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="opacity-70">Before:</span>
          <span>{leftLabel}</span>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-2 bg-blue-900/80 rounded-lg shadow-lg text-sm font-semibold text-white z-30 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="opacity-70">After:</span>
          <span>{rightLabel}</span>
        </div>
      </div>

      {/* Instruction tooltip */}
      {showTooltip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 text-white text-sm rounded-lg z-30 pointer-events-none animate-pulse">
          Drag the slider to compare time periods
        </div>
      )}
    </div>
  );
}
