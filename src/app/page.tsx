'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  MapView,
  MapViewRef,
  SearchBar,
  StylePanel,
  ExportPanel,
  ExportFrameOverlay,
  MapLegend,
  MapTypeSelector,
  ComparisonSlider,
  NeomorphicCard,
  NeomorphicButton,
  AuthModal,
  TextOverlayPanel,
  TextOverlayRenderer,
  PresetPanel
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSavedProjects } from '@/hooks/useSavedProjects';
import { exportMapWithSettings, exportMapAsGif, exportMapAsMp4 } from '@/lib/export';
import { isSupabaseConfigured } from '@/lib/supabase';
import type {
  MapStyle, CinematicSettings, MinimalistSettings, DataSettings, NolliSettings,
  FigureGroundSettings, LulcSettings, SunpathSettings, IsochroneSettings,
  ComparisonSettings, RoadsSettings, TreeCanopySettings, LighthouseSettings,
  City3DSettings, ExportSettings, TextOverlaySettings, MapPreset
} from '@/types';
import {
  generateIsochrones, generateCircleIsochrones, addIsochronesToMap,
  removeIsochronesFromMap, addClickMarker, removeClickMarker,
  startHeartbeatAnimation, stopHeartbeatAnimation
} from '@/lib/isochrone';

type SidebarTab = 'style' | 'overlay' | 'export';

