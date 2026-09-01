import React, { useEffect, useState } from 'react';
import { 
  Terminal, 
  Search, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Cpu, 
  Code2, 
  ArrowRight,
  Filter,
  Sparkles,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';

export const CodingArenaPage = ({ onNavigate }) => {
  const [problems, setProblems] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('problems'); // 'problems' or 'playground'

  useEffect(() => {
    loadProblems();
  }, [difficultyFilter, searchQuery]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const data = await api.getProblems({
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setProblems(data || []);
    } catch (err) {
      console.error('Failed to load coding problems:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>Universal Cloud Compiler • 15+ Languages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Programming Practice & Sandbox Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Compile and run Python, C, C++, Java, JavaScript, TypeScript, Go, Rust, C#, PHP, Swift, Kotlin, and SQL with automated test case evaluation.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#090D16] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('problems')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'problems'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Curated Problems ({problems.length})
          </button>
          <button
            onClick={() => setViewMode('playground')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'playground'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Sandbox IDE</span>
          </button>
        </div>
      </div>

      {/* 1. STANDALONE UNIVERSAL COMPILER PLAYGROUND */}
      {viewMode === 'playground' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Universal Code Sandbox (Live Compiler)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Isolated Cloud Subprocess & Judge0 Engine</span>
          </div>

          <div className="h-[600px]">
            <CodeEditor initialLanguage="python" problem={null} />
          </div>
        </div>
      )}

      {/* 2. CURATED PROBLEMS LIST */}
      {viewMode === 'problems' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    difficultyFilter === diff
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff === 'all' ? 'All Difficulties' : diff}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by problem title..."
                className="w-full bg-slate-900 pl-9 pr-4 py-1.5 rounded-lg border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Problem Cards */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card h-16 rounded-xl animate-pulse bg-slate-800/40"></div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-2xl">
              <Terminal className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">No Problems Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try another search keyword or difficulty filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden">
              {problems.map((prob) => {
                const diffColor =
                  prob.difficulty === 'Easy'
                    ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30'
                    : prob.difficulty === 'Medium'
                    ? 'text-amber-400 bg-amber-950/50 border-amber-500/30'
                    : 'text-rose-400 bg-rose-950/50 border-rose-500/30';

                return (
                  <div
                    key={prob.id}
                    onClick={() => onNavigate('problem-solver', { problemId: prob.id })}
                    className="p-4 hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate hover:text-indigo-300 transition">
                          {prob.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        {prob.tags?.map((tag) => (
                          <span key={tag} className="text-slate-500 font-mono">#{tag}</span>
                        ))}
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          {prob.time_limit_sec}s Limit
                        </span>
                      </div>
                    </div>

                    <button className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1 shrink-0">
                      <span>Solve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
