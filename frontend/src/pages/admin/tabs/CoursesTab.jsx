import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  Video, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Filter
} from 'lucide-react';

export const CoursesTab = ({ 
  courses = [], 
  subjects = [], 
  onCreateCourse, 
  onEditCourse, 
  onDeleteCourse, 
  onOpenCurriculum,
  onManageSubjects 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.short_description && c.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || c.subject_id === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      
      {/* Control Bar: Filters, Search & Create Action */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search & Subject Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search courses by title, tags, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161924] pl-9 pr-3 py-2 rounded-xl border border-[#262B3D] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#161924] px-3 py-2 rounded-xl border border-[#262B3D] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Subjects ({courses.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onManageSubjects}
            className="px-3.5 py-2 rounded-xl bg-[#161924] hover:bg-[#1E2230] text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>Disciplines ({subjects.length})</span>
          </button>

          <button
            onClick={onCreateCourse}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
        </div>

      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No courses match your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, clear the subject filter, or publish a new course track.
          </p>
          <button
            onClick={onCreateCourse}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="clean-card bg-[#11141E] border border-[#222634] rounded-2xl p-4 sm:p-5 hover:border-[#383E54] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Course Info */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={c.thumbnail || 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80'}
                  alt={c.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-800 shrink-0 border border-[#252A3B] shadow"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {c.subject_name || 'Engineering'}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                      c.access_type === 'free' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {c.access_type} Pass
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {c.level}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white truncate">
                    {c.title}
                  </h4>

                  <p className="text-xs text-slate-400 truncate max-w-xl">
                    {c.short_description || 'Engineering curriculum syllabus and interactive lecture notes.'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                    <span>{c.duration_hours || 10} hours</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{c.lectures_count || 0} lectures uploaded</span>
                  </div>
                </div>
              </div>

              {/* Actions & Curriculum Studio Launcher */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={() => onOpenCurriculum(c)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Curriculum Studio</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <button
                  onClick={() => onEditCourse(c)}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-[#222634] transition"
                  title="Edit Course Settings"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteCourse(c.id, c.title)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-[#222634] transition"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
