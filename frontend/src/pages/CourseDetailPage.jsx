import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  Crown, 
  Layers, 
  ArrowLeft, 
  FileText, 
  Video, 
  FileCode, 
  Sparkles,
  HelpCircle,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CourseDetailPage = ({ courseId, onNavigate, onOpenSubscribe }) => {
  const { user, entitlement } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('syllabus'); // syllabus, theory, coding
  const [theoryQuestions, setTheoryQuestions] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);

  useEffect(() => {
    if (courseId) {
      loadCourseDetail();
    }
  }, [courseId]);

  const loadCourseDetail = async () => {
    setLoading(true);
    try {
      const [courseData, qData, probData] = await Promise.all([
        api.getCourseDetail(courseId),
        api.getQuestions({ course_id: courseId }),
        api.getProblems({ course_id: courseId }),
      ]);
      setCourse(courseData);
      setTheoryQuestions(qData);
      setCodingProblems(probData);
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-400 font-mono">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center glass-card rounded-2xl">
        <h2 className="text-lg font-bold text-white">Course Not Found</h2>
        <button
          onClick={() => onNavigate('courses')}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-indigo-300"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  // Find first unlocked lecture to start
  const firstUnlockedLecture = course.modules
    ?.flatMap(m => m.lectures)
    ?.find(l => l.is_unlocked);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('courses')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalog</span>
      </button>

      {/* Course Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-80 h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative shadow-xl">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            {course.access_type === 'free' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                Free
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Pro Access
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
              {course.subject_name || 'B.Tech Subject'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {course.level}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {course.description || course.short_description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{course.lectures_count} Sequential Lectures</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{course.duration_hours} Total Hours</span>
            </div>
            {course.user_progress_percentage > 0 && (
              <div className="flex items-center gap-1.5 text-indigo-300 font-mono font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{course.user_progress_percentage}% Completed</span>
              </div>
            )}
          </div>

          {/* Start / Continue Button */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            {firstUnlockedLecture ? (
              <button
                onClick={() => onNavigate('lecture-player', firstUnlockedLecture.id)}
                className="px-6 py-3 rounded-xl gradient-brand-btn text-white text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-[1.02] transition"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{course.user_progress_percentage > 0 ? 'Continue Next Lecture' : 'Start Course'}</span>
              </button>
            ) : course.access_type === 'premium' && !course.has_premium_access ? (
              <button
                onClick={onOpenSubscribe}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-[1.02] transition"
              >
                <Crown className="w-4 h-4" />
                <span>Unlock with B.Tech Pro Pass</span>
              </button>
            ) : (
              <div className="text-xs text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Prerequisites not yet unlocked.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs (Syllabus / Theory MCQs / Coding Problems) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'syllabus'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Modules & Syllabus ({course.modules?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'theory'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Theory & MCQ Practice ({theoryQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coding')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'coding'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Lab & Coding Challenges ({codingProblems.length})</span>
        </button>
      </div>

      {/* Tab Content: Syllabus / Modules */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          {course.modules?.map((mod, modIdx) => (
            <div key={mod.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                    Module {modIdx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{mod.title}</h3>
                  {mod.description && (
                    <p className="text-xs text-slate-400 mt-1">{mod.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {mod.lectures?.length || 0} Lectures
                </span>
              </div>

              {/* Lecture list in Module */}
              <div className="divide-y divide-slate-800/80 border-t border-slate-800/80 pt-2">
                {mod.lectures?.map((lec) => {
                  const isCompleted = lec.access_state === 'completed';
                  const isAvailable = lec.access_state === 'available' || lec.access_state === 'in_progress';
                  const isLocked = lec.access_state === 'locked';
                  const isPremiumLocked = lec.access_state === 'premium_locked';

                  return (
                    <div
                      key={lec.id}
                      onClick={() => {
                        if (lec.is_unlocked) {
                          onNavigate('lecture-player', lec.id);
                        } else if (isPremiumLocked) {
                          onOpenSubscribe();
                        }
                      }}
                      className={`py-3.5 px-3 rounded-xl flex items-center justify-between transition ${
                        lec.is_unlocked
                          ? 'hover:bg-slate-800/60 cursor-pointer text-slate-100'
                          : 'opacity-70 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* State Icon */}
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : isAvailable ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        ) : isPremiumLocked ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Crown className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}

                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                            <span>{lec.title}</span>
                            {isCompleted && (
                              <span className="text-[10px] text-emerald-400 font-mono font-medium">Completed</span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {lec.duration_min} mins
                            </span>
                            {lec.resources?.length > 0 && (
                              <span className="flex items-center gap-1 text-indigo-400">
                                <FileText className="w-3 h-3" />
                                {lec.resources.length} Notes/Attachments
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Access State Tag */}
                      <div className="text-right">
                        {isCompleted ? (
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                            Passed
                          </span>
                        ) : isAvailable ? (
                          <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono font-medium">
                            Ready to Learn
                          </span>
                        ) : isPremiumLocked ? (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Pro Only
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-500 text-[10px] font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Prerequisite Req.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Theory Questions */}
      {activeTab === 'theory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Course Theory Assessments & MCQs</h3>
            <button
              onClick={() => onNavigate('theory', { course_id: course.id })}
              className="px-4 py-2 rounded-xl gradient-brand-btn text-white text-xs font-semibold"
            >
              Start Interactive MCQ Mode
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theoryQuestions.map((q) => (
              <div key={q.id} className="glass-card p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {q.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-amber-400 font-mono">{q.marks} Marks</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-100">{q.text}</h4>
                {q.user_attempt && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attempted (Score: {q.user_attempt.score_obtained} pts)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Coding Problems */}
      {activeTab === 'coding' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Curated Engineering Lab Problems</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {codingProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onNavigate('problem-solver', prob.id)}
                className="glass-card p-4 rounded-xl cursor-pointer hover:border-indigo-500/40 transition flex items-center justify-between"
              >
                <div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    prob.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
                    prob.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {prob.difficulty}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{prob.title}</h4>
                  <div className="flex gap-1.5 mt-1.5">
                    {prob.tags?.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  Solve in IDE →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
