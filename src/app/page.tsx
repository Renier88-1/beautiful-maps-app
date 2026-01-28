'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  MapView,
  MapViewRef,
  SearchBar,
  StyleSelector,
  StylePanel,
  ExportPanel,
  ExportFrameOverlay,
  MapLegend,
  MapTypeSelector,
  NeomorphicCard,
  NeomorphicButton,
  AuthModal
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProjects } from '@/hooks/useSavedProjects';
import { exportMapWithSettings, exportMapAsGif } from '@/lib/export';
import { isSupabaseConfigured } from '@/lib/supabase';
import type {
  MapStyle,
  CinematicSettings,
  MinimalistSettings,
  DataSettings,
  NolliSettings,
  FigureGroundSettings,
  LulcSettings,
  SunpathSettings,
  ExportSettings
} from '@/types';

export default function Home() {
  const mapRef = useRef<MapViewRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentStyle, setCurrentStyle] = useState<MapStyle>('cinematic');
  const [locationName, setLocationName] = useState<string>('Pretoria, South Africa');
  const [isExporting, setIsExporting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSavedProjects, setShowSavedProjects] = useState(false);

  // Export preview state
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    aspectRatio: '16:9',
    quality: 'high',
    width: 1920,
    height: 1080
  });
  const [mapContainerSize, setMapContainerSize] = useState({ width: 0, height: 0 });

  // Track map container size
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      setMapContainerSize({
        width: container.clientWidth,
        height: container.clientHeight
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Auth state
  const { user, isLoading: authLoading, signIn, signUp, signOut } = useAuth();
  const { projects, isLoading: projectsLoading, saveProject, deleteProject } = useSavedProjects(user?.id || null);

  // Style settings state
  const [cinematicSettings, setCinematicSettings] = useState<CinematicSettings>({
    timeOfDay: 12,
    shadows: true,
    atmosphericHaze: true,
    waterGlow: true,
    buildingLights: true,
    basemap: 'osm',
    dataLayer: 'none',
    colorScheme: 'heat'
  });

  const [minimalistSettings, setMinimalistSettings] = useState<MinimalistSettings>({
    showLabels: true,
    showRoads: true,
    showBuildings: true,
    colorTheme: 'light',
    terrainExaggeration: 1.2,
    basemap: 'carto-light',
    dataLayer: 'none',
    colorScheme: 'heat'
  });

  const [dataSettings, setDataSettings] = useState<DataSettings>({
    dataLayer: 'elevation',
    extrusionScale: 1.0,
    colorScheme: 'heat',
    showLegend: true,
    basemap: 'carto-light'
  });

  const [nolliSettings, setNolliSettings] = useState<NolliSettings>({
    basemap: 'carto-light',
    buildingColor: '#000000',
    publicSpaceColor: '#ffffff',
    showLabels: false
  });

  const [figureGroundSettings, setFigureGroundSettings] = useState<FigureGroundSettings>({
    basemap: 'carto-dark-nolabels',
    buildingColor: '#ffffff',
    backgroundColor: '#1a1a1a',
    showStreets: false
  });

  const [lulcSettings, setLulcSettings] = useState<LulcSettings>({
    basemap: 'carto-light',
    colorScheme: 'viridis',
    showLegend: true,
    transparency: 0.7
  });

  const [sunpathSettings, setSunpathSettings] = useState<SunpathSettings>({
    basemap: 'carto-light',
    date: new Date().toISOString().split('T')[0],
    time: 10,
    showShadows: true,
    shadowOpacity: 0.6
  });

  // Handle location selection
  const handleLocationSelect = useCallback((lat: number, lng: number, name: string) => {
    setLocationName(name);
    mapRef.current?.flyTo(lng, lat, 13);
  }, []);

  // Handle style change
  const handleStyleChange = useCallback((style: MapStyle) => {
    setCurrentStyle(style);

    const options: Record<string, unknown> = {};

    if (style === 'cinematic') {
      options.timeOfDay = cinematicSettings.timeOfDay;
      options.basemap = cinematicSettings.basemap;
      options.dataLayer = cinematicSettings.dataLayer;
      options.colorScheme = cinematicSettings.colorScheme;
    } else if (style === 'minimalist') {
      options.theme = minimalistSettings.colorTheme;
      options.basemap = minimalistSettings.basemap;
      options.dataLayer = minimalistSettings.dataLayer;
      options.colorScheme = minimalistSettings.colorScheme;
      options.terrainExaggeration = minimalistSettings.terrainExaggeration;
    } else if (style === 'data') {
      options.colorScheme = dataSettings.colorScheme;
      options.basemap = dataSettings.basemap;
      options.dataLayer = dataSettings.dataLayer;
      options.intensity = dataSettings.extrusionScale;
    } else if (style === 'nolli') {
      options.basemap = nolliSettings.basemap;
    } else if (style === 'figure-ground') {
      options.basemap = figureGroundSettings.basemap;
    } else if (style === 'lulc') {
      options.basemap = lulcSettings.basemap;
      options.colorScheme = lulcSettings.colorScheme;
    } else if (style === 'sunpath') {
      options.basemap = sunpathSettings.basemap;
      options.timeOfDay = sunpathSettings.time;
    }

    mapRef.current?.setStyle(style, options);
  }, [cinematicSettings, minimalistSettings, dataSettings, nolliSettings, figureGroundSettings, lulcSettings, sunpathSettings]);

  // Handle reset - returns to default cinematic view
  const handleReset = useCallback(() => {
    setCurrentStyle('cinematic');
    setLocationName('Pretoria, South Africa');
    setCinematicSettings({
      timeOfDay: 12,
      shadows: true,
      atmosphericHaze: true,
      waterGlow: true,
      buildingLights: true,
      basemap: 'osm',
      dataLayer: 'none',
      colorScheme: 'heat'
    });
    mapRef.current?.flyTo(28.2293, -25.7479, 12);
    mapRef.current?.setStyle('cinematic', { timeOfDay: 12, basemap: 'osm', dataLayer: 'none', colorScheme: 'heat' });
  }, []);

  // Handle cinematic settings change
  const handleCinematicChange = useCallback((settings: Partial<CinematicSettings>) => {
    setCinematicSettings(prev => {
      const newSettings = { ...prev, ...settings };

      if (currentStyle === 'cinematic') {
        mapRef.current?.setStyle('cinematic', {
          timeOfDay: newSettings.timeOfDay,
          basemap: newSettings.basemap,
          dataLayer: newSettings.dataLayer,
          colorScheme: newSettings.colorScheme
        });
      }

      return newSettings;
    });
  }, [currentStyle]);

  // Handle minimalist settings change
  const handleMinimalistChange = useCallback((settings: Partial<MinimalistSettings>) => {
    setMinimalistSettings(prev => {
      const newSettings = { ...prev, ...settings };

      if (currentStyle === 'minimalist') {
        mapRef.current?.setStyle('minimalist', {
          theme: newSettings.colorTheme,
          basemap: newSettings.basemap,
          dataLayer: newSettings.dataLayer,
          colorScheme: newSettings.colorScheme,
          terrainExaggeration: newSettings.terrainExaggeration
        });
      }

      return newSettings;
    });
  }, [currentStyle]);

  // Handle data settings change
  const handleDataChange = useCallback((settings: Partial<DataSettings>) => {
    setDataSettings(prev => {
      const newSettings = { ...prev, ...settings };

      if (currentStyle === 'data') {
        mapRef.current?.setStyle('data', {
          colorScheme: newSettings.colorScheme,
          basemap: newSettings.basemap,
          dataLayer: newSettings.dataLayer,
          intensity: newSettings.extrusionScale
        });
      }

      return newSettings;
    });
  }, [currentStyle]);

  // Handle export
  const handleExport = useCallback(async (settings: ExportSettings) => {
    const map = mapRef.current?.map;
    if (!map) return;

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `beautiful-map-${locationName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;

      if (settings.format === 'gif') {
        await exportMapAsGif(map, filename);
      } else {
        // Use the new function that respects aspect ratio and quality
        await exportMapWithSettings(map, settings, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [locationName]);

  // Handle save project
  const handleSaveProject = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    if (!center || zoom === null || pitch === null || bearing === null) return;

    const projectName = prompt('Enter a name for this project:', locationName);
    if (!projectName) return;

    const result = await saveProject({
      name: projectName,
      locationName: locationName,
      location: {
        lat: center.lat,
        lng: center.lng,
        zoom,
        pitch,
        bearing
      },
      style: currentStyle,
      settings: {
        cinematic: cinematicSettings,
        minimalist: minimalistSettings,
        data: dataSettings,
        nolli: nolliSettings,
        figureGround: figureGroundSettings,
        lulc: lulcSettings,
        sunpath: sunpathSettings
      }
    });

    if (result.error) {
      alert(result.error);
    } else {
      alert('Project saved successfully!');
    }
  }, [user, locationName, currentStyle, cinematicSettings, minimalistSettings, dataSettings, nolliSettings, figureGroundSettings, lulcSettings, sunpathSettings, saveProject]);

  // Handle load project
  const handleLoadProject = useCallback((project: typeof projects[0]) => {
    setLocationName(project.locationName);
    setCurrentStyle(project.style);

    mapRef.current?.flyTo(project.location.lng, project.location.lat, project.location.zoom);

    if (project.settings) {
      setCinematicSettings(project.settings.cinematic);
      setMinimalistSettings(project.settings.minimalist);
      setDataSettings(project.settings.data);
      if (project.settings.nolli) setNolliSettings(project.settings.nolli);
      if (project.settings.figureGround) setFigureGroundSettings(project.settings.figureGround);
      if (project.settings.lulc) setLulcSettings(project.settings.lulc);
      if (project.settings.sunpath) setSunpathSettings(project.settings.sunpath);
    }

    setShowSavedProjects(false);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    await signOut();
    setShowUserMenu(false);
  }, [signOut]);

  const supabaseEnabled = isSupabaseConfigured();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#e8ecef]">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 flex items-center justify-between gap-4 bg-[#e8ecef] border-b border-neutral-200/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg">🗺️</span>
            </div>
            <h1 className="text-lg font-semibold text-neutral-800 hidden sm:block">
              Beautiful Maps
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <SearchBar onLocationSelect={handleLocationSelect} />
        </div>

        <div className="flex items-center gap-2">
          {/* Save button */}
          {supabaseEnabled && (
            <NeomorphicButton
              onClick={handleSaveProject}
              size="sm"
            >
              💾
            </NeomorphicButton>
          )}

          {/* User menu */}
          {supabaseEnabled && (
            <div className="relative">
              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
              ) : user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium"
                  >
                    {user.email?.[0].toUpperCase() || 'U'}
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 z-50">
                        <NeomorphicCard variant="raised" padding="sm">
                          <div className="space-y-1">
                            <p className="text-xs text-neutral-500 px-2 py-1 truncate">
                              {user.email}
                            </p>
                            <hr className="border-neutral-200" />
                            <button
                              onClick={() => {
                                setShowSavedProjects(true);
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded"
                            >
                              📁 My Projects
                            </button>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                            >
                              Sign Out
                            </button>
                          </div>
                        </NeomorphicCard>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <NeomorphicButton
                  onClick={() => setShowAuthModal(true)}
                  size="sm"
                >
                  Sign In
                </NeomorphicButton>
              )}
            </div>
          )}

          <NeomorphicButton
            onClick={() => setShowSidebar(!showSidebar)}
            size="sm"
            className="lg:hidden"
          >
            {showSidebar ? '✕' : '☰'}
          </NeomorphicButton>
        </div>
      </header>

      {/* Map Type Selector */}
      <MapTypeSelector
        currentStyle={currentStyle}
        onStyleChange={handleStyleChange}
        onReset={handleReset}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <main ref={mapContainerRef} className="flex-1 relative">
          <MapView
            ref={mapRef}
            initialStyle={currentStyle}
            initialCenter={[28.2293, -25.7479]}
            initialZoom={12}
            initialPitch={60}
            initialBearing={-17.6}
          />

          {/* Export Frame Overlay */}
          <ExportFrameOverlay
            aspectRatio={exportSettings.aspectRatio}
            isVisible={showExportPreview}
            containerWidth={mapContainerSize.width}
            containerHeight={mapContainerSize.height}
          />

          {/* Map Legend */}
          <MapLegend
            dataLayer={
              currentStyle === 'cinematic' ? cinematicSettings.dataLayer :
              currentStyle === 'minimalist' ? minimalistSettings.dataLayer :
              dataSettings.dataLayer
            }
            colorScheme={
              currentStyle === 'cinematic' ? cinematicSettings.colorScheme :
              currentStyle === 'minimalist' ? minimalistSettings.colorScheme :
              dataSettings.colorScheme
            }
            isVisible={
              (currentStyle === 'cinematic' && cinematicSettings.dataLayer !== 'none') ||
              (currentStyle === 'minimalist' && minimalistSettings.dataLayer !== 'none') ||
              (currentStyle === 'data' && dataSettings.dataLayer !== 'none')
            }
          />

          {/* Location badge */}
          <div className="absolute top-4 left-4 z-10">
            <NeomorphicCard variant="raised" padding="sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium text-neutral-700">
                  {locationName}
                </span>
              </div>
            </NeomorphicCard>
          </div>

          {/* Mobile toggle button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden absolute bottom-4 right-4 z-10 w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center"
          >
            ⚙️
          </button>
        </main>

        {/* Sidebar */}
        <aside
          className={`
            ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            fixed lg:relative right-0 top-0 h-full
            w-80 flex-shrink-0
            bg-[#e8ecef] border-l border-neutral-200/50
            overflow-y-auto
            transition-transform duration-300 ease-in-out
            z-20 lg:z-auto
            pt-16 lg:pt-0
          `}
        >
          <div className="p-4 space-y-4">
            {/* Style Settings */}
            <StylePanel
              currentStyle={currentStyle}
              cinematicSettings={cinematicSettings}
              minimalistSettings={minimalistSettings}
              dataSettings={dataSettings}
              onCinematicChange={handleCinematicChange}
              onMinimalistChange={handleMinimalistChange}
              onDataChange={handleDataChange}
            />

            {/* Export Panel */}
            <ExportPanel
              onExport={handleExport}
              isExporting={isExporting}
              showPreview={showExportPreview}
              onPreviewChange={setShowExportPreview}
              onSettingsChange={setExportSettings}
            />

            {/* Tips */}
            <NeomorphicCard variant="flat" padding="sm">
              <div className="text-xs text-neutral-500 space-y-1">
                <p className="font-medium text-neutral-600">Tips:</p>
                <p>• Hold right-click to rotate the map</p>
                <p>• Scroll to zoom in/out</p>
                <p>• Double-click to zoom to a point</p>
              </div>
            </NeomorphicCard>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-10"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />

      {/* Saved Projects Modal */}
      {showSavedProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSavedProjects(false)}
          />
          <NeomorphicCard variant="raised" padding="lg" className="relative w-full max-w-md max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowSavedProjects(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-neutral-800 mb-4">My Projects</h2>

            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <p>No saved projects yet.</p>
                <p className="text-sm mt-1">Save your first map to see it here!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 hover:bg-neutral-150 transition-colors"
                  >
                    <button
                      onClick={() => handleLoadProject(project)}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-neutral-800">{project.name}</p>
                      <p className="text-xs text-neutral-500">{project.locationName}</p>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this project?')) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </NeomorphicCard>
        </div>
      )}
    </div>
  );
}
