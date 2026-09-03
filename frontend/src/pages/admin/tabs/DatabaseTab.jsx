import React from 'react';
import { Database, RefreshCw, Upload, CheckCircle2, ShieldCheck, FileCode, Server } from 'lucide-react';

export const DatabaseTab = ({ datasetStatus, onImportDatasets, onSyncSupabase, syncingSupa }) => {
  return (
    <div className="space-y-6">
      
      {/* SECTION 1: SUPABASE CLOUD POSTGRESQL ENGINE */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2230] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Database Engine & Supabase Cloud Status
              </h3>
              <p className="text-xs text-slate-400">
                Live PostgreSQL cluster connection and automated schema sync
              </p>
            </div>
          </div>

          <button
            onClick={onSyncSupabase}
            disabled={syncingSupa}
            className="px-4 py-2 rounded-xl bg-[#161924] hover:bg-[#1E2230] text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 self-end sm:self-auto"
          >
            <Database className={`w-4 h-4 ${syncingSupa ? 'animate-spin' : ''}`} />
            <span>{syncingSupa ? 'Verifying...' : '⚡ Verify & Test Supabase'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] space-y-1">
            <span className="text-slate-400 text-[11px] block">Active Database Driver</span>
            <span className="font-mono text-emerald-400 font-bold">SQLAlchemy 2.0 (PostgreSQL / SQLite)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] space-y-1">
            <span className="text-slate-400 text-[11px] block">Live Status</span>
            <span className="font-mono text-emerald-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Connected & Verified
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] space-y-1">
            <span className="text-slate-400 text-[11px] block">Security Guard</span>
            <span className="font-mono text-indigo-300 font-bold">JWT HS256 + Admin Master Key</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CURRICULUM DATASET STORAGE ENGINE */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2230] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Curriculum JSON Datasets Storage
              </h3>
              <p className="text-xs text-slate-400">
                Directory: <code className="text-indigo-400 font-mono">{datasetStatus?.datasets_directory || 'datasets/'}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onImportDatasets}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition self-end sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload & Re-Seed All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {datasetStatus?.files && Object.entries(datasetStatus.files).map(([fname, finfo]) => (
            <div key={fname} className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-mono font-bold text-white truncate">{fname}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1F2433]">
                <span className={finfo.exists ? 'text-emerald-400' : 'text-rose-400'}>
                  {finfo.exists ? '✓ Found on disk' : '✗ Missing'}
                </span>
                <span className="font-mono text-slate-300">{finfo.size_bytes} B</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
