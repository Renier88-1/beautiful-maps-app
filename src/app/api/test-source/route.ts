import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Source API Route
 *
 * Tests if a data source is accessible and returns status information.
 * Supports raster tiles, vector PMTiles, and API endpoints.
 */

interface TestResult {
  sourceId: string;
  status: 'success' | 'error' | 'partial';
  statusCode?: number;
  responseTime: number;
  contentType?: string;
  contentLength?: number;
  headers?: Record<string, string>;
  error?: string;
  tileUrl?: string;
}

// Sample tile coordinates for testing (zoom 10, centered roughly on Africa/Europe)
const TEST_TILE = { z: 10, x: 512, y: 512 };

// Helper to convert tile coords to Web Mercator bbox
function tileToBBox(z: number, x: number, y: number): string {
  const n = Math.pow(2, z);
  const tileSize = 20037508.34 * 2 / n;
  const minX = -20037508.34 + x * tileSize;
  const maxX = minX + tileSize;
  const maxY = 20037508.34 - y * tileSize;
  const minY = maxY - tileSize;
  return `${minX},${minY},${maxX},${maxY}`;
}

// Source configurations for testing
const testConfigs: Record<string, {
  url: string;
  type: 'raster' | 'vector' | 'api';
  isPMTiles?: boolean;
}> = {
  // ============================================================================
  // ELEVATION SOURCES
  // ============================================================================
  'aws-terrain': {
    url: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${TEST_TILE.z}/${TEST_TILE.x}/${TEST_TILE.y}.png`,
    type: 'raster'
  },

  // ============================================================================
  // POPULATION SOURCES
  // ============================================================================
  'ghsl-population': {
    url: `https://ghsl.jrc.ec.europa.eu/ghs_pop_mt_r2023a/V1-0-1/tiles/${TEST_TILE.z}/${TEST_TILE.x}/${TEST_TILE.y}.png`,
    type: 'raster'
  },
  'worldpop-arcgis': {
    url: `https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_100m/ImageServer/exportImage?bbox=${tileToBBox(TEST_TILE.z, TEST_TILE.x, TEST_TILE.y)}&bboxSR=3857&imageSR=3857&size=256,256&format=png&f=image`,
    type: 'raster'
  },
  'worldpop-stac': {
    url: 'https://stac.worldpop.org/',
    type: 'api'
  },
  'worldpop-rest': {
    url: 'https://www.worldpop.org/rest/data',
    type: 'api'
  },
  'wazimap-ng': {
    url: 'https://wazimap-ng.openup.org.za/api/v1/',
    type: 'api'
  },

  // ============================================================================
  // LAND COVER SOURCES
  // ============================================================================
  'esri-landcover': {
    url: `https://lulctimeseries.blob.core.windows.net/lulctimeseriesv003/lc2022/${TEST_TILE.z}/${TEST_TILE.x}/${TEST_TILE.y}.png`,
    type: 'raster'
  },
  'esa-worldcover': {
    url: 'https://planetarycomputer.microsoft.com/dataset/esa-worldcover',
    type: 'api'
  },
  'modis-lc': {
    url: 'https://lpdaac.usgs.gov/products/mcd12q1v061/',
    type: 'api'
  },

  // ============================================================================
  // TREE CANOPY & FOREST SOURCES
  // ============================================================================
  'gfw-treecover-2000': {
    url: `https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/tree_cover_2000/${TEST_TILE.z}/${TEST_TILE.x}/${TEST_TILE.y}.png`,
    type: 'raster'
  },
  'gfw-loss': {
    url: `https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/loss_year/${TEST_TILE.z}/${TEST_TILE.x}/${TEST_TILE.y}.png`,
    type: 'raster'
  },
  'gfw-api': {
    url: 'https://data-api.globalforestwatch.org/',
    type: 'api'
  },
  'meta-canopy': {
    url: 'https://developers.google.com/earth-engine/datasets/catalog/META_Trees_Height_V1',
    type: 'api'
  },

  // ============================================================================
  // BUILDINGS SOURCES (PMTiles)
  // ============================================================================
  'overture-buildings': {
    url: 'https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/buildings.pmtiles',
    type: 'vector',
    isPMTiles: true
  },
  'google-ms-buildings': {
    url: 'https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/go_ms_building_footprints.pmtiles',
    type: 'vector',
    isPMTiles: true
  },
  'source-coop-buildings': {
    url: 'https://data.source.coop/cholmes/overture/overture-buildings.pmtiles',
    type: 'vector',
    isPMTiles: true
  },
  'google-buildings': {
    url: 'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_Research_open-buildings_v3_polygons',
    type: 'api'
  },
  'osm-buildings': {
    url: 'https://overpass-api.de/api/interpreter',
    type: 'api'
  },

  // ============================================================================
  // OSM VECTOR SOURCES
  // ============================================================================
  'protomaps-basemap': {
    url: 'https://build.protomaps.com/20250115.pmtiles',
    type: 'vector',
    isPMTiles: true
  },
  'overture-transportation': {
    url: 'https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/transportation.pmtiles',
    type: 'vector',
    isPMTiles: true
  },
  'overture-places': {
    url: 'https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/places.pmtiles',
    type: 'vector',
    isPMTiles: true
  },

  // ============================================================================
  // ADDRESSES
  // ============================================================================
  'openaddresses': {
    url: 'https://batch.openaddresses.io',
    type: 'api'
  },

  // ============================================================================
  // TRANSPORTATION
  // ============================================================================
  'osm-transport': {
    url: 'https://overpass-api.de/api/interpreter',
    type: 'api'
  },
  'overture-transport': {
    url: 'https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-10-22/transportation.pmtiles',
    type: 'vector',
    isPMTiles: true
  },
  'transitland': {
    url: 'https://www.transit.land/api/v2/rest',
    type: 'api'
  },
  'tomtom-traffic': {
    url: 'https://api.tomtom.com/traffic/services',
    type: 'api'
  },

  // ============================================================================
  // GOVERNANCE & BOUNDARIES
  // ============================================================================
  'mdb-sa': {
    url: 'https://dataportal-mdb-sa.opendata.arcgis.com/datasets',
    type: 'api'
  },
  'gadm': {
    url: 'https://gadm.org/download_world.html',
    type: 'api'
  },
  'iec-elections': {
    url: 'https://api.elections.org.za/',
    type: 'api'
  },

  // ============================================================================
  // HYDROLOGY
  // ============================================================================
  'hydrosheds': {
    url: 'https://www.hydrosheds.org/hydrosheds-core-downloads',
    type: 'api'
  },
  'osm-waterways': {
    url: 'https://overpass-api.de/api/interpreter',
    type: 'api'
  },

  // ============================================================================
  // TOPOGRAPHY
  // ============================================================================
  'copernicus-dem': {
    url: 'https://planetarycomputer.microsoft.com/dataset/copernicus-dem-glo-30',
    type: 'api'
  },
  'opentopography': {
    url: 'https://portal.opentopography.org/apidocs',
    type: 'api'
  },
  'opentopodata': {
    url: 'https://api.opentopodata.org',
    type: 'api'
  },

  // ============================================================================
  // CLIMATE
  // ============================================================================
  'copernicus-era5': {
    url: 'https://cds.climate.copernicus.eu/api/v2',
    type: 'api'
  },
  'iri-ldeo': {
    url: 'http://iridl.ldeo.columbia.edu/opendap',
    type: 'api'
  },

  // ============================================================================
  // AIR QUALITY
  // ============================================================================
  'openaq': {
    url: 'https://api.openaq.org/v2',
    type: 'api'
  },
  'saaqis': {
    url: 'https://saaqis.environment.gov.za/',
    type: 'api'
  },

  // ============================================================================
  // SOCIOECONOMIC
  // ============================================================================
  'worldbank': {
    url: 'https://api.worldbank.org/v2',
    type: 'api'
  },
  'hdx-hapi': {
    url: 'https://hapi.humdata.org/api/v1',
    type: 'api'
  },

  // ============================================================================
  // HAZARDS
  // ============================================================================
  'sedac-hazards': {
    url: 'https://sedac.ciesin.columbia.edu/',
    type: 'api'
  },
  'emdat': {
    url: 'https://hapi.humdata.org/api/v1',
    type: 'api'
  },

  // ============================================================================
  // BIODIVERSITY
  // ============================================================================
  'gbif': {
    url: 'https://api.gbif.org/v1',
    type: 'api'
  },
  'sanbi-bgis': {
    url: 'https://bgisapi.sanbi.org/api',
    type: 'api'
  },

  // ============================================================================
  // AGRICULTURE
  // ============================================================================
  'faostat': {
    url: 'https://fenixservices.fao.org/faostat/api/v1',
    type: 'api'
  },
  'sa-bioenergy': {
    url: 'https://developers.google.com/earth-engine/apidocs',
    type: 'api'
  },

  // ============================================================================
  // ADDITIONAL BASEMAPS
  // ============================================================================
  'natural-earth': {
    url: `https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/${TEST_TILE.z}/${TEST_TILE.y}/${TEST_TILE.x}`,
    type: 'raster'
  },
  'esri-imagery': {
    url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${TEST_TILE.z}/${TEST_TILE.y}/${TEST_TILE.x}`,
    type: 'raster'
  },
  'stamen-terrain': {
    url: `https://tiles.stadiamaps.com/tiles/stamen_terrain/${TEST_TILE.z}/${TEST_TILE.x}/${TEST_TILE.y}.png`,
    type: 'raster'
  },

  // ============================================================================
  // LEGACY API SOURCES
  // ============================================================================
  'worldpop-api': {
    url: 'https://www.worldpop.org/rest/data',
    type: 'api'
  },
  'osm-taginfo': {
    url: 'https://taginfo.openstreetmap.org/api/4/tags/popular?page=1&rp=10',
    type: 'api'
  },
  'geofabrik-sa': {
    url: 'https://download.geofabrik.de/africa/south-africa.html',
    type: 'api'
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sourceId = searchParams.get('source');

  // If no source specified, test all sources
  if (!sourceId) {
    const results: TestResult[] = [];

    for (const [id, config] of Object.entries(testConfigs)) {
      const result = await testSource(id, config);
      results.push(result);
    }

    return NextResponse.json({
      tested: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    });
  }

  // Test specific source
  const config = testConfigs[sourceId];
  if (!config) {
    return NextResponse.json(
      { error: `Unknown source: ${sourceId}` },
      { status: 400 }
    );
  }

  const result = await testSource(sourceId, config);
  return NextResponse.json(result);
}

async function testSource(
  sourceId: string,
  config: { url: string; type: string; isPMTiles?: boolean }
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    // For PMTiles, use HEAD request to check if file exists
    // For raster tiles, use GET with small range to verify
    const method = config.isPMTiles ? 'HEAD' : 'GET';

    const response = await fetch(config.url, {
      method,
      headers: {
        'User-Agent': 'BeautifulMaps/1.0 DataSourceTest',
        'Accept': config.type === 'api' ? 'application/json,text/html,*/*' : 'image/*,application/octet-stream',
        // Request only first 1KB for efficiency
        ...(config.isPMTiles ? { 'Range': 'bytes=0-1023' } : {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    // Extract useful headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (['content-type', 'content-length', 'last-modified', 'etag', 'accept-ranges'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    const contentLength = response.headers.get('content-length');

    return {
      sourceId,
      status: response.ok || response.status === 206 ? 'success' : 'error',
      statusCode: response.status,
      responseTime,
      contentType: response.headers.get('content-type') || undefined,
      contentLength: contentLength ? parseInt(contentLength) : undefined,
      headers,
      tileUrl: config.url
    };
  } catch (error) {
    return {
      sourceId,
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      tileUrl: config.url
    };
  }
}

// Also export POST for triggering specific tests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceIds } = body as { sourceIds?: string[] };

    const idsToTest = sourceIds || Object.keys(testConfigs);
    const results: TestResult[] = [];

    for (const id of idsToTest) {
      const config = testConfigs[id];
      if (config) {
        const result = await testSource(id, config);
        results.push(result);
      }
    }

    return NextResponse.json({
      tested: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