const defaultTextOverlay: TextOverlaySettings = {
  enabled: false, title: '', titleFontFamily: 'serif', titleFontSize: 56,
  titleColor: '#ffffff', titlePosition: 'bottom-center', titleUppercase: true,
  titleLetterSpacing: 8, subtitle: '', subtitleFontFamily: 'mono',
  subtitleFontSize: 14, subtitleColor: '#94a3b8', subtitleUppercase: false,
  showCoordinates: false, frameStyle: 'none', frameColor: '#ffffff', framePadding: 24,
};

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
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('style');
  const [zenMode, setZenMode] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [textOverlay, setTextOverlay] = useState<TextOverlaySettings>(defaultTextOverlay);

  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png', aspectRatio: '16:9', quality: 'high', width: 1920, height: 1080
  });
  const [mapContainerSize, setMapContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const updateSize = () => setMapContainerSize({ width: container.clientWidth, height: container.clientHeight });
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Zen mode keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setZenMode(p => !p);
      if (e.key === 'Escape' && zenMode) setZenMode(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zenMode]);

  const { user, isLoading: authLoading, signIn, signUp, signOut } = useAuth();
  const { projects, isLoading: projectsLoading, saveProject, deleteProject } = useSavedProjects(user?.id || null);

  // === STYLE SETTINGS STATE ===
  const [cinematicSettings, setCinematicSettings] = useState<CinematicSettings>({ timeOfDay: 12, shadows: true, atmosphericHaze: true, waterGlow: true, buildingLights: true, basemap: 'osm', dataLayer: 'none', colorScheme: 'heat' });
  const [minimalistSettings, setMinimalistSettings] = useState<MinimalistSettings>({ showLabels: true, showRoads: true, showBuildings: true, colorTheme: 'light', terrainExaggeration: 1.2, basemap: 'carto-light', dataLayer: 'none', colorScheme: 'heat' });
  const [dataSettings, setDataSettings] = useState<DataSettings>({ dataLayer: 'elevation', extrusionScale: 1.0, colorScheme: 'heat', showLegend: true, basemap: 'carto-light' });
  const [nolliSettings, setNolliSettings] = useState<NolliSettings>({ basemap: 'carto-light', buildingColor: '#000000', publicSpaceColor: '#ffffff', showLabels: false });
  const [figureGroundSettings, setFigureGroundSettings] = useState<FigureGroundSettings>({ basemap: 'carto-dark-nolabels', buildingColor: '#ffffff', backgroundColor: '#1a1a1a', showStreets: false });
  const [lulcSettings, setLulcSettings] = useState<LulcSettings>({ basemap: 'carto-light', colorScheme: 'viridis', showLegend: true, transparency: 0.7 });
  const [sunpathSettings, setSunpathSettings] = useState<SunpathSettings>({ basemap: 'carto-light', date: new Date().toISOString().split('T')[0], time: 10, showShadows: true, shadowOpacity: 0.6 });
  const [isochroneSettings, setIsochroneSettings] = useState<IsochroneSettings>({ basemap: 'carto-light', mode: 'circles', travelMode: 'walking', intervals: [5, 10, 15, 20], maxTime: 20, colorScale: 'green-red', transparency: 0.7, showLabels: true, clickedPoint: null, isLoading: false, draggable: false, heartbeat: false });
  const [comparisonSettings, setComparisonSettings] = useState<ComparisonSettings>({ basemap: 'carto-light', dataset: 'satellite', leftYear: 2010, rightYear: 2024, sliderPosition: 50 });
  const [roadsSettings, setRoadsSettings] = useState<RoadsSettings>({ basemap: 'carto-dark', roadType: 'all', colorMode: 'density', lineWidth: 3, showLabels: false, colorScheme: 'heat', transparency: 0.8 });
  const [treeCanopySettings, setTreeCanopySettings] = useState<TreeCanopySettings>({ basemap: 'carto-light', colorMode: 'density', hexagonSize: 100, minHeight: 3, maxHeight: 30, colorScheme: 'viridis', transparency: 0.7, show3D: true });
  const [lighthouseSettings, setLighthouseSettings] = useState<LighthouseSettings>({ basemap: 'carto-dark', beamStyle: 'classic', beamIntensity: 0.8, beamRotation: 0, animateBeam: true, nightMode: true, fogDensity: 0.5, colorScheme: 'cool' });
  const [city3dSettings, setCity3dSettings] = useState<City3DSettings>({ basemap: 'carto-dark-nolabels', renderStyle: 'stylized', buildingHeight: 2.0, showRoofs: true, lightingAngle: 45, ambientOcclusion: true, colorScheme: 'plasma', transparency: 1.0, cameraOrbit: false });

  // === HANDLERS ===
  const handleLocationSelect = useCallback((lat: number, lng: number, name: string) => { setLocationName(name); mapRef.current?.flyTo(lng, lat, 13); }, []);

  const handleStyleChange = useCallback((style: MapStyle) => {
    setCurrentStyle(style);
    const options: Record<string, unknown> = {};
    if (style === 'cinematic') { options.timeOfDay = cinematicSettings.timeOfDay; options.basemap = cinematicSettings.basemap; options.dataLayer = cinematicSettings.dataLayer; options.colorScheme = cinematicSettings.colorScheme; }
    else if (style === 'minimalist') { options.theme = minimalistSettings.colorTheme; options.basemap = minimalistSettings.basemap; options.dataLayer = minimalistSettings.dataLayer; options.colorScheme = minimalistSettings.colorScheme; options.terrainExaggeration = minimalistSettings.terrainExaggeration; }
    else if (style === 'data') { options.colorScheme = dataSettings.colorScheme; options.basemap = dataSettings.basemap; options.dataLayer = dataSettings.dataLayer; options.intensity = dataSettings.extrusionScale; }
    else if (style === 'nolli') { options.basemap = nolliSettings.basemap; }
    else if (style === 'figure-ground') { options.basemap = figureGroundSettings.basemap; }
    else if (style === 'lulc') { options.basemap = lulcSettings.basemap; options.colorScheme = lulcSettings.colorScheme; }
    else if (style === 'sunpath') { options.basemap = sunpathSettings.basemap; options.timeOfDay = sunpathSettings.time; }
    else if (style === 'isochrone') { options.basemap = isochroneSettings.basemap; }
    else if (style === 'comparison') { options.basemap = comparisonSettings.basemap; }
    else if (style === 'roads') { options.basemap = roadsSettings.basemap; options.colorScheme = roadsSettings.colorScheme; }
    else if (style === 'tree-canopy') { options.basemap = treeCanopySettings.basemap; options.colorScheme = treeCanopySettings.colorScheme; }
    else if (style === 'lighthouse') { options.basemap = lighthouseSettings.basemap; options.colorScheme = lighthouseSettings.colorScheme; }
    else if (style === '3d-city') { options.basemap = city3dSettings.basemap; options.colorScheme = city3dSettings.colorScheme; }
    if (currentStyle === 'isochrone' && style !== 'isochrone') { const map = mapRef.current?.map; if (map) { stopHeartbeatAnimation(map); removeIsochronesFromMap(map); removeClickMarker(map); } setIsochroneSettings(prev => ({ ...prev, clickedPoint: null })); }
    mapRef.current?.setStyle(style, options);
  }, [cinematicSettings, minimalistSettings, dataSettings, nolliSettings, figureGroundSettings, lulcSettings, sunpathSettings, isochroneSettings, comparisonSettings, roadsSettings, treeCanopySettings, lighthouseSettings, city3dSettings, currentStyle]);

  const handleReset = useCallback(() => {
    setCurrentStyle('cinematic'); setLocationName('Pretoria, South Africa');
    setCinematicSettings({ timeOfDay: 12, shadows: true, atmosphericHaze: true, waterGlow: true, buildingLights: true, basemap: 'osm', dataLayer: 'none', colorScheme: 'heat' });
    mapRef.current?.flyTo(28.2293, -25.7479, 12);
    mapRef.current?.setStyle('cinematic', { timeOfDay: 12, basemap: 'osm', dataLayer: 'none', colorScheme: 'heat' });
  }, []);

  const handleCinematicChange = useCallback((settings: Partial<CinematicSettings>) => { setCinematicSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'cinematic') mapRef.current?.setStyle('cinematic', { timeOfDay: n.timeOfDay, basemap: n.basemap, dataLayer: n.dataLayer, colorScheme: n.colorScheme }); return n; }); }, [currentStyle]);
  const handleMinimalistChange = useCallback((settings: Partial<MinimalistSettings>) => { setMinimalistSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'minimalist') mapRef.current?.setStyle('minimalist', { theme: n.colorTheme, basemap: n.basemap, dataLayer: n.dataLayer, colorScheme: n.colorScheme, terrainExaggeration: n.terrainExaggeration }); return n; }); }, [currentStyle]);
  const handleDataChange = useCallback((settings: Partial<DataSettings>) => { setDataSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'data') mapRef.current?.setStyle('data', { colorScheme: n.colorScheme, basemap: n.basemap, dataLayer: n.dataLayer, intensity: n.extrusionScale }); return n; }); }, [currentStyle]);
  const handleSunpathChange = useCallback((settings: Partial<SunpathSettings>) => { setSunpathSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'sunpath') mapRef.current?.setStyle('sunpath', { basemap: n.basemap, timeOfDay: n.time }); return n; }); }, [currentStyle]);
  const handleLulcChange = useCallback((settings: Partial<LulcSettings>) => { setLulcSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'lulc') mapRef.current?.setStyle('lulc', { basemap: n.basemap, colorScheme: n.colorScheme }); return n; }); }, [currentStyle]);

  const handleIsochroneChange = useCallback(async (settings: Partial<IsochroneSettings>) => {
    const map = mapRef.current?.map;
    setIsochroneSettings(prev => {
      const n = { ...prev, ...settings };
      if (currentStyle === 'isochrone' && settings.basemap) mapRef.current?.setStyle('isochrone', { basemap: n.basemap });
      if (settings.heartbeat !== undefined && map) { if (settings.heartbeat && prev.clickedPoint) startHeartbeatAnimation(map, n.colorScale, n.transparency); else stopHeartbeatAnimation(map); }
      if (settings.draggable !== undefined && prev.clickedPoint && map) {
        addClickMarker(map, prev.clickedPoint, settings.draggable,
          (np) => { const iso = generateCircleIsochrones(np, n.intervals, n.travelMode); addIsochronesToMap(map, iso, n.colorScale, n.transparency); if (n.heartbeat) startHeartbeatAnimation(map, n.colorScale, n.transparency); },
          async (np) => { setIsochroneSettings(p => ({ ...p, clickedPoint: np, isLoading: n.mode === 'routed' })); const iso = await generateIsochrones(np, n.intervals, n.travelMode, n.mode); addIsochronesToMap(map, iso, n.colorScale, n.transparency); setIsochroneSettings(p => ({ ...p, isLoading: false })); if (n.heartbeat) startHeartbeatAnimation(map, n.colorScale, n.transparency); }
        );
      }
      return n;
    });
    const shouldRegen = settings.travelMode || settings.intervals || settings.maxTime || settings.colorScale || settings.transparency || settings.mode;
    setIsochroneSettings(prev => {
      if (prev.clickedPoint && shouldRegen && map) {
        const n = { ...prev, ...settings };
        if (n.mode === 'routed') setIsochroneSettings(p => ({ ...p, isLoading: true }));
        generateIsochrones(prev.clickedPoint, n.intervals, n.travelMode, n.mode).then(iso => { addIsochronesToMap(map, iso, n.colorScale, n.transparency); setIsochroneSettings(p => ({ ...p, isLoading: false })); if (n.heartbeat) startHeartbeatAnimation(map, n.colorScale, n.transparency); });
      }
      return { ...prev, ...settings };
    });
  }, [currentStyle]);

  const handleMapClick = useCallback(async (lng: number, lat: number) => {
    if (currentStyle !== 'isochrone') return;
    const map = mapRef.current?.map; if (!map) return;
    const cp = { lng, lat };
    setIsochroneSettings(prev => ({ ...prev, clickedPoint: cp, isLoading: isochroneSettings.mode === 'routed' }));
    addClickMarker(map, cp, isochroneSettings.draggable,
      (np) => { const iso = generateCircleIsochrones(np, isochroneSettings.intervals, isochroneSettings.travelMode); addIsochronesToMap(map, iso, isochroneSettings.colorScale, isochroneSettings.transparency); if (isochroneSettings.heartbeat) startHeartbeatAnimation(map, isochroneSettings.colorScale, isochroneSettings.transparency); },
      async (np) => { setIsochroneSettings(p => ({ ...p, clickedPoint: np, isLoading: isochroneSettings.mode === 'routed' })); const iso = await generateIsochrones(np, isochroneSettings.intervals, isochroneSettings.travelMode, isochroneSettings.mode); addIsochronesToMap(map, iso, isochroneSettings.colorScale, isochroneSettings.transparency); setIsochroneSettings(p => ({ ...p, isLoading: false })); if (isochroneSettings.heartbeat) startHeartbeatAnimation(map, isochroneSettings.colorScale, isochroneSettings.transparency); }
    );
    const iso = await generateIsochrones(cp, isochroneSettings.intervals, isochroneSettings.travelMode, isochroneSettings.mode);
    addIsochronesToMap(map, iso, isochroneSettings.colorScale, isochroneSettings.transparency);
    setIsochroneSettings(prev => ({ ...prev, isLoading: false }));
    if (isochroneSettings.heartbeat) startHeartbeatAnimation(map, isochroneSettings.colorScale, isochroneSettings.transparency);
  }, [currentStyle, isochroneSettings]);

  const handleClearIsochrones = useCallback(() => { const map = mapRef.current?.map; if (map) { stopHeartbeatAnimation(map); removeIsochronesFromMap(map); removeClickMarker(map); } setIsochroneSettings(prev => ({ ...prev, clickedPoint: null, isLoading: false })); }, []);
  const handleComparisonChange = useCallback((settings: Partial<ComparisonSettings>) => { setComparisonSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'comparison' && settings.basemap) mapRef.current?.setStyle('comparison', { basemap: n.basemap }); return n; }); }, [currentStyle]);
  const handleRoadsChange = useCallback((settings: Partial<RoadsSettings>) => { setRoadsSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'roads') mapRef.current?.setStyle('roads', { basemap: n.basemap, colorScheme: n.colorScheme }); return n; }); }, [currentStyle]);
  const handleTreeCanopyChange = useCallback((settings: Partial<TreeCanopySettings>) => { setTreeCanopySettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'tree-canopy') mapRef.current?.setStyle('tree-canopy', { basemap: n.basemap, colorScheme: n.colorScheme }); return n; }); }, [currentStyle]);
  const handleLighthouseChange = useCallback((settings: Partial<LighthouseSettings>) => { setLighthouseSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === 'lighthouse') mapRef.current?.setStyle('lighthouse', { basemap: n.basemap, colorScheme: n.colorScheme }); return n; }); }, [currentStyle]);
  const handleCity3dChange = useCallback((settings: Partial<City3DSettings>) => { setCity3dSettings(prev => { const n = { ...prev, ...settings }; if (currentStyle === '3d-city') mapRef.current?.setStyle('3d-city', { basemap: n.basemap, colorScheme: n.colorScheme }); return n; }); }, [currentStyle]);

  const handleExport = useCallback(async (settings: ExportSettings) => {
    const map = mapRef.current?.map; if (!map) return;
    setIsExporting(true);
    try {
      const ts = new Date().toISOString().split('T')[0];
      const fn = `beautiful-map-${locationName.replace(/[^a-zA-Z0-9]/g, '-')}-${ts}`;
      if (settings.format === 'gif') await exportMapAsGif(map, fn);
      else if (settings.format === 'mp4') await exportMapAsMp4(map, fn);
      else await exportMapWithSettings(map, settings, fn);
    } catch (err) { console.error('Export failed:', err); alert('Export failed. Please try again.'); }
    finally { setIsExporting(false); }
  }, [locationName]);

  const handleSaveProject = useCallback(async () => {
    if (!user) { setShowAuthModal(true); return; }
    const map = mapRef.current; if (!map) return;
    const center = map.getCenter(); const zoom = map.getZoom(); const pitch = map.getPitch(); const bearing = map.getBearing();
    if (!center || zoom === null || pitch === null || bearing === null) return;
    const name = prompt('Enter a name for this project:', locationName); if (!name) return;
    const result = await saveProject({ name, locationName, location: { lat: center.lat, lng: center.lng, zoom, pitch, bearing }, style: currentStyle, settings: { cinematic: cinematicSettings, minimalist: minimalistSettings, data: dataSettings, nolli: nolliSettings, figureGround: figureGroundSettings, lulc: lulcSettings, sunpath: sunpathSettings, isochrone: isochroneSettings, comparison: comparisonSettings, roads: roadsSettings, treeCanopy: treeCanopySettings, lighthouse: lighthouseSettings, city3d: city3dSettings } });
    if (result.error) alert(result.error); else alert('Project saved!');
  }, [user, locationName, currentStyle, cinematicSettings, minimalistSettings, dataSettings, nolliSettings, figureGroundSettings, lulcSettings, sunpathSettings, isochroneSettings, comparisonSettings, roadsSettings, treeCanopySettings, lighthouseSettings, city3dSettings, saveProject]);

  const handleLoadProject = useCallback((project: typeof projects[0]) => {
    setLocationName(project.locationName); setCurrentStyle(project.style);
    mapRef.current?.flyTo(project.location.lng, project.location.lat, project.location.zoom);
    if (project.settings) {
      setCinematicSettings(project.settings.cinematic); setMinimalistSettings(project.settings.minimalist); setDataSettings(project.settings.data);
      if (project.settings.nolli) setNolliSettings(project.settings.nolli);
      if (project.settings.figureGround) setFigureGroundSettings(project.settings.figureGround);
      if (project.settings.lulc) setLulcSettings(project.settings.lulc);
      if (project.settings.sunpath) setSunpathSettings(project.settings.sunpath);
      if (project.settings.isochrone) setIsochroneSettings(project.settings.isochrone);
      if (project.settings.comparison) setComparisonSettings(project.settings.comparison);
      if (project.settings.roads) setRoadsSettings(project.settings.roads);
      if (project.settings.treeCanopy) setTreeCanopySettings(project.settings.treeCanopy);
      if (project.settings.lighthouse) setLighthouseSettings(project.settings.lighthouse);
      if (project.settings.city3d) setCity3dSettings(project.settings.city3d);
    }
    setShowSavedProjects(false);
  }, []);

  const handleApplyPreset = useCallback((preset: MapPreset) => {
    setCurrentStyle(preset.style);
    setTextOverlay(prev => ({ ...prev, ...preset.textOverlay, title: preset.textOverlay.title || locationName }));
    const map = mapRef.current;
    if (map) { const c = map.getCenter(); if (c) mapRef.current?.flyTo(c.lng, c.lat, preset.zoom); }
    setSidebarTab('overlay');
    mapRef.current?.setStyle(preset.style, preset.styleSettings || {});
  }, [locationName]);

  const handleSignOut = useCallback(async () => { await signOut(); setShowUserMenu(false); }, [signOut]);
  const handleTextOverlayChange = useCallback((u: Partial<TextOverlaySettings>) => { setTextOverlay(prev => ({ ...prev, ...u })); }, []);
  const supabaseEnabled = isSupabaseConfigured();
  const getMapCoordinates = () => { const m = mapRef.current; if (!m) return null; const c = m.getCenter(); if (!c) return null; return { lat: c.lat, lng: c.lng }; };

  // === RENDER ===
  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)] ${zenMode ? 'zen-mode' : ''}`}>
      {/* HEADER */}
      <header className="flex-shrink-0 px-4 py-2.5 flex items-center justify-between gap-3 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <h1 className="text-base font-semibold text-[var(--text-primary)] hidden sm:block" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>Beautiful Maps</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-input)] rounded-lg p-1 border border-[var(--border-subtle)]">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[var(--accent)] to-purple-500 rounded-md">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Editor
            </span>
            <Link href="/data-sources" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors">Data</Link>
            <Link href="/artwork" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors">Gallery</Link>
          </nav>
        </div>
        <div className="flex-1 max-w-md"><SearchBar onLocationSelect={handleLocationSelect} /></div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZenMode(!zenMode)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors" title="Zen mode (F)">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors" title={`${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
            {theme === 'dark' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
          {supabaseEnabled && <button onClick={handleSaveProject} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors" title="Save"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg></button>}
          {supabaseEnabled && (
            <div className="relative">
              {authLoading ? <div className="w-7 h-7 rounded-full bg-[var(--bg-card-hover)] animate-pulse" /> : user ? (
                <>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 text-white flex items-center justify-center text-xs font-medium">{user.email?.[0].toUpperCase() || 'U'}</button>
                  {showUserMenu && (<><div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} /><div className="absolute right-0 mt-2 w-48 z-50"><NeomorphicCard variant="raised" padding="sm"><div className="space-y-1"><p className="text-xs text-[var(--text-muted)] px-2 py-1 truncate">{user.email}</p><hr className="border-[var(--border-subtle)]" /><button onClick={() => { setShowSavedProjects(true); setShowUserMenu(false); }} className="w-full text-left px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded">My Projects</button><button onClick={handleSignOut} className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded">Sign Out</button></div></NeomorphicCard></div></>)}
                </>
              ) : <NeomorphicButton onClick={() => setShowAuthModal(true)} size="sm">Sign In</NeomorphicButton>}
            </div>
          )}
          <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{showSidebar ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>
      </header>

      <MapTypeSelector currentStyle={currentStyle} onStyleChange={handleStyleChange} onReset={handleReset} />

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        <main ref={mapContainerRef} className="flex-1 relative">
          <MapView ref={mapRef} initialStyle={currentStyle} initialCenter={[28.2293, -25.7479]} initialZoom={12} initialPitch={60} initialBearing={-17.6} onClick={handleMapClick} />
          <TextOverlayRenderer settings={textOverlay} isVisible={textOverlay.enabled} />
          <ComparisonSlider leftLabel={`${comparisonSettings.leftYear}`} rightLabel={`${comparisonSettings.rightYear}`} position={comparisonSettings.sliderPosition} onPositionChange={(pos) => handleComparisonChange({ sliderPosition: pos })} isVisible={currentStyle === 'comparison'} />
          <ExportFrameOverlay aspectRatio={exportSettings.aspectRatio} isVisible={showExportPreview} containerWidth={mapContainerSize.width} containerHeight={mapContainerSize.height} />
          <div className="map-legend-wrapper">
            <MapLegend dataLayer={currentStyle === 'cinematic' ? cinematicSettings.dataLayer : currentStyle === 'minimalist' ? minimalistSettings.dataLayer : dataSettings.dataLayer} colorScheme={currentStyle === 'cinematic' ? cinematicSettings.colorScheme : currentStyle === 'minimalist' ? minimalistSettings.colorScheme : dataSettings.colorScheme} isVisible={(currentStyle === 'cinematic' && cinematicSettings.dataLayer !== 'none') || (currentStyle === 'minimalist' && minimalistSettings.dataLayer !== 'none') || (currentStyle === 'data' && dataSettings.dataLayer !== 'none')} />
          </div>
          <div className="location-badge absolute top-4 left-4 z-10">
            <div className="glass-panel rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-sm font-medium text-[var(--text-primary)]">{locationName}</span>
              </div>
            </div>
          </div>
          {zenMode && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-fadeIn"><button onClick={() => setZenMode(false)} className="glass-panel px-4 py-2 rounded-full text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Press F or Esc to exit zen mode</button></div>}
          <button onClick={() => setShowSidebar(!showSidebar)} className="mobile-settings-btn lg:hidden absolute bottom-4 right-4 z-10 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </main>

        {/* SIDEBAR */}
        <aside className={`${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} fixed lg:relative right-0 top-0 h-full w-80 flex-shrink-0 bg-[var(--bg-primary)] border-l border-[var(--border-subtle)] transition-transform duration-300 ease-in-out z-20 lg:z-auto pt-16 lg:pt-0 flex flex-col`}>
          <div className="px-3 pt-3 pb-1 flex-shrink-0">
            <div className="tab-bar">
              <button className={sidebarTab === 'style' ? 'active' : ''} onClick={() => setSidebarTab('style')}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                Style
              </button>
              <button className={sidebarTab === 'overlay' ? 'active' : ''} onClick={() => setSidebarTab('overlay')}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Overlay
              </button>
              <button className={sidebarTab === 'export' ? 'active' : ''} onClick={() => setSidebarTab('export')}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {sidebarTab === 'style' && (
              <div className="animate-fadeIn">
                <NeomorphicCard variant="raised" padding="md">
                  <StylePanel currentStyle={currentStyle} cinematicSettings={cinematicSettings} minimalistSettings={minimalistSettings} dataSettings={dataSettings} sunpathSettings={sunpathSettings} lulcSettings={lulcSettings} isochroneSettings={isochroneSettings} comparisonSettings={comparisonSettings} roadsSettings={roadsSettings} treeCanopySettings={treeCanopySettings} lighthouseSettings={lighthouseSettings} city3dSettings={city3dSettings} onCinematicChange={handleCinematicChange} onMinimalistChange={handleMinimalistChange} onDataChange={handleDataChange} onSunpathChange={handleSunpathChange} onLulcChange={handleLulcChange} onIsochroneChange={handleIsochroneChange} onComparisonChange={handleComparisonChange} onRoadsChange={handleRoadsChange} onTreeCanopyChange={handleTreeCanopyChange} onLighthouseChange={handleLighthouseChange} onCity3dChange={handleCity3dChange} onClearIsochrones={handleClearIsochrones} />
                </NeomorphicCard>
                <NeomorphicCard variant="flat" padding="sm">
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    <p className="font-medium text-[var(--text-secondary)]">Tips</p>
                    <p>Hold right-click to rotate the map</p>
                    <p>Scroll to zoom in/out</p>
                    <p>Press F for zen mode</p>
                  </div>
                </NeomorphicCard>
              </div>
            )}
            {sidebarTab === 'overlay' && (
              <div className="animate-fadeIn space-y-3">
                <NeomorphicCard variant="raised" padding="md">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Presets</h3>
                  <PresetPanel onApplyPreset={handleApplyPreset} />
                </NeomorphicCard>
                <NeomorphicCard variant="raised" padding="md">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Text & Branding</h3>
                  <TextOverlayPanel settings={textOverlay} onChange={handleTextOverlayChange} locationName={locationName} coordinates={getMapCoordinates()} />
                </NeomorphicCard>
              </div>
            )}
            {sidebarTab === 'export' && (
              <div className="animate-fadeIn">
                <NeomorphicCard variant="raised" padding="md">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Export Settings</h3>
                  <ExportPanel onExport={handleExport} isExporting={isExporting} showPreview={showExportPreview} onPreviewChange={setShowExportPreview} onSettingsChange={setExportSettings} />
                </NeomorphicCard>
              </div>
            )}
          </div>
        </aside>

        {showSidebar && <div className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-10" onClick={() => setShowSidebar(false)} />}
      </div>

      {/* MODALS */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSignIn={signIn} onSignUp={signUp} />
      {showSavedProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSavedProjects(false)} />
          <div className="relative z-10 w-full max-w-lg">
            <NeomorphicCard variant="raised" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>Saved Projects</h2>
                <button onClick={() => setShowSavedProjects(false)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {projectsLoading ? (
                <div className="text-center py-8 text-[var(--text-muted)]">Loading...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <p className="text-sm">No saved projects yet.</p>
                  <p className="text-xs mt-1">Save your current map to see it here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-colors cursor-pointer" onClick={() => handleLoadProject(project)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{project.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{project.locationName} • {project.style}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project?')) deleteProject(project.id); }} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </NeomorphicCard>
          </div>
        </div>
      )}
    </div>
  );
}
