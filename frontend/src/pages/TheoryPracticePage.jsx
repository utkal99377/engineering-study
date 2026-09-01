import React, { useEffect, useState } from 'react';
import { 
  FileQuestion, 
  Sparkles, 
  Award, 
  Filter, 
  CheckCircle2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { TheoryQuiz } from '../components/TheoryQuiz';
import { useAuth } from '../context/AuthContext';

export const TheoryPracticePage = ({ initialCourseId = null, onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId || 'all');
  const [questions, setQuestions] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);
  const [filterImportant, setFilterImportant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedCourse, filterImportant]);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
      if (user) {
        const stats = await api.getPracticeStats();
        setPracticeStats(stats);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getQuestions({
        course_id: selectedCourse !== 'all' ? selectedCourse : undefined,
        is_important: filterImportant ? true : undefined,
        type: 'mcq'
      });
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Interactive Theory Assessment Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Theory & MCQ Practice Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Reinforce core engineering concepts with instant automated evaluation and detailed viva explanations.
          </p>
        </div>

        {/* Live Score Counter */}
        {practiceStats && (
          <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 shrink-0">
            <div className="text-center px-2">
              <span className="text-xl font-bold font-mono text-white">{practiceStats.total_attempted}</span>
              <span className="text-[10px] text-slate-400 block uppercase">Attempted</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-center px-2">
              <span className="text-xl font-bold font-mono text-emerald-400">{practiceStats.accuracy_percentage}%</span>
              <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 text-xs text-indigo-300 font-semibold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none"
          >
            <option value="all">All B.Tech Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFilterImportant(!filterImportant)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            filterImportant
              ? 'bg-rose-500 text-white shadow-lg'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Important Exam Questions Only</span>
        </button>
      </div>

      {/* Interactive Quiz Engine */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400 font-mono">Loading question bank...</p>
        </div>
      ) : (
        <TheoryQuiz questions={questions} onComplete={() => loadCourses()} />
      )}

    </div>
  );
};
