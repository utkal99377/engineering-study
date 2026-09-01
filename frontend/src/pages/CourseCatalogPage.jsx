import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Crown, 
  Layers, 
  Clock, 
  Sparkles,
  ArrowRight,
  Code2
} from 'lucide-react';
import { api } from '../services/api';

export const CourseCatalogPage = ({ onNavigate, initialSubjectId = null }) => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId || 'all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectsAndCourses();
  }, [selectedSubject, selectedTier, selectedLevel, searchQuery]);

  const loadSubjectsAndCourses = async () => {
    setLoading(true);
    try {
      const [subjData, courseData] = await Promise.all([
        api.getSubjects(),
        api.getCourses({
          subject_id: selectedSubject !== 'all' ? selectedSubject : undefined,
          access_type: selectedTier !== 'all' ? selectedTier : undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          search: searchQuery.trim() || undefined,
        }),
      ]);
      setSubjects(subjData);
      setCourses(courseData);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Catalog Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            B.Tech Course Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic university courses and labs for engineering semesters and campus recruitment
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, DSA, C++, OOP..."
            className="w-full bg-[#111827] pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-800/80 pb-4">
        {/* Subject Filter Pills */}
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedSubject === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Subjects
        </button>

        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedSubject === sub.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{sub.name}</span>
          </button>
        ))}

        {/* Tier Selector */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
          >
            <option value="all">All Access</option>
            <option value="free">Free Only</option>
            <option value="premium">Pro Premium Only</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl h-80 animate-pulse bg-slate-800/40"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Courses Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onNavigate('course-detail', course.id)}
              className="glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 right-3">
                  {course.access_type === 'free' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow">
                      Free Course
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro Access
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-white/10">
                    {course.level}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-indigo-300 border border-white/10">
                    {course.subject_name}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {course.short_description || course.description}
                  </p>
                </div>

                {/* Progress if user started */}
                {course.user_progress_percentage > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Progress</span>
                      <span className="text-indigo-300 font-bold">{course.user_progress_percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${course.user_progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{course.lectures_count || 0} Lectures</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{course.duration_hours} Hours</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
