import React, { useState } from 'react';
import { FolderPlus, Plus, Edit3, Trash2, BookOpen, Search } from 'lucide-react';

export const SubjectsTab = ({ subjects = [], onCreateSubject, onEditSubject, onDeleteSubject }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter((s) => 
    !searchQuery || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Control Bar */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search disciplines & branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161924] pl-9 pr-3 py-2 rounded-xl border border-[#262B3D] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={onCreateSubject}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Discipline / Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
          <FolderPlus className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No disciplines found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add your first engineering discipline to start grouping B.Tech courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              className="clean-card bg-[#11141E] border border-[#222634] rounded-2xl p-5 hover:border-[#383E54] flex flex-col justify-between gap-4 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                    {sub.icon || 'code'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#161924] px-2 py-0.5 rounded">
                    {sub.courses_count || 0} courses linked
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">
                  {sub.name}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {sub.description || 'Engineering branch covering foundational and advanced subjects.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E2230] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                  slug: {sub.slug}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditSubject(sub)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                    title="Edit Subject"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteSubject(sub.id, sub.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
