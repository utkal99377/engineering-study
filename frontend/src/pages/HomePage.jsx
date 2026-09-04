import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Code2, 
  Layers,
  Search,
  SlidersHorizontal
} from 'lucide-react';

const DEFAULT_COURSES = [
  {
    id: 'course_java',
    title: 'Java',
    slug: 'java',
    short_description: 'Learn Java programming from fundamentals to object-oriented programming.',
    progress: 65,
    lessons_count: 24,
    duration_text: '8h 30m',
    level: 'Beginner',
    category: 'programming',
    last_active: true
  },
  {
    id: 'course_cpp',
    title: 'C++',
    slug: 'cpp',
    short_description: 'Build strong programming fundamentals with modern C++.',
    progress: 35,
    lessons_count: 20,
    duration_text: '7h 15m',
    level: 'Intermediate',
    category: 'programming'
  },
  {
    id: 'course_python',
    title: 'Python',
    slug: 'python',
    short_description: 'Learn Python programming, problem solving, and practical development.',
    progress: 80,
    lessons_count: 28,
    duration_text: '9h 45m',
    level: 'Beginner',
    category: 'programming'
  },
  {
    id: 'course_dsa',
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    short_description: 'Master core data structures and algorithmic problem solving.',
    progress: 20,
    lessons_count: 32,
    duration_text: '12h 00m',
    level: 'Intermediate',
    category: 'cs'
  },
  {
    id: 'course_web_dev',
    title: 'Web Development',
    slug: 'web-development',
    short_description: 'Learn HTML, CSS, JavaScript, and modern web development.',
    progress: 10,
    lessons_count: 26,
    duration_text: '10h 30m',
    level: 'Beginner',
    category: 'web'
  },
  {
    id: 'course_sql',
    title: 'SQL & Databases',
    slug: 'sql-databases',
    short_description: 'Master relational databases, SQL queries, indexing, and data modeling.',
    progress: 0,
    lessons_count: 18,
    duration_text: '6h 00m',
    level: 'Beginner',
    category: 'database'
  }
];

