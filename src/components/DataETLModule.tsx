import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Server, 
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { ETLJobRecord } from '../types';

interface DataETLModuleProps {
  onDataIngested?: (recordsCount: number) => void;
}

export const DataETLModule: React.FC<DataETLModuleProps> = () => {
  const [dragOver, setDragOver] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'geojson' | 'postgis'>('csv');

  const sampleCsvContent = `StoreName,Brand,Address,City,State,ZipCode,Latitude,Longitude,Pumps,AADT,AnnualGallons
Katy Travel Plaza,Buc-ee's,27700 Katy Fwy,Katy,TX,77494,29.784,-95.823,120,185000,12500000
Grand Parkway Store,QuikTrip,12400 Grand Pkwy,Cypress,TX,77433,29.982,-95.772,16,68000,3200000`;

  const handleSimulatedUpload = () => {
    setIngestionStatus('processing');
    setIngestionLogs([
      'Parsing input stream (2 records identified)...',
      'Validating EPSG:4326 geospatial coordinates (US CONUS bbox lat 24-50, lng -125 to -66)...',
      'Verifying required fields: StoreName, Brand, Latitude, Longitude, AADT...',
      'Deduplicating against existing 12,450 store records in PostGIS spatial index...',
      'Enriching with US Census Bureau ACS 5-Yr Tract Demographics...',
      'Calculating spatial buffers (1-mi, 3-mi, 5-mi) and drive-time isochrones...',
      'Ingestion job ETL-2026-09-883 completed successfully in 340ms.'
    ]);
    setTimeout(() => {
      setIngestionStatus('success');
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              Module K: Ingestion & Spatial ETL
            </span>
            <span className="text-xs text-slate-400 font-mono">EPSG:4326 PostGIS Pipeline</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Data Ingestion & Automated Geocoding Pipeline
          </h2>
          <p className="text-xs text-slate-300">
            Upload custom location catalogs, competitor footprints, or traffic datasets with automated validation and spatial enrichment.
          </p>
        </div>
      </div>

      {/* Upload Drag-and-Drop Area & Format Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleSimulatedUpload(); }}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer ${
              dragOver
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
            }`}
            onClick={handleSimulatedUpload}
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Drag & drop dataset files or click to browse</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Supports CSV, GeoJSON, Zipped Shapefiles (.shp), Excel (.xlsx), and PostGIS SQL dumps.
              </p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
              Max file size: 250MB per batch
            </span>
          </div>

          {/* ETL Execution Terminal Logs */}
          {ingestionStatus !== 'idle' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  Spatial ETL Execution Logs
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {ingestionStatus === 'processing' ? 'Processing...' : 'Complete: 2/2 Valid'}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                {ingestionLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-cyan-500">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pre-Configured Schema Template Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Schema Requirements
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Template
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Expected CSV columns for automated geocoding and traffic estimation.
            </p>

            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap">
              {sampleCsvContent}
            </pre>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs text-slate-300">
            <div className="font-semibold text-white">Automated Pipeline Features</div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Automatic bounding box check (US CONUS)</li>
              <li>• Missing AADT estimated from FHWA road class</li>
              <li>• Spatial clustering against sister locations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
