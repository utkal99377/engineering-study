import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  FileQuestion, 
  Terminal, 
  FolderPlus,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const AdminHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  onQuickAction, 
  onSyncSupabase, 
  syncingSupa 
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <div className="clean-panel bg-[#10121A] border border-[#202431] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Title & Dynamic Breadcrumb */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="text-indigo-400 font-semibold">Admin Panel</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className={idx === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-slate-400'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        
        {/* Supabase Status Button */}
        <button
          onClick={onSyncSupabase}
          disabled={syncingSupa}
          className="px-3.5 py-2 rounded-xl bg-[#151822] hover:bg-[#1C202E] text-emerald-400 border border-emerald-500/20 text-xs font-semibold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          title="Verify Supabase Cloud PostgreSQL records"
        >
          <Database className={`w-3.5 h-3.5 ${syncingSupa ? 'animate-spin' : ''}`} />
          <span>{syncingSupa ? 'Checking Supabase...' : 'Supabase Live'}</span>
        </button>

        {/* Global Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New...</span>
          </button>

          {showQuickMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowQuickMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-[#161924] border border-[#2B3042] rounded-xl shadow-2xl py-1.5 z-40 text-xs text-slate-300">
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('course'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#202536] hover:text-white flex items-center gap-2 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New Course</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('subject'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#202536] hover:text-white flex items-center gap-2 transition"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New Subject</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('question'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#202536] hover:text-white flex items-center gap-2 transition"
                >
                  <FileQuestion className="w-3.5 h-3.5 text-amber-400" />
                  <span>New MCQ Question</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('problem'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#202536] hover:text-white flex items-center gap-2 transition"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Coding Problem</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
