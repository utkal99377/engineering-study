import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Code2, 
  HelpCircle, 
  ArrowRight, 
  Play, 
  Sparkles, 
  Clock, 
  GraduationCap,
  Layers,
  CheckCircle2,
  Terminal
} from 'lucide-react';

export const HomePage = ({ onNavigate, onOpenSubscribe }) => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Engineer';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E212A]/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            {getGreeting()}, {firstName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-[#8E92A4] mt-1">
            What would you like to learn or practice today?
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 self-start md:self-auto bg-[#13151D] border border-[#232735] px-3.5 py-1.5 rounded-full text-xs text-[#9CA3AF]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-white">{user.college_branch || 'B.Tech CSE'}</span>
            <span className="text-[#4B5267]">•</span>
            <span>{user.semester || 'Semester 3'}</span>
          </div>
        )}
      </div>

      {/* 2. Three Primary Quick-Action Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1: Courses */}
        <div 
          onClick={() => onNavigate('courses')}
          className="group relative bg-[#12141C] hover:bg-[#161924] border border-[#222634] hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                Curriculum Courses
              </h3>
              <p className="text-xs text-[#8E92A4] mt-1 leading-relaxed">
                Watch video lectures, read notes, and follow semester syllabus step-by-step.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300 gap-1.5">
            <span>Browse Courses</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Code Playground */}
        <div 
          onClick={() => onNavigate('coding')}
          className="group relative bg-[#12141C] hover:bg-[#161924] border border-[#222634] hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition">
                Code Sandbox & Arena
              </h3>
              <p className="text-xs text-[#8E92A4] mt-1 leading-relaxed">
                Write, test, and run code in Python, C, C++, Java, and JavaScript with instant output.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs font-medium text-emerald-400 group-hover:text-emerald-300 gap-1.5">
            <span>Open Code Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: MCQs & Practice */}
        <div 
          onClick={() => onNavigate('theory')}
          className="group relative bg-[#12141C] hover:bg-[#161924] border border-[#222634] hover:border-amber-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition">
                Theory & MCQs
              </h3>
              <p className="text-xs text-[#8E92A4] mt-1 leading-relaxed">
                Test your concepts with university mid-term & end-term exam practice questions.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs font-medium text-amber-400 group-hover:text-amber-300 gap-1.5">
            <span>Practice Questions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. Featured Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Featured Courses
            </h2>
            <p className="text-xs text-[#8E92A4]">
              Handpicked subject modules for your engineering curriculum
            </p>
          </div>
          <button 
            onClick={() => onNavigate('courses')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
          >
            <span>View all courses</span>
            <span>→</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-xl bg-[#12141C] border border-[#222634] animate-pulse"></div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280] bg-[#12141C] rounded-2xl border border-[#222634] space-y-2">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No courses available yet.</p>
            <p className="text-[11px] text-slate-500">Courses published in the Admin Panel will dynamically appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 6).map((c) => {
              const isFree = (c.access_type || 'free').toLowerCase() === 'free';
              return (
                <div
                  key={c.id}
                  onClick={() => onNavigate('course-detail', c.id)}
                  className="group bg-[#12141C] hover:bg-[#161924] border border-[#222634] hover:border-indigo-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                    <img 
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80'} 
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-transparent to-black/30"></div>
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                        isFree 
                          ? 'bg-emerald-500/90 text-white' 
                          : 'bg-amber-500/90 text-slate-950 font-extrabold'
                      }`}>
                        {isFree ? 'Free' : 'Pro Pass'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-[10px] font-mono font-medium text-indigo-200 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                        {c.subject_name || 'B.Tech'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
                        {c.title}
                      </h4>
                      {c.short_description && (
                        <p className="text-xs text-[#8E92A4] mt-1.5 line-clamp-2 leading-relaxed">
                          {c.short_description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1C1F2B] flex items-center justify-between text-xs text-[#8E92A4]">
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{c.lectures_count || 0} lecs</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.duration_hours || 10}h</span>
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition flex items-center gap-1">
                        Start <Play className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quick Coding Challenge Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Popular Coding Problems
            </h2>
            <p className="text-xs text-[#8E92A4]">
              Sharpen your problem solving skills with instant testcase feedback
            </p>
          </div>
          <button 
            onClick={() => onNavigate('coding')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
          >
            <span>Explore all problems</span>
            <span>→</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 rounded-xl bg-[#12141C] border border-[#222634] animate-pulse"></div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#6B7280] bg-[#12141C] rounded-xl border border-[#222634]">
            No problems listed yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {problems.slice(0, 3).map((p) => {
              const diff = (p.difficulty || 'Easy').toLowerCase();
              return (
                <div
                  key={p.id}
                  onClick={() => onNavigate('problem-solver', p.id)}
                  className="group bg-[#12141C] hover:bg-[#161924] border border-[#222634] hover:border-[#353B4E] rounded-xl p-4 cursor-pointer transition duration-150 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {p.title}
                    </h4>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      diff === 'hard'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        : diff === 'medium'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {p.difficulty || 'Easy'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8E92A4] line-clamp-2 leading-relaxed">
                    {p.description || 'Practice algorithmic problem solving in multiple languages.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                    <span className="font-mono">{p.category || 'Algorithm'}</span>
                    <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1">
                      Solve <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Minimal Clean Footer Note */}
      <div className="text-center text-xs text-[#525769] pt-6 pb-2">
        B.Tech Learning Platform • Simple, Focused & Distraction-Free
      </div>

    </div>
  );
};
