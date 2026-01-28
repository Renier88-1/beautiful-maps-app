export type MapStyle = 'cinematic' | 'minimalist' | 'data' | 'nolli' | 'figure-ground' | 'lulc' | 'sunpath';

export type Basemap = 'osm' | 'carto-light' | 'carto-dark' | 'carto-voyager' | 'carto-dark-nolabels';

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

export interface StyleSettings {
  cinematic: CinematicSettings;
  minimalist: MinimalistSettings;
  data: DataSettings;
  nolli: NolliSettings;
  figureGround: FigureGroundSettings;
  lulc: LulcSettings;
  sunpath: SunpathSettings;
}

export type DataLayer = 'population' | 'elevation' | 'landcover' | 'none';
export type ColorScheme = 'heat' | 'cool' | 'viridis' | 'plasma';

export interface CinematicSettings {
  timeOfDay: number; // 0-24
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
