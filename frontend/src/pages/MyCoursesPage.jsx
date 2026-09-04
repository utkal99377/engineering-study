import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BookOpen, 
  ArrowRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  Play, 
  Filter 
} from 'lucide-react';

export const MyCoursesPage = ({ onNavigate }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in_progress, completed
  const [search, setSearch] = useState('');

  const sampleEnrolledCourses = [
    {
      id: 'course_java',
      title: 'Java',
      short_description: 'Learn Java programming from fundamentals to object-oriented programming.',
      progress: 65,
      current_lesson: 'Lesson 14: Polymorphism & Abstract Classes',
      total_lessons: 24,
      completed_lessons: 15,
      duration_text: '8h 30m',
      last_accessed: '2 hours ago',
    },
    {
      id: 'course_python',
      title: 'Python',
      short_description: 'Learn Python programming, problem solving, and practical development.',
      progress: 80,
      current_lesson: 'Lesson 22: Decorators & Generators',
      total_lessons: 28,
      completed_lessons: 22,
      duration_text: '9h 45m',
      last_accessed: 'Yesterday',
    },
    {
      id: 'course_cpp',
      title: 'C++',
      short_description: 'Build strong programming fundamentals with modern C++.',
      progress: 35,
      current_lesson: 'Lesson 7: Memory Allocation & Pointers',
      total_lessons: 20,
      completed_lessons: 7,
      duration_text: '7h 15m',
      last_accessed: '3 days ago',
    },
    {
      id: 'course_dsa',
      title: 'Data Structures & Algorithms',
      short_description: 'Master core data structures and algorithmic problem solving.',
      progress: 20,
      current_lesson: 'Lesson 6: Singly & Doubly Linked Lists',
      total_lessons: 32,
      completed_lessons: 6,
      duration_text: '12h 00m',
      last_accessed: '5 days ago',
    },
    {
      id: 'course_web_dev',
      title: 'Web Development',
      short_description: 'Learn HTML, CSS, JavaScript, and modern web development.',
      progress: 10,
      current_lesson: 'Lesson 3: Responsive Layouts & Flexbox',
      total_lessons: 26,
      completed_lessons: 3,
      duration_text: '10h 30m',
      last_accessed: '1 week ago',
    },
  ];

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses().catch(() => []);
      if (data && data.length > 0) {
        setCourses(sampleEnrolledCourses);
      } else {
        setCourses(sampleEnrolledCourses);
      }
    } catch (e) {
      setCourses(sampleEnrolledCourses);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = !search || 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.short_description.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'completed') return matchesSearch && c.progress === 100;
    if (filter === 'in_progress') return matchesSearch && c.progress > 0 && c.progress < 100;
    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#141414] pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            My Courses
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Track and resume your active engineering courses.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono-input pl-8 pr-3 py-1.5 text-xs w-full sm:w-60 bg-[#0A0A0A] border-[#1F1F1F] rounded-md focus:border-[#444444]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#141414] pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-[#141414] text-white border border-[#262626]'
              : 'text-[#666666] hover:text-[#A0A0A0]'
          }`}
        >
          All Enrolled ({courses.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            filter === 'in_progress'
              ? 'bg-[#141414] text-white border border-[#262626]'
              : 'text-[#666666] hover:text-[#A0A0A0]'
          }`}
        >
          In Progress ({courses.filter(c => c.progress > 0 && c.progress < 100).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            filter === 'completed'
              ? 'bg-[#141414] text-white border border-[#262626]'
              : 'text-[#666666] hover:text-[#A0A0A0]'
          }`}
        >
          Completed ({courses.filter(c => c.progress === 100).length})
        </button>
      </div>

      {/* Course Cards List */}
      {filtered.length === 0 ? (
        <div className="mono-panel p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#555555] mx-auto" />
          <p className="text-sm font-medium text-white">No courses match your filter</p>
          <p className="text-xs text-[#666666]">Explore all available courses to start learning.</p>
          <button
            onClick={() => onNavigate('home')}
            className="mono-btn-primary text-xs mt-2"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] hover:border-[#333333] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-150"
            >
              {/* Course Info */}
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-white">
                    {course.title}
                  </h3>
                  <span className="text-xs font-mono text-[#A0A0A0]">
                    {course.completed_lessons}/{course.total_lessons} Lessons
                  </span>
                  <span className="text-[#444444]">•</span>
                  <span className="text-xs font-mono text-[#666666]">
                    {course.duration_text}
                  </span>
                </div>

                <p className="text-xs text-[#A0A0A0] line-clamp-1">
                  {course.short_description}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[#666666]">
                  <span>Current:</span>
                  <span className="text-[#A0A0A0]">{course.current_lesson}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1 max-w-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666666]">Progress</span>
                    <span className="font-mono text-white">{course.progress}%</span>
                  </div>
                  <div className="mono-progress-track">
                    <div 
                      className="mono-progress-fill" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0 self-end md:self-center">
                <button
                  onClick={() => onNavigate('course-detail', course.id)}
                  className="mono-btn-primary text-xs px-4 py-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