export const HomePage = ({ onNavigate }) => {
  const { user } = useAuth();
  // Initialize with DEFAULT_COURSES for 0ms instantaneous rendering
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      if (data && data.length > 0) {
        const merged = data.map((c, idx) => {
          const match = DEFAULT_COURSES.find(d => 
            d.slug === c.slug || 
            d.title.toLowerCase() === c.title.toLowerCase() ||
            c.title.toLowerCase().includes(d.title.toLowerCase())
          );
          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            short_description: c.short_description || match?.short_description || 'Engineering curriculum and code practice.',
            progress: typeof c.progress === 'number' ? c.progress : (match ? match.progress : (idx === 0 ? 65 : idx === 1 ? 35 : 0)),
            lessons_count: c.lectures_count || match?.lessons_count || 20,
            duration_text: match?.duration_text || `${c.duration_hours || 8}h 00m`,
            level: c.level || match?.level || 'Beginner',
            category: match?.category || 'programming'
          };
        });
        setCourses(merged);
      }
    } catch (err) {
      // Retain pre-loaded DEFAULT_COURSES
    }
  };

  const studentName = user?.name ? user.name.split(' ')[0] : 'Aditya';

  // Filter courses by search and category
  const filteredCourses = courses.filter(c => {
    const matchesSearch = !searchFilter || 
      c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.short_description.toLowerCase().includes(searchFilter.toLowerCase());
    
    if (categoryFilter === 'in_progress') {
      return matchesSearch && c.progress > 0;
    }
    if (categoryFilter !== 'all') {
      return matchesSearch && (c.category === categoryFilter);
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      
      {/* 1. Welcome Section */}
      <section className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Welcome back, {studentName}
        </h1>
        <p className="text-sm text-[#A0A0A0]">
          Choose a course and continue building your skills.
        </p>
      </section>

      {/* 2. Continue Learning Section (Recently Studied Course) */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono font-medium tracking-wider text-[#666666] uppercase">
          Continue Learning
        </h2>
        
        <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] hover:border-[#333333] rounded-lg p-5 sm:p-6 transition-all duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A0A0A0] border border-[#262626]">
                  Active Course
                </span>
                <span className="text-xs text-[#666666]">·</span>
                <span className="text-xs text-[#A0A0A0]">Lesson 14 of 22</span>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Java
                </h3>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Object-Oriented Programming
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1 max-w-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#666666]">Course Progress</span>
                  <span className="font-mono text-white">64%</span>
                </div>
                <div className="mono-progress-track">
                  <div className="mono-progress-fill" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>

            <div className="sm:self-center shrink-0">
              <button
                onClick={() => onNavigate('course-detail', 'course_java')}
                className="mono-btn-primary w-full sm:w-auto px-4 py-2.5 text-xs font-semibold"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Choose Your Course (Main Grid) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Choose a course
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A0A0]">
              Start learning or continue where you left off.
            </p>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666666]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="mono-input pl-8 pr-3 py-1.5 text-xs w-40 sm:w-48 bg-[#0A0A0A] border-[#1F1F1F] rounded-md focus:border-[#444444]"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#141414]">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'programming', label: 'Languages' },
            { id: 'cs', label: 'Computer Science' },
            { id: 'web', label: 'Web & Fullstack' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-[#141414] text-white border border-[#262626]'
                  : 'text-[#666666] hover:text-[#A0A0A0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Courses Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const hasStarted = course.progress > 0;
            return (
              <div
                key={course.id}
                className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] hover:border-[#333333] rounded-lg p-5 flex flex-col justify-between transition-all duration-150 group"
              >
                <div className="space-y-3">
                  
                  {/* Card Header: Title & Level */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
                      {course.title}
                    </h3>
                    <span className="text-[10px] font-mono text-[#666666] px-1.5 py-0.5 rounded bg-[#141414] border border-[#1F1F1F] shrink-0">
                      {course.level}
                    </span>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-[#A0A0A0] leading-relaxed line-clamp-2 min-h-[2rem]">
                    {course.short_description}
                  </p>

                  {/* Progress & Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666666]">
                        {hasStarted ? 'Progress' : 'Not started'}
                      </span>
                      <span className="font-mono text-xs font-medium text-white">
                        {course.progress}%
                      </span>
                    </div>
                    
                    <div className="mono-progress-track">
                      <div 
                        className="mono-progress-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Small Course Metadata */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#666666] pt-1">
                    <span>{course.lessons_count} Lessons</span>
                    <span>·</span>
                    <span>{course.duration_text}</span>
                  </div>

                </div>

                {/* Primary Action Button */}
                <div className="pt-5 mt-auto">
                  <button
                    onClick={() => onNavigate('course-detail', course.id)}
                    className={`w-full py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 border ${
                      hasStarted
                        ? 'bg-[#141414] hover:bg-[#1A1A1A] text-white border-[#262626] hover:border-[#383838]'
                        : 'bg-[#0A0A0A] hover:bg-[#141414] text-[#A0A0A0] hover:text-white border-[#1F1F1F] hover:border-[#2C2C2C]'
                    }`}
                  >
                    <span>{hasStarted ? 'Continue Learning' : 'Start Learning'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#888888] group-hover:text-white transition-colors" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 4. Simple Progress Overview Section */}
      <section className="space-y-4 pt-4 border-t border-[#141414]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">
            Your Progress
          </h2>
          <p className="text-xs text-[#A0A0A0]">
            Track your course completions and learning milestones.
          </p>
        </div>

        {/* Minimal Metric Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Metric 1: Overall Progress */}
          <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                68%
              </span>
              <span className="text-xs font-mono text-[#666666]">In Track</span>
            </div>
            
            <p className="text-xs text-[#A0A0A0] font-medium">
              Overall Progress
            </p>
            
            <div className="mono-progress-track">
              <div className="mono-progress-fill" style={{ width: '68%' }}></div>
            </div>
          </div>

          {/* Metric 2: Lessons Completed */}
          <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                48
              </span>
              <span className="text-xs font-mono text-[#666666]">16 Remaining</span>
            </div>
            
            <p className="text-xs text-[#A0A0A0] font-medium">
              Lessons Completed
            </p>

            <div className="mono-progress-track">
              <div className="mono-progress-fill" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Metric 3: Courses Started */}
          <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                12
              </span>
              <span className="text-xs font-mono text-[#666666]">Active Tracks</span>
            </div>
            
            <p className="text-xs text-[#A0A0A0] font-medium">
              Courses Started
            </p>

            <div className="mono-progress-track">
              <div className="mono-progress-fill" style={{ width: '60%' }}></div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
