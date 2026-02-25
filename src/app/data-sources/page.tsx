'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  dataSourceCatalog,
  elevationSources,
  populationSources,
  landcoverSources,
  treeCanopySources,
  buildingSources,
  osmVectorSources,
  additionalSources,
  type ApiSource,
  type TileSource,
  type VectorTileSource
} from '@/lib/dataSources';

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

function StatusBadge({ status, responseTime }: { status: 'success' | 'error' | 'partial' | 'pending' | 'testing'; responseTime?: number }) {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    pending: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    testing: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const labels = {
    success: 'Available',
    error: 'Unavailable',
    partial: 'Partial',
    pending: 'Not Tested',
    testing: 'Testing...'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status === 'testing' && (
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'success' && <span className="text-emerald-500">●</span>}
      {status === 'error' && <span className="text-red-500">●</span>}
      <span>{labels[status]}</span>
      {responseTime !== undefined && status === 'success' && (
        <span className="text-neutral-400 ml-1">{responseTime}ms</span>
      )}
    </div>
  );
}

function ApiSourceCard({
  source,
  testResult,
  onTest
}: {
  source: ApiSource;
  testResult?: TestResult;
  onTest: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-neutral-800 truncate">{source.name}</h4>
            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{source.description}</p>
          </div>
          <StatusBadge
            status={testResult ? testResult.status : 'pending'}
            responseTime={testResult?.responseTime}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
            {source.dataFormat || 'API'}
          </span>
          {source.authRequired && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              Auth Required
            </span>
          )}
          {source.rateLimit && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              Rate Limited
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onTest(source.shortName)}
            disabled={testResult?.status === 'success'}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${testResult?.status === 'success'
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'}
            `}
          >
            {testResult?.status === 'success' ? 'Tested' : 'Test Source'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
          {source.docsUrl && (
            <a
              href={source.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Docs →
            </a>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 p-4 bg-neutral-50 text-xs space-y-2">
          <div>
            <span className="font-medium text-neutral-600">API URL:</span>
            <code className="ml-2 px-2 py-0.5 bg-neutral-200 rounded text-neutral-700 break-all">
              {source.apiUrl}
            </code>
          </div>
          <div>
            <span className="font-medium text-neutral-600">Attribution:</span>
            <span className="ml-2 text-neutral-500">{source.attribution}</span>
          </div>
          {source.notes && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
              <span className="font-medium">Notes:</span> {source.notes}
            </div>
          )}
          {testResult && (
            <>
              {testResult.statusCode && (
                <div>
                  <span className="font-medium text-neutral-600">Status Code:</span>
                  <code className={`ml-2 px-2 py-0.5 rounded ${
                    testResult.statusCode >= 200 && testResult.statusCode < 300
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {testResult.statusCode}
                  </code>
                </div>
              )}
              {testResult.contentType && (
                <div>
                  <span className="font-medium text-neutral-600">Content-Type:</span>
                  <code className="ml-2 px-2 py-0.5 bg-neutral-200 rounded text-neutral-700">
                    {testResult.contentType}
                  </code>
                </div>
              )}
              {testResult.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600">
                  {testResult.error}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TileSourceCard({
  id,
  source,
  testResult,
  onTest
}: {
  id: string;
  source: TileSource | VectorTileSource;
  testResult?: TestResult;
  onTest: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isVector = 'sourceLayer' in source;
  const sourceType = isVector ? 'vector' : (source as TileSource).type;

  const getTileUrl = () => {
    if ('tiles' in source && source.tiles && source.tiles.length > 0) {
      return source.tiles[0].replace('{z}', '10').replace('{x}', '512').replace('{y}', '512');
    }
    if ('url' in source) {
      return (source as VectorTileSource).url.replace('pmtiles://', '');
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-neutral-800 truncate">{source.name}</h4>
            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{source.description}</p>
          </div>
          <StatusBadge
            status={testResult ? testResult.status : 'pending'}
            responseTime={testResult?.responseTime}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`
            px-2 py-0.5 text-xs rounded-full border
            ${sourceType === 'raster' ? 'bg-orange-50 text-orange-600 border-orange-200' :
              sourceType === 'raster-dem' ? 'bg-purple-50 text-purple-600 border-purple-200' :
              sourceType === 'vector' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              'bg-neutral-50 text-neutral-600 border-neutral-200'}
          `}>
            {sourceType}
          </span>
          {'requiresProxy' in source && source.requiresProxy && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              proxy
            </span>
          )}
          {isVector && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              layer: {(source as VectorTileSource).sourceLayer}
            </span>
          )}
          {source.minzoom !== undefined && source.maxzoom !== undefined && (
            <span className="text-xs text-neutral-400">
              z{source.minzoom}-{source.maxzoom}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onTest(id)}
            disabled={testResult?.status === 'success'}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${testResult?.status === 'success'
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'}
            `}
          >
            {testResult?.status === 'success' ? 'Tested' : 'Test Source'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 p-4 bg-neutral-50 text-xs space-y-2">
          <div>
            <span className="font-medium text-neutral-600">Endpoint:</span>
            <code className="ml-2 px-2 py-0.5 bg-neutral-200 rounded text-neutral-700 break-all">
              {getTileUrl()}
            </code>
          </div>
          <div>
            <span className="font-medium text-neutral-600">Attribution:</span>
            <span className="ml-2 text-neutral-500" dangerouslySetInnerHTML={{ __html: source.attribution }} />
          </div>
          {testResult && (
            <>
              {testResult.statusCode && (
                <div>
                  <span className="font-medium text-neutral-600">Status Code:</span>
                  <code className={`ml-2 px-2 py-0.5 rounded ${
                    testResult.statusCode >= 200 && testResult.statusCode < 300
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {testResult.statusCode}
                  </code>
                </div>
              )}
              {testResult.contentType && (
                <div>
                  <span className="font-medium text-neutral-600">Content-Type:</span>
                  <code className="ml-2 px-2 py-0.5 bg-neutral-200 rounded text-neutral-700">
                    {testResult.contentType}
                  </code>
                </div>
              )}
              {testResult.contentLength && (
                <div>
                  <span className="font-medium text-neutral-600">Size:</span>
                  <span className="ml-2 text-neutral-500">
                    {(testResult.contentLength / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
              {testResult.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600">
                  {testResult.error}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Tile sources organized by category for the "Tile Sources" section
const tileSources = {
  elevation: { name: 'Elevation & Terrain', icon: '🏔️', sources: elevationSources },
  population: { name: 'Population Tiles', icon: '👥', sources: populationSources },
  landcover: { name: 'Land Cover Tiles', icon: '🌍', sources: landcoverSources },
  treeCanopy: { name: 'Tree Canopy & Forest', icon: '🌲', sources: treeCanopySources },
  buildings: { name: 'Building Footprints', icon: '🏢', sources: buildingSources },
  osm: { name: 'OSM Vector Tiles', icon: '🗺️', sources: osmVectorSources },
  additional: { name: 'Additional Basemaps', icon: '🖼️', sources: additionalSources }
};

export default function DataSourcesPage() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testProgress, setTestProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<'catalog' | 'tiles'>('catalog');

  const testSource = useCallback(async (sourceId: string) => {
    try {
      const response = await fetch(`/api/test-source?source=${sourceId}`);
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [sourceId]: result }));
      return result;
    } catch (error) {
      const errorResult: TestResult = {
        sourceId,
        status: 'error',
        responseTime: 0,
        error: 'Failed to test source'
      };
      setTestResults(prev => ({ ...prev, [sourceId]: errorResult }));
      return errorResult;
    }
  }, []);

  const testAllSources = useCallback(async () => {
    setIsTestingAll(true);

    // Gather all source IDs from catalog
    const allSourceIds: string[] = [];
    dataSourceCatalog.forEach(category => {
      category.sources.forEach(source => {
        allSourceIds.push(source.shortName);
      });
    });

    // Add tile source IDs
    Object.values(tileSources).forEach(category => {
      Object.keys(category.sources).forEach(id => {
        allSourceIds.push(id);
      });
    });

    setTestProgress({ current: 0, total: allSourceIds.length });

    // Test sources sequentially to avoid overwhelming the API
    for (let i = 0; i < allSourceIds.length; i++) {
      await testSource(allSourceIds[i]);
      setTestProgress({ current: i + 1, total: allSourceIds.length });
    }

    setIsTestingAll(false);
  }, [testSource]);

  // Calculate summary stats
  const catalogSourceCount = dataSourceCatalog.reduce((sum, cat) => sum + cat.sources.length, 0);
  const tileSourceCount = Object.values(tileSources).reduce((sum, cat) => sum + Object.keys(cat.sources).length, 0);
  const totalSources = catalogSourceCount + tileSourceCount;
  const testedCount = Object.keys(testResults).length;
  const successCount = Object.values(testResults).filter(r => r.status === 'success').length;
  const errorCount = Object.values(testResults).filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg">🗺️</span>
              </div>
              <span className="text-lg font-semibold text-neutral-800 hidden sm:block">Beautiful Maps</span>
            </Link>
            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-neutral-100 rounded-lg p-1 border border-neutral-200">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map Types
              </Link>
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Data Sources
              </span>
              <Link
                href="/artwork"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Artwork
              </Link>
            </nav>
          </div>
          <h1 className="text-xl font-bold text-neutral-800">Data Sources Inspector</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Card */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Data Source Health Check</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Comprehensive catalog of geospatial data sources across 15 themes.
              </p>
            </div>
            <button
              onClick={testAllSources}
              disabled={isTestingAll}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${isTestingAll
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow'}
              `}
            >
              {isTestingAll ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-500 rounded-full animate-spin" />
                  Testing {testProgress.current}/{testProgress.total}...
                </span>
              ) : (
                'Test All Sources'
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-neutral-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neutral-800">{dataSourceCatalog.length}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Themes</div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neutral-800">{totalSources}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Total Sources</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{testedCount}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Tested</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{successCount}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Available</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Unavailable</div>
            </div>
          </div>

          {isTestingAll && (
            <div className="mt-4">
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            API Catalog ({catalogSourceCount})
          </button>
          <button
            onClick={() => setActiveTab('tiles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tiles'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            Tile Sources ({tileSourceCount})
          </button>
        </div>

        {activeTab === 'catalog' && (
          <>
            {/* Data Source Catalog by Theme */}
            {dataSourceCatalog.map((category) => (
              <section key={category.theme} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">{category.theme}</h3>
                    <p className="text-sm text-neutral-500">{category.description}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-neutral-400">
                      {category.sources.filter(s => testResults[s.shortName]?.status === 'success').length}/{category.sources.length} available
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.sources.map((source) => (
                    <ApiSourceCard
                      key={source.shortName}
                      source={source}
                      testResult={testResults[source.shortName]}
                      onTest={testSource}
                    />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {activeTab === 'tiles' && (
          <>
            {/* Tile Sources */}
            {Object.entries(tileSources).map(([key, category]) => (
              <section key={key} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">{category.name}</h3>
                    <p className="text-sm text-neutral-500">
                      {Object.keys(category.sources).length} tile source{Object.keys(category.sources).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-neutral-400">
                      {Object.keys(category.sources).filter(id => testResults[id]?.status === 'success').length}/{Object.keys(category.sources).length} available
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(category.sources).map(([id, source]) => (
                    <TileSourceCard
                      key={id}
                      id={id}
                      source={source as TileSource | VectorTileSource}
                      testResult={testResults[id]}
                      onTest={testSource}
                    />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Info Section */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">About Data Sources</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-600">
            <div>
              <h4 className="font-medium text-neutral-700 mb-2">Tile Types</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600 border border-orange-200">raster</span>
                  <span>Image tiles (PNG, WebP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-600 border border-purple-200">raster-dem</span>
                  <span>Elevation data for 3D</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200">vector</span>
                  <span>PMTiles format</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-700 mb-2">API Formats</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">PMTiles</span>
                  <span>Cloud-optimized tiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">COG</span>
                  <span>Cloud-optimized GeoTIFF</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">GeoParquet</span>
                  <span>Columnar geospatial</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-700 mb-2">Source Badges</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 border border-amber-200">Auth Required</span>
                  <span>Needs API key</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-rose-50 text-rose-600 border border-rose-200">Rate Limited</span>
                  <span>Request limits apply</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 border border-amber-200">proxy</span>
                  <span>Via /api/tiles</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
