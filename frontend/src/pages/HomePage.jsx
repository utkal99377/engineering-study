import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HomePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [problems, setProblems] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [coursesData, problemsData, questionsData] = await Promise.all([
        api.getCourses({ limit: 6 }).catch(() => []),
        api.getProblems({ limit: 6 }).catch(() => []),
        api.getQuestions({ limit: 6 }).catch(() => []),
      ]);
      setCourses(coursesData || []);
      setProblems(problemsData || []);
      setQuestions(questionsData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header matching Screenshot 2 style */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          B.Tech Engineering Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#8E92A4]">
          {user ? `Welcome, ${user.name} • ${user.college_branch || 'CSE'} (${user.semester || '3rd Sem'})` : 'Access semester courses, theory MCQs and live code sandbox'}
        </p>
      </div>

      {/* 2-Column Minimal Cards Section (matching Screenshot 2 input/output layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Quick Access Modules */}
        <div className="lg:col-span-5 bg-[#121318] border border-[#232630] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Modules & Practice</h2>
          
          <div className="space-y-2.5">
            <div 
              onClick={() => onNavigate('courses')}
              className="p-3.5 bg-[#15171F] hover:bg-[#1A1D27] border border-[#232630] rounded-lg cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium text-white">Curriculum Courses</div>
                <div className="text-[11px] text-[#8E92A4]">8 Semesters & syllabus video lectures</div>
              </div>
              <span className="text-xs text-[#8E92A4]">→</span>
            </div>

            <div 
              onClick={() => onNavigate('coding')}
              className="p-3.5 bg-[#15171F] hover:bg-[#1A1D27] border border-[#232630] rounded-lg cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium text-white">Code Sandbox Arena</div>
                <div className="text-[11px] text-[#8E92A4]">Python, C, C++, Java & JS live execution</div>
              </div>
              <span className="text-xs text-[#8E92A4]">→</span>
            </div>

            <div 
              onClick={() => onNavigate('theory')}
              className="p-3.5 bg-[#15171F] hover:bg-[#1A1D27] border border-[#232630] rounded-lg cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium text-white">Theory MCQs & Practice</div>
                <div className="text-[11px] text-[#8E92A4]">Mid-sem & end-sem quiz practice</div>
              </div>
              <span className="text-xs text-[#8E92A4]">→</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('coding')}
            className="w-full py-2 bg-[#20232D] hover:bg-[#2B2F3D] border border-[#2E3342] text-xs font-medium text-white rounded-lg transition"
          >
            Launch Code Editor
          </button>
        </div>

        {/* Right Card: Recent Courses & Syllabus Preview */}
        <div className="lg:col-span-7 bg-[#121318] border border-[#232630] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Featured Courses</h2>
            <button 
              onClick={() => onNavigate('courses')}
              className="text-xs text-[#8E92A4] hover:text-white transition"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#6B7280]">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280]">No courses found.</div>
          ) : (
            <div className="space-y-2">
              {courses.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('courses')}
                  className="p-3 bg-[#15171F] hover:bg-[#1A1D27] border border-[#232630] rounded-lg cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium text-white">{c.title}</div>
                    <div className="text-[10px] text-[#8E92A4]">{c.subject_name || 'B.Tech CSE'} • {c.duration_hours || '40'} hrs</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E212A] text-[#9CA3AF] font-mono">
                    {(c.access_type || 'free').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Coding Arena Quick Challenge Section */}
      <div className="bg-[#121318] border border-[#232630] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Coding Arena Challenges</h2>
            <p className="text-[11px] text-[#8E92A4]">Test your algorithmic skills with instant execution feedback</p>
          </div>
          <button 
            onClick={() => onNavigate('coding')}
            className="text-xs text-[#8E92A4] hover:text-white transition"
          >
            Open Arena →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {problems.slice(0, 3).map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigate('coding')}
              className="p-3.5 bg-[#15171F] hover:bg-[#1A1D27] border border-[#232630] rounded-lg cursor-pointer transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white line-clamp-1">{p.title}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  p.difficulty === 'Hard' ? 'bg-red-950/60 text-red-400' : p.difficulty === 'Medium' ? 'bg-amber-950/60 text-amber-400' : 'bg-emerald-950/60 text-emerald-400'
                }`}>
                  {p.difficulty || 'Easy'}
                </span>
              </div>
              <p className="text-[11px] text-[#8E92A4] line-clamp-2">
                {p.description || 'Solve algorithmic challenges in the multi-language sandbox.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center text-[11px] text-[#525769] pt-4">
        B.Tech Learning Platform • Data-Driven Engineering Curriculum • Isolated Code Sandbox
      </div>

    </div>
  );
};
