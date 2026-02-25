import { NextRequest, NextResponse } from 'next/server';

/**
 * Tile Proxy API Route
 *
 * Proxies tile requests to various data sources, handling CORS and caching.
 * This allows the frontend to access tiles from services that don't support CORS.
 *
 * Usage: /api/tiles?source=ghsl&z=10&x=512&y=512
 */

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

// Data source configurations with actual tile URLs
const tileSources: Record<string, {
  urlTemplate: string;
  headers?: Record<string, string>;
  maxAge: number;
  useBbox?: boolean; // For ArcGIS exportImage endpoints
}> = {
  // Global Human Settlement Layer Population
  ghsl: {
    urlTemplate: 'https://ghsl.jrc.ec.europa.eu/ghs_pop_mt_r2023a/V1-0-1/tiles/{z}/{x}/{y}.png',
    maxAge: 86400 // 24 hours
  },

  // ESA WorldCover via Planetary Computer
  worldcover: {
    urlTemplate: 'https://planetarycomputer.microsoft.com/api/data/v1/mosaic/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?collection=esa-worldcover&assets=map',
    maxAge: 86400
  },

  // WorldPop Population Density (legacy tiles)
  worldpop: {
    urlTemplate: 'https://data.worldpop.org/GIS/Population/Global_2020_Constrained/maxar_v1/tiles/{z}/{x}/{y}.png',
    maxAge: 86400
  },

  // WorldPop ArcGIS ImageServer - 100m resolution
  // Uses exportImage endpoint with bbox for tile generation
  'worldpop-arcgis': {
    urlTemplate: 'https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_100m/ImageServer/exportImage?bbox={bbox}&bboxSR=3857&imageSR=3857&size=256,256&format=png&f=image&renderingRule={"rasterFunction":"Colormap","rasterFunctionArguments":{"Colormap":[[0,255,255,255,0],[1,255,255,178,255],[50,254,204,92,255],[100,253,141,60,255],[200,240,59,32,255],[500,189,0,38,255]]}}',
    maxAge: 86400,
    useBbox: true
  },

  // SEDAC GPWv4 Population
  sedac: {
    urlTemplate: 'https://sedac.ciesin.columbia.edu/geoserver/gwc/service/wmts?layer=gpw-v4:gpw-v4-population-density-rev11_2020&style=&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}',
    maxAge: 86400
  },

  // Copernicus Land Cover
  copernicus: {
    urlTemplate: 'https://lcviewer.vito.be/wmts?layer=clms_europe_landuse&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}',
    maxAge: 86400
  },

  // Meta-WRI Canopy Height (would need GEE proxy - using fallback)
  'canopy-height': {
    urlTemplate: 'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/tree_cover_2000/{z}/{x}/{y}.png',
    maxAge: 86400
  },

  // GLAD Tree Cover Height
  'glad-height': {
    urlTemplate: 'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/tree_cover_2000/{z}/{x}/{y}.png',
    maxAge: 86400
  },

  // Global Forest Watch Tree Cover 2000
  'gfw-treecover': {
    urlTemplate: 'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/tree_cover_2000/{z}/{x}/{y}.png',
    maxAge: 86400
  },

  // Global Forest Watch Tree Cover Loss
  'gfw-loss': {
    urlTemplate: 'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.10/loss_year/{z}/{x}/{y}.png',
    maxAge: 86400
  },

  // ESRI Land Cover 2022
  'esri-landcover': {
    urlTemplate: 'https://lulctimeseries.blob.core.windows.net/lulctimeseriesv003/lc2022/{z}/{x}/{y}.png',
    maxAge: 86400
  },

  // Stadia Stamen Terrain
  'stamen-terrain': {
    urlTemplate: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
    maxAge: 3600 // 1 hour
  }
};

// Alternative tile sources for fallback
const fallbackSources: Record<string, string> = {
  ghsl: 'esri-landcover',
  worldcover: 'esri-landcover',
  worldpop: 'gfw-treecover',
  'canopy-height': 'gfw-treecover',
  'glad-height': 'gfw-treecover'
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get('source') || 'gfw-treecover';
  const z = searchParams.get('z');
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  // Validate parameters
  if (!z || !x || !y) {
    return NextResponse.json(
      { error: 'Missing required parameters: z, x, y' },
      { status: 400 }
    );
  }

  const sourceConfig = tileSources[source];
  if (!sourceConfig) {
    return NextResponse.json(
      { error: `Unknown tile source: ${source}` },
      { status: 400 }
    );
  }

  // Build the tile URL
  let tileUrl = sourceConfig.urlTemplate
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  // Handle bbox replacement for ArcGIS exportImage endpoints
  if (sourceConfig.useBbox) {
    const bbox = tileToBBox(parseInt(z), parseInt(x), parseInt(y));
    tileUrl = tileUrl.replace('{bbox}', bbox);
  }

  try {
    // Fetch the tile with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'BeautifulMaps/1.0 (https://beautifulmaps.app)',
        'Accept': 'image/png,image/jpeg,image/*',
        ...sourceConfig.headers
      },
      signal: controller.signal,
      next: { revalidate: sourceConfig.maxAge }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try fallback source if available
      const fallbackSource = fallbackSources[source];
      if (fallbackSource && tileSources[fallbackSource]) {
        const fallbackConfig = tileSources[fallbackSource];
        const fallbackUrl = fallbackConfig.urlTemplate
          .replace('{z}', z)
          .replace('{x}', x)
          .replace('{y}', y);

        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'BeautifulMaps/1.0',
            'Accept': 'image/png,image/jpeg,image/*'
          }
        });

        if (fallbackResponse.ok) {
          const buffer = await fallbackResponse.arrayBuffer();
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': fallbackResponse.headers.get('Content-Type') || 'image/png',
              'Cache-Control': `public, max-age=${fallbackConfig.maxAge}`,
              'Access-Control-Allow-Origin': '*',
              'X-Data-Source': fallbackSource,
              'X-Fallback': 'true'
            }
          });
        }
      }

      // Return transparent tile if no fallback works
      return createTransparentTile(source);
    }

    // Return the proxied tile
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/png';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${sourceConfig.maxAge}`,
        'Access-Control-Allow-Origin': '*',
        'X-Data-Source': source
      }
    });
  } catch (error) {
    console.error(`Tile fetch error for ${source}:`, error);

    // Return transparent tile on error
    return createTransparentTile(source);
  }
}

/**
 * Creates a transparent 256x256 PNG tile for error cases
 */
function createTransparentTile(source: string): NextResponse {
  // 1x1 transparent PNG, base64 encoded
  // In production, this would be a proper 256x256 transparent tile
  const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  return new NextResponse(transparentPng, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60', // Short cache for error tiles
      'Access-Control-Allow-Origin': '*',
      'X-Data-Source': source,
      'X-Tile-Status': 'empty'
    }
  });
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
