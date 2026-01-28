'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NeomorphicInput } from './ui';

interface SearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

interface SearchBarProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Using Nominatim (OpenStreetMap) for free geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              'User-Agent': 'BeautifulMaps/1.0'
            }
          }
        );
        const data = await response.json();

        const searchResults: SearchResult[] = data.map((item: {
          display_name: string;
          lat: string;
          lon: string;
        }) => ({
          name: item.display_name.split(',')[0],
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));

        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setShowResults(false);
    onLocationSelect(result.lat, result.lng, result.name);
  };

  const SearchIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <NeomorphicInput
        value={query}
        onChange={setQuery}
        placeholder="Search for a location..."
        type="search"
        icon={SearchIcon}
        onFocus={() => results.length > 0 && setShowResults(true)}
      />

      {showResults && results.length > 0 && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-neutral-100 rounded-xl
            shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]
            overflow-hidden max-h-64 overflow-y-auto
          "
        >
          {isLoading && (
            <div className="px-4 py-3 text-neutral-500 text-sm">
              Searching...
            </div>
          )}
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="
                w-full px-4 py-3 text-left
                text-neutral-700 hover:bg-neutral-50
                transition-colors duration-150
                border-b border-neutral-200 last:border-b-0
              "
            >
              <div className="font-medium text-sm">{result.name}</div>
              <div className="text-xs text-neutral-500 truncate">
                {result.displayName}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 3 && results.length === 0 && !isLoading && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-neutral-100 rounded-xl
            shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]
            px-4 py-3 text-neutral-500 text-sm
          "
        >
          No results found
        </div>
      )}
    </div>
  );
}
