import React, { useState } from 'react';
import { Terminal, Plus, Search, Edit3, Trash2, Clock, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const ProblemsTab = ({ problems = [], courses = [], onCreateProblem, onEditProblem, onDeleteProblem }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.statement && p.statement.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6">
      
      {/* Control Bar */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems by title or algorithm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161924] pl-9 pr-3 py-2 rounded-xl border border-[#262B3D] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#161924] px-3 py-2 rounded-xl border border-[#262B3D] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button
          onClick={onCreateProblem}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition self-end sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Problem</span>
        </button>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
          <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No coding challenges found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add your first algorithmic problem and sandbox test cases to start practicing.
          </p>
          <button
            onClick={onCreateProblem}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Problem Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProblems.map((p, idx) => {
            const isExpanded = expandedId === p.id;
            const courseObj = courses.find((c) => c.id === p.course_id);
            const sampleCases = (p.test_cases || []).filter((tc) => !tc.is_hidden);
            const hiddenCases = (p.test_cases || []).filter((tc) => tc.is_hidden);

            return (
              <div
                key={p.id}
                className="clean-card bg-[#11141E] border border-[#222634] rounded-2xl p-4 sm:p-5 hover:border-[#383E54] transition space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#161924] text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          p.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' :
                          p.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' :
                          'text-rose-400 bg-rose-500/10'
                        }`}>
                          {p.difficulty || 'Easy'}
                        </span>
                        {courseObj && (
                          <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {courseObj.title}
                          </span>
                        )}
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.time_limit_sec || 2.0}s Limit
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {p.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#161924] text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Test Cases'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onEditProblem(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-[#222634] transition"
                      title="Edit Problem"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteProblem(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-[#222634] transition"
                      title="Delete Problem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Statement & Test Cases */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#1E2230] space-y-3 text-xs">
                    
                    {p.statement && (
                      <div className="p-3 rounded-xl bg-[#161924] border border-[#252A3B] text-slate-300">
                        <span className="text-slate-400 font-bold block mb-1">Problem Statement:</span>
                        <p className="whitespace-pre-wrap font-sans text-xs">{p.statement}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sample Cases */}
                      <div className="p-3 rounded-xl bg-[#141724] border border-[#232738] space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                          Public Test Cases ({sampleCases.length})
                        </span>
                        {sampleCases.length === 0 ? (
                          <span className="text-slate-500 italic text-[11px]">No sample cases added.</span>
                        ) : (
                          sampleCases.map((tc, tcIdx) => (
                            <div key={tcIdx} className="font-mono text-[11px] space-y-1 bg-[#0E1017] p-2 rounded-lg">
                              <div><span className="text-slate-500">In:</span> <span className="text-slate-200">{tc.input_data}</span></div>
                              <div><span className="text-slate-500">Out:</span> <span className="text-emerald-400">{tc.expected_output}</span></div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Hidden Cases */}
                      <div className="p-3 rounded-xl bg-[#141724] border border-amber-500/20 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          Hidden Benchmark Cases ({hiddenCases.length})
                        </span>
                        {hiddenCases.length === 0 ? (
                          <span className="text-slate-500 italic text-[11px]">No hidden test cases configured.</span>
                        ) : (
                          hiddenCases.map((tc, tcIdx) => (
                            <div key={tcIdx} className="font-mono text-[11px] space-y-1 bg-[#0E1017] p-2 rounded-lg">
                              <div><span className="text-slate-500">In:</span> <span className="text-slate-200">{tc.input_data}</span></div>
                              <div><span className="text-slate-500">Out:</span> <span className="text-emerald-400">{tc.expected_output}</span></div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
