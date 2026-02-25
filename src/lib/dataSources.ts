/**
 * Data Sources Configuration
 *
 * Comprehensive catalog of geospatial data sources for Beautiful Maps.
 * Organized by theme with metadata for the Data Sources Inspector.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TileSource {
  name: string;
  description: string;
  tiles: string[];
  type: 'raster' | 'raster-dem' | 'vector';
  attribution: string;
  minzoom?: number;
  maxzoom?: number;
  tileSize?: number;
  encoding?: 'terrarium' | 'mapbox';
  requiresProxy?: boolean;
}

export interface VectorTileSource {
  name: string;
  description: string;
  url: string;
  type: 'vector';
  attribution: string;
  minzoom?: number;
  maxzoom?: number;
  sourceLayer: string;
}

export interface ApiSource {
  name: string;
  shortName: string;
  description: string;
  apiUrl: string;
  docsUrl?: string;
  attribution: string;
  authRequired?: boolean;
  rateLimit?: string;
  dataFormat?: string;
  notes?: string;
}

export interface DataSourceCategory {
  theme: string;
  icon: string;
  description: string;
  sources: ApiSource[];
}

// ============================================================================
// BUILDINGS DATA SOURCES
// ============================================================================

export const buildingApiSources: ApiSource[] = [
  {
    name: 'Overture Maps Buildings',
    shortName: 'overture-buildings',
    description: 'Global building footprints from Overture Maps Foundation (Microsoft, Meta, Amazon)',
    apiUrl: 'https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
    docsUrl: 'https://docs.overturemaps.org/getting-data/',
    attribution: '© Overture Maps Foundation',
    dataFormat: 'GeoParquet/PMTiles',
    notes: 'Batch + static; convert GeoParquet → vector tiles. No live updates. Ideal for base layers.'
  },
  {
    name: 'Google Open Buildings',
    shortName: 'google-buildings',
    description: 'ML-derived building footprints with centroid, area, and confidence scores',
    apiUrl: 'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_Research_open-buildings_v3_polygons',
    docsUrl: 'https://developers.google.com/earth-engine/apidocs',
    attribution: '© Google',
    notes: 'Server-side only (GEE). Precompute & cache; not browser-direct.'
  },
  {
    name: 'OpenStreetMap Buildings',
    shortName: 'osm-buildings',
    description: 'Community-mapped building footprints with levels and height attributes',
    apiUrl: 'https://overpass-api.de/api/interpreter',
    docsUrl: 'https://wiki.openstreetmap.org/wiki/Overpass_API',
    attribution: '© OpenStreetMap contributors',
    rateLimit: 'Rate limited',
    notes: 'On-demand querying risky; pre-extract by city. Overpass rate limits.'
  },
  {
    name: 'Google-Microsoft Open Buildings',
    shortName: 'google-ms-buildings',
    description: 'ML-derived building footprints covering Africa, South Asia, Latin America',
    apiUrl: 'https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/go_ms_building_footprints.pmtiles',
    attribution: '© Google, Microsoft',
    dataFormat: 'PMTiles',
    notes: 'Combined dataset from Google and Microsoft ML models.'
  }
];

export const buildingSources: Record<string, VectorTileSource> = {
  'overture-buildings': {
    name: 'Overture Maps Buildings',
    description: 'Global building footprints from Overture Maps Foundation',
    url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
    type: 'vector',
    attribution: '© Overture Maps Foundation',
    minzoom: 0,
    maxzoom: 15,
    sourceLayer: 'building'
  },
  'google-ms-buildings': {
    name: 'Google-Microsoft Open Buildings',
    description: 'ML-derived building footprints covering Africa, South Asia, Latin America',
    url: 'pmtiles://https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/go_ms_building_footprints.pmtiles',
    type: 'vector',
    attribution: '© Google, Microsoft',
    minzoom: 0,
    maxzoom: 14,
    sourceLayer: 'building_footprints'
  },
  'source-coop-buildings': {
    name: 'Overture Buildings (Source Coop)',
    description: 'Overture Maps buildings via Source Cooperative',
    url: 'pmtiles://https://data.source.coop/cholmes/overture/overture-buildings.pmtiles',
    type: 'vector',
    attribution: '© Overture Maps Foundation',
    minzoom: 0,
    maxzoom: 14,
    sourceLayer: 'building'
  }
};

// ============================================================================
// ADDRESSES DATA SOURCES
// ============================================================================

export const addressSources: ApiSource[] = [
  {
    name: 'OpenAddresses',
    shortName: 'openaddresses',
    description: 'Global address database with house numbers, streets, and postcodes',
    apiUrl: 'https://batch.openaddresses.io',
    docsUrl: 'https://openaddresses.io/',
    attribution: '© OpenAddresses contributors',
    dataFormat: 'CSV/GeoJSON',
    notes: 'Static snapshots; normalize schemas per country.'
  }
];

// ============================================================================
// TRANSPORTATION DATA SOURCES
// ============================================================================

export const transportationSources: ApiSource[] = [
  {
    name: 'OpenStreetMap Transportation',
    shortName: 'osm-transport',
    description: 'Road network with highway types, speed limits, and lane counts',
    apiUrl: 'https://overpass-api.de/api/interpreter',
    docsUrl: 'https://wiki.openstreetmap.org/wiki/Key:highway',
    attribution: '© OpenStreetMap contributors',
    notes: 'Pre-tile roads; avoid live Overpass calls in production UI.'
  },
  {
    name: 'Overture Transportation',
    shortName: 'overture-transport',
    description: 'Roads, paths, and transportation network from Overture Maps',
    apiUrl: 'https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/transportation.pmtiles',
    docsUrl: 'https://docs.overturemaps.org/getting-data/',
    attribution: '© Overture Maps Foundation',
    dataFormat: 'PMTiles'
  },
  {
    name: 'Transitland (GTFS)',
    shortName: 'transitland',
    description: 'Public transit routes, stops, schedules, and operators worldwide',
    apiUrl: 'https://www.transit.land/api/v2/rest',
    docsUrl: 'https://www.transit.land/documentation',
    attribution: '© Transitland',
    dataFormat: 'GTFS/JSON',
    notes: 'Time-aware data; cache feeds, show validity dates.'
  },
  {
    name: 'TomTom Traffic APIs',
    shortName: 'tomtom-traffic',
    description: 'Real-time traffic speed, congestion levels, incidents, and travel times',
    apiUrl: 'https://api.tomtom.com/traffic/services',
    docsUrl: 'https://www.tomtom.com/products/traffic-apis/',
    attribution: '© TomTom',
    authRequired: true,
    rateLimit: 'Rate limited, API key required',
    notes: 'REAL-TIME, COMMERCIAL: requires API key. Display as overlays only.'
  }
];

export const osmVectorSources: Record<string, VectorTileSource> = {
  'protomaps-basemap': {
    name: 'Protomaps OSM Basemap',
    description: 'Full OSM basemap with roads, water, buildings, labels',
    url: 'pmtiles://https://build.protomaps.com/20250115.pmtiles',
    type: 'vector',
    attribution: '© OpenStreetMap contributors, Protomaps',
    minzoom: 0,
    maxzoom: 15,
    sourceLayer: 'roads'
  },
  'overture-transportation': {
    name: 'Overture Transportation',
    description: 'Roads, paths, and transportation network from Overture Maps',
    url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/transportation.pmtiles',
    type: 'vector',
    attribution: '© Overture Maps Foundation',
    minzoom: 0,
    maxzoom: 15,
    sourceLayer: 'segment'
  },
  'overture-places': {
    name: 'Overture Places',
    description: 'Points of interest from Overture Maps',
    url: 'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/places.pmtiles',
    type: 'vector',
    attribution: '© Overture Maps Foundation',
    minzoom: 0,
    maxzoom: 15,
    sourceLayer: 'place'
  }
};

// ============================================================================
// POPULATION DATA SOURCES
// ============================================================================

export const populationSources: Record<string, TileSource> = {
  'ghsl-population': {
    name: 'GHSL Population',
    description: 'Global Human Settlement Layer - 100m population density from EU JRC',
    tiles: ['/api/tiles?source=ghsl&z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© European Commission, JRC - GHSL',
    minzoom: 0,
    maxzoom: 14,
    tileSize: 256,
    requiresProxy: true
  },
  'worldpop-arcgis': {
    name: 'WorldPop ArcGIS',
    description: 'WorldPop 100m population density via ArcGIS ImageServer (2000-2020)',
    tiles: ['/api/tiles?source=worldpop-arcgis&z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© WorldPop, University of Southampton',
    minzoom: 0,
    maxzoom: 12,
    tileSize: 256,
    requiresProxy: true
  },
  'worldpop': {
    name: 'WorldPop',
    description: 'WorldPop global 100m population estimates',
    tiles: ['/api/tiles?source=worldpop&z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© WorldPop, University of Southampton',
    minzoom: 0,
    maxzoom: 14,
    tileSize: 256,
    requiresProxy: true
  },
  'sedac-gpw': {
    name: 'SEDAC GPWv4',
    description: 'NASA SEDAC Gridded Population of the World v4',
    tiles: ['/api/tiles?source=sedac&z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© NASA SEDAC, CIESIN',
    minzoom: 0,
    maxzoom: 10,
    tileSize: 256,
    requiresProxy: true
  }
};

export const populationApiSources: ApiSource[] = [
  {
    name: 'WorldPop STAC',
    shortName: 'worldpop-stac',
    description: 'Population rasters with age/sex breakdowns via STAC catalog',
    apiUrl: 'https://stac.worldpop.org/',
    docsUrl: 'https://www.worldpop.org/',
    attribution: '© WorldPop, University of Southampton',
    dataFormat: 'COG (Cloud Optimized GeoTIFF)',
    notes: 'Raster COGs → dynamic tiles via TiTiler. Good for year sliders.'
  },
  {
    name: 'WorldPop REST API',
    shortName: 'worldpop-rest',
    description: 'Zonal statistics and sampled population values',
    apiUrl: 'https://www.worldpop.org/rest/data',
    docsUrl: 'https://www.worldpop.org/sdi/introapi/',
    attribution: '© WorldPop, University of Southampton',
    rateLimit: '1000 requests/day without API key',
    notes: 'Use server-side aggregation; avoid per-user raster reads.'
  },
  {
    name: 'Wazimap NG (South Africa)',
    shortName: 'wazimap-ng',
    description: 'South African census data: income, education, services by ward',
    apiUrl: 'https://wazimap-ng.openup.org.za/api/v1/',
    docsUrl: 'https://wazimap.co.za/',
    attribution: '© OpenUp South Africa',
    dataFormat: 'JSON',
    notes: 'JSON API; join to wards. Cache responses.'
  }
];

// ============================================================================
// GOVERNANCE & BOUNDARIES DATA SOURCES
// ============================================================================

export const governanceSources: ApiSource[] = [
  {
    name: 'MDB South Africa',
    shortName: 'mdb-sa',
    description: 'South African wards, municipalities, and provinces from Municipal Demarcation Board',
    apiUrl: 'https://dataportal-mdb-sa.opendata.arcgis.com/datasets',
    docsUrl: 'https://dataportal-mdb-sa.opendata.arcgis.com/',
    attribution: '© Municipal Demarcation Board South Africa',
    notes: 'Authoritative boundaries; version carefully (boundary changes!).'
  },
  {
    name: 'GADM',
    shortName: 'gadm',
    description: 'Global administrative boundaries database',
    apiUrl: 'https://gadm.org/download_world.html',
    docsUrl: 'https://gadm.org/',
    attribution: '© GADM',
    dataFormat: 'Shapefile/GeoPackage',
    notes: 'Global admin boundaries at multiple levels.'
  },
  {
    name: 'IEC Election API (South Africa)',
    shortName: 'iec-elections',
    description: 'South African election results: votes, turnout, spoilt ballots',
    apiUrl: 'https://api.elections.org.za/',
    docsUrl: 'https://www.elections.org.za/',
    attribution: '© Electoral Commission of South Africa',
    authRequired: true,
    notes: 'Auth required; treat as sensitive political data. Cache + timestamp clearly.'
  }
];

export const southAfricaSources = {
  mdbBoundaries: {
    portal: 'https://dataportal-mdb-sa.opendata.arcgis.com',
    description: 'South African municipal and ward boundaries from MDB',
    datasets: {
      districts2018: 'District municipalities 2018',
      local2018: 'Local municipalities 2018',
      wards2018: 'Municipal wards 2018'
    },
    attribution: '© Municipal Demarcation Board South Africa'
  },
  geofabrik: {
    pbfUrl: 'https://download.geofabrik.de/africa/south-africa-latest.osm.pbf',
    shpUrl: 'https://download.geofabrik.de/africa/south-africa-latest-free.shp.zip',
    description: 'Daily updated OSM extract for South Africa',
    attribution: '© OpenStreetMap contributors, Geofabrik'
  }
};

// ============================================================================
// LAND COVER DATA SOURCES
// ============================================================================

export const landcoverSources: Record<string, TileSource> = {
  'esa-worldcover': {
    name: 'ESA WorldCover',
    description: 'ESA WorldCover 10m land cover classification',
    tiles: ['/api/tiles/worldcover?z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© ESA WorldCover 2021',
    minzoom: 0,
    maxzoom: 14,
    tileSize: 256,
    requiresProxy: true
  },
  'esri-landcover': {
    name: 'ESRI Land Cover',
    description: 'ESRI 10m global land cover based on Sentinel-2',
    tiles: ['https://lulctimeseries.blob.core.windows.net/lulctimeseriesv003/lc2022/{z}/{x}/{y}.png'],
    type: 'raster',
    attribution: '© ESRI, Impact Observatory',
    minzoom: 0,
    maxzoom: 14,
    tileSize: 256,
    requiresProxy: false
  },
  'copernicus-lc': {
    name: 'Copernicus Land Cover',
    description: 'Copernicus Global Land Service 100m land cover',
    tiles: ['/api/tiles/copernicus?z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© Copernicus Land Monitoring Service',
    minzoom: 0,
    maxzoom: 12,
    tileSize: 256,
    requiresProxy: true
  }
};

export const landcoverApiSources: ApiSource[] = [
  {
    name: 'ESA WorldCover',
    shortName: 'esa-worldcover',
    description: '10m global land cover classification with class confidence',
    apiUrl: 'https://planetarycomputer.microsoft.com/dataset/esa-worldcover',
    docsUrl: 'https://esa-worldcover.org/',
    attribution: '© ESA',
    dataFormat: 'COG',
    notes: 'Raster tiles; categorical legend mandatory in UI.'
  },
  {
    name: 'MODIS Land Cover',
    shortName: 'modis-lc',
    description: '500m resolution 17-class land cover with QA flags',
    apiUrl: 'https://lpdaac.usgs.gov/products/mcd12q1v061/',
    docsUrl: 'https://lpdaac.usgs.gov/lpdaac-api',
    attribution: '© NASA LP DAAC',
    notes: 'Coarse (500m); only use at regional scales.'
  }
];

// ============================================================================
// VEGETATION & FOREST DATA SOURCES
// ============================================================================

export const treeCanopySources: Record<string, TileSource> = {
  'gfw-treecover-2000': {
    name: 'GFW Tree Cover 2000',
    description: 'Hansen Global Forest Change - Tree cover extent 2000',
    tiles: ['https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/tree_cover_2000/{z}/{x}/{y}.png'],
    type: 'raster',
    attribution: '© Hansen/UMD/Google/USGS/NASA, Global Forest Watch',
    minzoom: 0,
    maxzoom: 12,
    tileSize: 256,
    requiresProxy: false
  },
  'gfw-loss': {
    name: 'GFW Tree Cover Loss',
    description: 'Hansen Global Forest Change - Cumulative tree cover loss',
    tiles: ['https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/loss_year/{z}/{x}/{y}.png'],
    type: 'raster',
    attribution: '© Hansen/UMD/Google/USGS/NASA, Global Forest Watch',
    minzoom: 0,
    maxzoom: 12,
    tileSize: 256,
    requiresProxy: false
  },
  'meta-canopy-height': {
    name: 'Meta Canopy Height',
    description: 'Meta/WRI 1m Global Canopy Height using AI',
    tiles: ['/api/tiles/canopy-height?z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© Meta AI, World Resources Institute',
    minzoom: 0,
    maxzoom: 14,
    tileSize: 256,
    requiresProxy: true
  },
  'glad-tree-height': {
    name: 'GLAD Tree Height',
    description: 'UMD GLAD 30m tree cover height from GEDI + Landsat',
    tiles: ['/api/tiles/glad-height?z={z}&x={x}&y={y}'],
    type: 'raster',
    attribution: '© GLAD, University of Maryland',
    minzoom: 0,
    maxzoom: 12,
    tileSize: 256,
    requiresProxy: true
  }
};

export const vegetationApiSources: ApiSource[] = [
  {
    name: 'Global Forest Watch API',
    shortName: 'gfw-api',
    description: 'Tree cover percentage, forest loss and gain by year',
    apiUrl: 'https://data-api.globalforestwatch.org/',
    docsUrl: 'https://www.globalforestwatch.org/',
    attribution: '© Global Forest Watch',
    notes: 'Temporal layers; animate loss/gain carefully (year slider).'
  },
  {
    name: 'Meta Canopy Height',
    shortName: 'meta-canopy',
    description: '1m resolution canopy height with uncertainty estimates',
    apiUrl: 'https://developers.google.com/earth-engine/datasets/catalog/META_Trees_Height_V1',
    docsUrl: 'https://sustainability.meta.com/',
    attribution: '© Meta AI',
    notes: 'Heavy rasters; downsample for web display.'
  }
];

// ============================================================================
// HYDROLOGY DATA SOURCES
// ============================================================================

export const hydrologySources: ApiSource[] = [
  {
    name: 'HydroSHEDS Rivers',
    shortName: 'hydrosheds',
    description: 'Global river network with stream order and discharge',
    apiUrl: 'https://www.hydrosheds.org/hydrosheds-core-downloads',
    docsUrl: 'https://www.hydrosheds.org/',
    attribution: '© WWF HydroSHEDS',
    notes: 'Pre-extract vectors; don\'t render raw flow rasters client-side.'
  },
  {
    name: 'OSM Waterways',
    shortName: 'osm-waterways',
    description: 'OpenStreetMap rivers, streams, and water bodies',
    apiUrl: 'https://overpass-api.de/api/interpreter',
    docsUrl: 'https://wiki.openstreetmap.org/wiki/Key:waterway',
    attribution: '© OpenStreetMap contributors',
    notes: 'Style hierarchically (stream vs river).'
  }
];

// ============================================================================
// TOPOGRAPHY & ELEVATION DATA SOURCES
// ============================================================================

export const elevationSources: Record<string, TileSource> = {
  'aws-terrain': {
    name: 'AWS Terrain',
    description: 'Global elevation data from AWS Open Data (Terrarium encoded)',
    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
    type: 'raster-dem',
    attribution: '© AWS Open Data, Mapzen',
    maxzoom: 15,
    tileSize: 256,
    encoding: 'terrarium'
  },
  'maptiler-terrain': {
    name: 'MapTiler Terrain',
    description: 'High-resolution terrain from MapTiler',
    tiles: ['https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.webp?key=get_your_own_key'],
    type: 'raster-dem',
    attribution: '© MapTiler',
    maxzoom: 12,
    tileSize: 256,
    encoding: 'mapbox',
    requiresProxy: true
  }
};

export const topographyApiSources: ApiSource[] = [
  {
    name: 'Copernicus DEM GLO-30',
    shortName: 'copernicus-dem',
    description: '30m global elevation with slope and aspect derivatives',
    apiUrl: 'https://planetarycomputer.microsoft.com/dataset/copernicus-dem-glo-30',
    docsUrl: 'https://spacedata.copernicus.eu/',
    attribution: '© Copernicus',
    dataFormat: 'COG',
    notes: 'Raster tiles; derive hillshade server-side.'
  },
  {
    name: 'OpenTopography DEMs',
    shortName: 'opentopography',
    description: 'High-resolution elevation rasters from various sources',
    apiUrl: 'https://portal.opentopography.org/apidocs',
    docsUrl: 'https://opentopography.org/',
    attribution: '© OpenTopography',
    authRequired: true,
    notes: 'Some datasets require API key; cache aggressively.'
  },
  {
    name: 'OpenTopoData',
    shortName: 'opentopodata',
    description: 'Elevation point queries from multiple DEM sources',
    apiUrl: 'https://api.opentopodata.org',
    docsUrl: 'https://www.opentopodata.org/',
    attribution: '© OpenTopoData',
    notes: 'Point queries only; great for profiles, not maps.'
  }
];

// ============================================================================
// CLIMATE DATA SOURCES
// ============================================================================

export const climateSources: ApiSource[] = [
  {
    name: 'Copernicus CDS (ERA5)',
    shortName: 'copernicus-era5',
    description: 'Reanalysis climate data: temperature, precipitation, wind, projections',
    apiUrl: 'https://cds.climate.copernicus.eu/api/v2',
    docsUrl: 'https://cds.climate.copernicus.eu/',
    attribution: '© Copernicus Climate Change Service',
    authRequired: true,
    notes: 'Backend processing only; expose summaries to UI.'
  },
  {
    name: 'IRI/LDEO Climate',
    shortName: 'iri-ldeo',
    description: 'Climate anomalies and drought indices via OPeNDAP',
    apiUrl: 'http://iridl.ldeo.columbia.edu/opendap',
    docsUrl: 'https://iridl.ldeo.columbia.edu/',
    attribution: '© IRI Columbia University',
    notes: 'OPeNDAP → precompute tiles/statistics.'
  }
];

// ============================================================================
// AIR QUALITY DATA SOURCES
// ============================================================================

export const airQualitySources: ApiSource[] = [
  {
    name: 'OpenAQ',
    shortName: 'openaq',
    description: 'Global air quality measurements: PM2.5, NO₂, O₃ with timestamps',
    apiUrl: 'https://api.openaq.org/v2',
    docsUrl: 'https://openaq.org/',
    attribution: '© OpenAQ',
    dataFormat: 'JSON',
    notes: 'Time-series UI required; station gaps common.'
  },
  {
    name: 'SAAQIS (South Africa)',
    shortName: 'saaqis',
    description: 'South African air quality: pollutant levels and compliance data',
    apiUrl: 'https://saaqis.environment.gov.za/',
    docsUrl: 'https://saaqis.environment.gov.za/',
    attribution: '© South African Air Quality Information System',
    authRequired: true,
    notes: 'Registration required; mirror selectively.'
  }
];

// ============================================================================
// SOCIOECONOMIC DATA SOURCES
// ============================================================================

export const socioeconomicSources: ApiSource[] = [
  {
    name: 'World Bank Open Data',
    shortName: 'worldbank',
    description: 'Development indicators: GDP, poverty, education, health',
    apiUrl: 'https://api.worldbank.org/v2',
    docsUrl: 'https://data.worldbank.org/',
    attribution: '© World Bank',
    dataFormat: 'JSON/XML',
    notes: 'Country/province scale only; avoid over-granular mapping.'
  },
  {
    name: 'HDX HAPI',
    shortName: 'hdx-hapi',
    description: 'Humanitarian indicators: vulnerability, poverty, crisis data',
    apiUrl: 'https://hapi.humdata.org/api/v1',
    docsUrl: 'https://data.humdata.org/',
    attribution: '© OCHA Centre for Humanitarian Data',
    notes: 'Crisis-oriented indicators; show uncertainty.'
  }
];

// ============================================================================
// HAZARDS DATA SOURCES
// ============================================================================

export const hazardSources: ApiSource[] = [
  {
    name: 'SEDAC Disaster Hotspots',
    shortName: 'sedac-hazards',
    description: 'Static risk layers for floods, cyclones, earthquakes',
    apiUrl: 'https://sedac.ciesin.columbia.edu/',
    docsUrl: 'https://sedac.ciesin.columbia.edu/',
    attribution: '© NASA SEDAC',
    notes: 'Static risk layers; not event prediction.'
  },
  {
    name: 'EM-DAT (via HDX)',
    shortName: 'emdat',
    description: 'Historical disaster database: deaths, damages, events',
    apiUrl: 'https://hapi.humdata.org/api/v1',
    docsUrl: 'https://www.emdat.be/',
    attribution: '© EM-DAT, CRED',
    notes: 'Tabular → charts, not maps (country-level).'
  }
];

// ============================================================================
// BIODIVERSITY DATA SOURCES
// ============================================================================

export const biodiversitySources: ApiSource[] = [
  {
    name: 'GBIF',
    shortName: 'gbif',
    description: 'Global biodiversity information: species occurrences worldwide',
    apiUrl: 'https://api.gbif.org/v1',
    docsUrl: 'https://www.gbif.org/',
    attribution: '© GBIF',
    dataFormat: 'JSON',
    notes: 'Huge volumes; cluster points or use heatmap.'
  },
  {
    name: 'SANBI BGIS (South Africa)',
    shortName: 'sanbi-bgis',
    description: 'South African ecosystems, protected areas, biodiversity planning',
    apiUrl: 'https://bgisapi.sanbi.org/api',
    docsUrl: 'http://bgis.sanbi.org/',
    attribution: '© SANBI',
    notes: 'Authoritative ZA biodiversity planning layers.'
  }
];

// ============================================================================
// AGRICULTURE DATA SOURCES
// ============================================================================

export const agricultureSources: ApiSource[] = [
  {
    name: 'FAOSTAT',
    shortName: 'faostat',
    description: 'Global agricultural statistics: crops, yields, livestock',
    apiUrl: 'https://fenixservices.fao.org/faostat/api/v1',
    docsUrl: 'https://www.fao.org/faostat/',
    attribution: '© FAO',
    dataFormat: 'JSON',
    notes: 'Statistical charts, not spatial micro-analysis.'
  },
  {
    name: 'SA Bioenergy Atlas',
    shortName: 'sa-bioenergy',
    description: 'South African biomass and agricultural residue data',
    apiUrl: 'https://developers.google.com/earth-engine/apidocs',
    docsUrl: 'https://www.sabioenergy.co.za/',
    attribution: '© South African Bioenergy Atlas',
    notes: 'Raster/vector mix; backend processing required.'
  }
];

// ============================================================================
// ADDITIONAL BASEMAPS & TILE SOURCES
// ============================================================================

export const additionalSources: Record<string, TileSource> = {
  'natural-earth': {
    name: 'Natural Earth',
    description: 'Natural Earth shaded relief and hypsometric tints',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'],
    type: 'raster',
    attribution: '© National Geographic, Esri',
    maxzoom: 16,
    tileSize: 256,
    requiresProxy: false
  },
  'esri-imagery': {
    name: 'ESRI Imagery',
    description: 'High-resolution satellite imagery',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    type: 'raster',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    maxzoom: 19,
    tileSize: 256,
    requiresProxy: false
  },
  'stamen-terrain': {
    name: 'Stamen Terrain',
    description: 'Terrain visualization with labels',
    tiles: ['https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png'],
    type: 'raster',
    attribution: '© Stamen Design, Stadia Maps, OpenStreetMap contributors',
    maxzoom: 18,
    tileSize: 256,
    requiresProxy: false
  }
};

// ============================================================================
// WORLDPOP ARCGIS SERVICES
// ============================================================================

export const worldPopServices = {
  density100m: {
    serviceUrl: 'https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_100m/ImageServer',
    exportUrl: 'https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_100m/ImageServer/exportImage',
    description: 'WorldPop 100m population density 2000-2020',
    years: [2000, 2005, 2010, 2015, 2020],
    attribution: '© WorldPop, University of Southampton'
  },
  density1km: {
    serviceUrl: 'https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer',
    exportUrl: 'https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer/exportImage',
    description: 'WorldPop 1km population density 2000-2020',
    years: [2000, 2005, 2010, 2015, 2020],
    attribution: '© WorldPop, University of Southampton'
  },
  restApi: {
    baseUrl: 'https://www.worldpop.org/rest/data',
    statsApi: 'https://api.worldpop.org/v1/services/stats',
    rateLimit: '1000 requests/day without API key',
    attribution: '© WorldPop, University of Southampton'
  }
};

// ============================================================================
// OSM TAG INFO API
// ============================================================================

export const osmTagInfo = {
  baseUrl: 'https://taginfo.openstreetmap.org/api/4',
  endpoints: {
    keyOverview: '/key/overview',
    tagOverview: '/tag/overview',
    searchByKeyword: '/search/by_keyword',
    popularTags: '/tags/popular'
  },
  description: 'OSM tag statistics and metadata API'
};

// ============================================================================
// COMPLETE DATA SOURCE CATALOG BY THEME
// ============================================================================

export const dataSourceCatalog: DataSourceCategory[] = [
  {
    theme: 'Buildings',
    icon: '🏢',
    description: 'Building footprints, heights, and structural data',
    sources: buildingApiSources
  },
  {
    theme: 'Addresses',
    icon: '📍',
    description: 'Address databases and geocoding sources',
    sources: addressSources
  },
  {
    theme: 'Transportation',
    icon: '🚗',
    description: 'Roads, transit, and traffic data',
    sources: transportationSources
  },
  {
    theme: 'Population',
    icon: '👥',
    description: 'Population density and demographics',
    sources: populationApiSources
  },
  {
    theme: 'Governance',
    icon: '🏛️',
    description: 'Administrative boundaries and election data',
    sources: governanceSources
  },
  {
    theme: 'Land Cover',
    icon: '🌍',
    description: 'Land use and land cover classification',
    sources: landcoverApiSources
  },
  {
    theme: 'Vegetation',
    icon: '🌲',
    description: 'Forest cover, canopy height, and vegetation',
    sources: vegetationApiSources
  },
  {
    theme: 'Hydrology',
    icon: '💧',
    description: 'Rivers, watersheds, and water bodies',
    sources: hydrologySources
  },
  {
    theme: 'Topography',
    icon: '🏔️',
    description: 'Elevation, slope, and terrain data',
    sources: topographyApiSources
  },
  {
    theme: 'Climate',
    icon: '🌡️',
    description: 'Climate data and projections',
    sources: climateSources
  },
  {
    theme: 'Air Quality',
    icon: '💨',
    description: 'Air pollution and environmental monitoring',
    sources: airQualitySources
  },
  {
    theme: 'Socioeconomic',
    icon: '📊',
    description: 'Economic and development indicators',
    sources: socioeconomicSources
  },
  {
    theme: 'Hazards',
    icon: '⚠️',
    description: 'Natural disaster risk and events',
    sources: hazardSources
  },
  {
    theme: 'Biodiversity',
    icon: '🦋',
    description: 'Species occurrences and conservation',
    sources: biodiversitySources
  },
  {
    theme: 'Agriculture',
    icon: '🌾',
    description: 'Crop data and agricultural statistics',
    sources: agricultureSources
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSourcesForType(type: 'elevation' | 'population' | 'landcover' | 'tree-canopy' | 'additional'): Record<string, TileSource> {
  switch (type) {
    case 'elevation':
      return elevationSources;
    case 'population':
      return populationSources;
    case 'landcover':
      return landcoverSources;
    case 'tree-canopy':
      return treeCanopySources;
    case 'additional':
      return additionalSources;
    default:
      return {};
  }
}

export function getSourceById(id: string): TileSource | null {
  const allSources = {
    ...elevationSources,
    ...populationSources,
    ...landcoverSources,
    ...treeCanopySources,
    ...additionalSources
  };
  return allSources[id] || null;
}

export const recommendedSources = {
  elevation: 'aws-terrain',
  population: 'ghsl-population',
  landcover: 'esri-landcover',
  treeCanopy: 'gfw-treecover-2000'
} as const;

export const fallbackSources = {
  elevation: 'aws-terrain',
  population: 'worldpop',
  landcover: 'esa-worldcover',
  treeCanopy: 'gfw-loss'
} as const;

export const dataColorRamps = {
  population: {
    stops: [
      [0, 'rgba(255,255,255,0)'],
      [1, '#ffffb2'],
      [10, '#fecc5c'],
      [50, '#fd8d3c'],
      [100, '#f03b20'],
      [500, '#bd0026'],
      [1000, '#7a0177']
    ] as [number, string][],
    label: 'Population Density (per km²)'
  },
  landcover: {
    classes: {
      10: { color: '#006400', label: 'Trees' },
      20: { color: '#ffbb22', label: 'Shrubland' },
      30: { color: '#ffff4c', label: 'Grassland' },
      40: { color: '#f096ff', label: 'Cropland' },
      50: { color: '#fa0000', label: 'Built-up' },
      60: { color: '#b4b4b4', label: 'Bare/Sparse' },
      70: { color: '#f0f0f0', label: 'Snow/Ice' },
      80: { color: '#0064c8', label: 'Water' },
      90: { color: '#0096a0', label: 'Wetland' },
      95: { color: '#00cf75', label: 'Mangroves' },
      100: { color: '#fae6a0', label: 'Moss/Lichen' }
    }
  },
  treeCanopy: {
    stops: [
      [0, 'rgba(255,255,255,0)'],
      [10, '#d4f0d4'],
      [25, '#93d893'],
      [50, '#4db84d'],
      [75, '#228b22'],
      [100, '#006400']
    ] as [number, string][],
    label: 'Tree Canopy Cover (%)'
  },
  elevation: {
    stops: [
      [0, '#1a5c1a'],
      [200, '#4db84d'],
      [500, '#f5deb3'],
      [1000, '#cd853f'],
      [2000, '#8b4513'],
      [3000, '#ffffff']
    ] as [number, string][],
    label: 'Elevation (meters)'
  }
};
