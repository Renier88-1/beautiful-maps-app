export type MapStyle = 'cinematic' | 'minimalist' | 'data' | 'nolli' | 'figure-ground' | 'lulc' | 'sunpath' | 'isochrone' | 'comparison' | 'roads' | 'tree-canopy' | 'lighthouse' | '3d-city';

export type Basemap =
  | 'osm'
  | 'carto-light'
  | 'carto-dark'
  | 'carto-voyager'
  | 'carto-dark-nolabels'
  | 'esri-imagery'
  | 'esri-terrain'
  | 'esri-natgeo'
  | 'opentopo'
  | 'stamen-terrain'
  | 'stamen-toner'
  | 'stamen-watercolor';

export interface NolliSettings {
  basemap: Basemap;
  buildingColor: string;
  publicSpaceColor: string;
  showLabels: boolean;
}

export interface FigureGroundSettings {
  basemap: Basemap;
  buildingColor: string;
  backgroundColor: string;
  showStreets: boolean;
}

export interface LulcSettings {
  basemap: Basemap;
  colorScheme: ColorScheme;
  showLegend: boolean;
  transparency: number;
}

export interface SunpathSettings {
  basemap: Basemap;
  date: string;
  time: number;
  showShadows: boolean;
  shadowOpacity: number;
}

export type TravelMode = 'walking' | 'cycling' | 'driving';
export type IsochroneColorScale = 'green-red' | 'blue-purple' | 'yellow-orange' | 'monochrome';
export type IsochroneMode = 'circles' | 'routed';

export interface IsochroneSettings {
  basemap: Basemap;
  mode: IsochroneMode;
  travelMode: TravelMode;
  intervals: number[];
  maxTime: number;
  colorScale: IsochroneColorScale;
  transparency: number;
  showLabels: boolean;
  clickedPoint: { lng: number; lat: number } | null;
  isLoading?: boolean;
  draggable: boolean;
  heartbeat: boolean;
}

export type ComparisonDataset = 'satellite' | 'terrain' | 'street';

export interface ComparisonSettings {
  basemap: Basemap;
  dataset: ComparisonDataset;
  leftYear: number;
  rightYear: number;
  sliderPosition: number;
}

export type RoadType = 'all' | 'highways' | 'arterial' | 'local';
export type RoadColorMode = 'type' | 'density' | 'connectivity';

export interface RoadsSettings {
  basemap: Basemap;
  roadType: RoadType;
  colorMode: RoadColorMode;
  lineWidth: number;
  showLabels: boolean;
  colorScheme: ColorScheme;
  transparency: number;
}

export type TreeCanopyColorMode = 'density' | 'height' | 'coverage';

export interface TreeCanopySettings {
  basemap: Basemap;
  colorMode: TreeCanopyColorMode;
  hexagonSize: number;
  minHeight: number;
  maxHeight: number;
  colorScheme: ColorScheme;
  transparency: number;
  show3D: boolean;
}

export type LighthouseBeamStyle = 'classic' | 'modern' | 'dramatic';

export interface LighthouseSettings {
  basemap: Basemap;
  beamStyle: LighthouseBeamStyle;
  beamIntensity: number;
  beamRotation: number;
  animateBeam: boolean;
  nightMode: boolean;
  fogDensity: number;
  colorScheme: ColorScheme;
}

export type CityRenderStyle = 'realistic' | 'stylized' | 'blueprint' | 'neon';

export interface City3DSettings {
  basemap: Basemap;
  renderStyle: CityRenderStyle;
  buildingHeight: number;
  showRoofs: boolean;
  lightingAngle: number;
  ambientOcclusion: boolean;
  colorScheme: ColorScheme;
  transparency: number;
  cameraOrbit: boolean;
}

export interface StyleSettings {
  cinematic: CinematicSettings;
  minimalist: MinimalistSettings;
  data: DataSettings;
  nolli: NolliSettings;
  figureGround: FigureGroundSettings;
  lulc: LulcSettings;
  sunpath: SunpathSettings;
  isochrone: IsochroneSettings;
  comparison: ComparisonSettings;
  roads: RoadsSettings;
  treeCanopy: TreeCanopySettings;
  lighthouse: LighthouseSettings;
  city3d: City3DSettings;
}

export type DataLayer = 'population' | 'elevation' | 'landcover' | 'none';
export type ColorScheme = 'heat' | 'cool' | 'viridis' | 'plasma';

export interface CinematicSettings {
  timeOfDay: number;
  shadows: boolean;
  atmosphericHaze: boolean;
  waterGlow: boolean;
  buildingLights: boolean;
  basemap: Basemap;
  dataLayer: DataLayer;
  colorScheme: ColorScheme;
}

export interface MinimalistSettings {
  showLabels: boolean;
  showRoads: boolean;
  showBuildings: boolean;
  colorTheme: 'light' | 'dark';
  terrainExaggeration: number;
  basemap: Basemap;
  dataLayer: DataLayer;
  colorScheme: ColorScheme;
}

export interface DataSettings {
  dataLayer: DataLayer;
  extrusionScale: number;
  colorScheme: ColorScheme;
  showLegend: boolean;
  basemap: Basemap;
}

export interface DataLayerInfo {
  name: string;
  source: string;
  description: string;
}

export interface ExportSettings {
  format: 'png' | 'jpg' | 'gif' | 'mp4';
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  quality: 'standard' | 'high' | 'ultra';
  width: number;
  height: number;
}

export interface SavedProject {
  id: string;
  name: string;
  locationName: string;
  location: {
    lat: number;
    lng: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  style: MapStyle;
  settings: StyleSettings;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

// ═══════════════════════════════════════════
// TEXT OVERLAY TYPES
// ═══════════════════════════════════════════

export type OverlayFontFamily = 'serif' | 'sans' | 'mono';
export type OverlayPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type OverlayFrameStyle = 'none' | 'thin' | 'thick' | 'double' | 'ornate';

export interface TextOverlaySettings {
  enabled: boolean;
  title: string;
  titleFontFamily: OverlayFontFamily;
  titleFontSize: number;
  titleColor: string;
  titlePosition: OverlayPosition;
  titleUppercase: boolean;
  titleLetterSpacing: number;
  subtitle: string;
  subtitleFontFamily: OverlayFontFamily;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleUppercase: boolean;
  showCoordinates: boolean;
  frameStyle: OverlayFrameStyle;
  frameColor: string;
  framePadding: number;
}

export interface MapPreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  style: MapStyle;
  pitch: number;
  bearing: number;
  zoom: number;
  textOverlay: Partial<TextOverlaySettings>;
  styleSettings?: Record<string, unknown>;
}
