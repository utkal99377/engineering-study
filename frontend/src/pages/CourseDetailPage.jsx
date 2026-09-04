import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Code, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FALLBACK_COURSES = {
  course_java: {
    id: 'course_java',
    title: 'Java',
    short_description: 'Learn Java programming from fundamentals to object-oriented programming.',
    description: 'Master Java syntax, OOP concepts, inheritance, polymorphism, abstract classes, collections framework, and robust error handling for engineering systems.',
    progress: 65,
    level: 'Beginner',
    duration_text: '8h 30m',
    lessons_count: 24,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Java Fundamentals & Syntax',
        lessons: [
          { id: 'l1', title: '1. Introduction to JVM, JDK & Bytecode', duration: '20 min', completed: true },
          { id: 'l2', title: '2. Primitive Data Types & Variables', duration: '25 min', completed: true },
          { id: 'l3', title: '3. Operators & Control Flow (if/switch/loops)', duration: '35 min', completed: true },
          { id: 'l4', title: '4. Arrays & String Manipulation', duration: '30 min', completed: true },
        ]
      },
      {
        id: 'm2',
        title: 'Module 2: Object-Oriented Programming (OOP)',
        lessons: [
          { id: 'l5', title: '5. Classes, Objects & Constructors', duration: '40 min', completed: true },
          { id: 'l6', title: '6. Encapsulation & Access Modifiers', duration: '30 min', completed: true },
          { id: 'l7', title: '7. Inheritance & Method Overriding', duration: '45 min', completed: true },
          { id: 'l8', title: '8. Polymorphism, Interfaces & Abstract Classes', duration: '50 min', completed: false, current: true },
        ]
      },
      {
        id: 'm3',
        title: 'Module 3: Advanced Java & Collections',
        lessons: [
          { id: 'l9', title: '9. Exception Handling (try/catch/finally)', duration: '35 min', completed: false },
          { id: 'l10', title: '10. Java Collections: Lists, Sets & Maps', duration: '60 min', completed: false },
          { id: 'l11', title: '11. Generics & Streams API', duration: '45 min', completed: false },
          { id: 'l12', title: '12. Multithreading & Concurrency Basics', duration: '50 min', completed: false },
        ]
      }
    ]
  },
  course_cpp: {
    id: 'course_cpp',
    title: 'C++',
    short_description: 'Build strong programming fundamentals with modern C++.',
    description: 'Deep dive into pointers, memory management, classes, templates, STL containers, and modern C++ engineering practices.',
    progress: 35,
    level: 'Intermediate',
    duration_text: '7h 15m',
    lessons_count: 20,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: C++ Syntax & Pointers',
        lessons: [
          { id: 'l1', title: '1. Variables, References & Pointers', duration: '30 min', completed: true },
          { id: 'l2', title: '2. Dynamic Memory Allocation (new/delete)', duration: '40 min', completed: true },
        ]
      },
      {
        id: 'm2',
        title: 'Module 2: Classes & STL Containers',
        lessons: [
          { id: 'l3', title: '3. Operator Overloading & Copy Constructors', duration: '45 min', completed: false, current: true },
          { id: 'l4', title: '4. Vectors, Maps & Algorithms', duration: '50 min', completed: false },
        ]
      }
    ]
  },
  course_python: {
    id: 'course_python',
    title: 'Python',
    short_description: 'Learn Python programming, problem solving, and practical development.',
    description: 'Understand core Python, data structures, functional paradigms, OOP, automation scripts, and practical problem solving.',
    progress: 80,
    level: 'Beginner',
    duration_text: '9h 45m',
    lessons_count: 28,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Core Python & Data Structures',
        lessons: [
          { id: 'l1', title: '1. Python Syntax & Dynamic Typing', duration: '25 min', completed: true },
          { id: 'l2', title: '2. Lists, Tuples, Dictionaries & Sets', duration: '35 min', completed: true },
        ]
      },
      {
        id: 'm2',
        title: 'Module 2: Functions, OOP & Modules',
        lessons: [
          { id: 'l3', title: '3. Decorators & Context Managers', duration: '40 min', completed: true },
          { id: 'l4', title: '4. Object Oriented Python', duration: '45 min', completed: false, current: true },
        ]
      }
    ]
  },
  course_dsa: {
    id: 'course_dsa',
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    short_description: 'Master core data structures and algorithmic problem solving.',
    description: 'Step-by-step mastery of Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graphs, Sorting, Recursion, and Dynamic Programming.',
    progress: 20,
    level: 'Intermediate',
    duration_text: '12h 00m',
    lessons_count: 32,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Linear Data Structures',
        lessons: [
          { id: 'l1', title: '1. Arrays & Dynamic Array Implementation', duration: '35 min', completed: true },
          { id: 'l2', title: '2. Singly & Doubly Linked Lists', duration: '45 min', completed: false, current: true },
          { id: 'l3', title: '3. Stacks & Queues Applications', duration: '40 min', completed: false },
        ]
      }
    ]
  },
  course_web_dev: {
    id: 'course_web_dev',
    title: 'Web Development',
    slug: 'web-development',
    short_description: 'Learn HTML, CSS, JavaScript, and modern web development.',
    description: 'Construct modern, accessible, responsive web applications from semantic HTML5 and CSS to modern ES6+ JavaScript and component architecture.',
    progress: 10,
    level: 'Beginner',
    duration_text: '10h 30m',
    lessons_count: 26,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Web Foundation & Modern Layouts',
        lessons: [
          { id: 'l1', title: '1. Semantic HTML5 & Accessibility', duration: '30 min', completed: true },
          { id: 'l2', title: '2. CSS Grid & Modern Flexbox', duration: '45 min', completed: false, current: true },
        ]
      }
    ]
  },
  course_sql: {
    id: 'course_sql',
    title: 'SQL & Databases',
    slug: 'sql-databases',
    short_description: 'Master relational databases, SQL queries, indexing, and data modeling.',
    description: 'Comprehensive grounding in relational database systems, CRUD operations, joins, subqueries, indexing, schema design, and ACID transactions.',
    progress: 0,
    level: 'Beginner',
    duration_text: '6h 00m',
    lessons_count: 18,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Relational Modeling & Basic SQL',
        lessons: [
          { id: 'l1', title: '1. Relational Database Concepts & Tables', duration: '30 min', completed: false, current: true },
          { id: 'l2', title: '2. SELECT, WHERE, GROUP BY & Joins', duration: '45 min', completed: false },
        ]
      }
    ]
  }
};

export const CourseDetailPage = ({ courseId, onNavigate }) => {
  const { user } = useAuth();
  const initialKey = courseId || 'course_java';
  // Instant preloaded state
  const [course, setCourse] = useState(() => FALLBACK_COURSES[initialKey] || FALLBACK_COURSES.course_java);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      const data = await api.getCourseDetail(courseId);
      if (data && data.title) {
        setCourse(data);
      }
    } catch (e) {
      const key = courseId || 'course_java';
      setCourse(FALLBACK_COURSES[key] || FALLBACK_COURSES.course_java);
    }
  };

  if (!course) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="mono-btn-ghost text-xs -ml-2 text-[#A0A0A0] hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Course Overview Header */}
      <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] p-6 sm:p-8 rounded-lg space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#141414] text-[#A0A0A0] border border-[#262626]">
              {course.level || 'Beginner'}
            </span>
            <span className="text-xs text-[#666666]">·</span>
            <span className="text-xs font-mono text-[#666666]">{course.duration_text || '8h 30m'}</span>
            <span className="text-xs text-[#666666]">·</span>
            <span className="text-xs font-mono text-[#666666]">{course.lessons_count || 24} Lessons</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            {course.title}
          </h1>

          <p className="text-sm text-[#A0A0A0] max-w-2xl leading-relaxed">
            {course.description || course.short_description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 pt-2 border-t border-[#181818] max-w-md">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#666666]">Your Progress</span>
            <span className="font-mono text-white font-medium">{course.progress || 0}% Complete</span>
          </div>
          <div className="mono-progress-track">
            <div className="mono-progress-fill" style={{ width: `${course.progress || 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Course Syllabus / Lessons Structure */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">
          Course Curriculum
        </h2>

        <div className="space-y-3">
          {(course.modules || []).map((mod, modIdx) => (
            <div 
              key={mod.id || modIdx}
              className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg overflow-hidden"
            >
              <div className="px-5 py-3.5 bg-[#0A0A0A] border-b border-[#181818]">
                <h3 className="text-xs font-mono font-semibold text-white">
                  {mod.title}
                </h3>
              </div>

              <div className="divide-y divide-[#141414]">
                {(mod.lectures || mod.lessons || []).map((lesson, lesIdx) => (
                  <div
                    key={lesson.id || lesIdx}
                    className="px-5 py-3 flex items-center justify-between hover:bg-[#141414] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      ) : lesson.current ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-1 mr-1" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#333333] shrink-0" />
                      )}
                      
                      <div>
                        <p className={`text-xs font-medium ${lesson.completed || lesson.current ? 'text-white' : 'text-[#A0A0A0]'}`}>
                          {lesson.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-[#666666]">
                        {lesson.duration || '25 min'}
                      </span>
                      <button className="mono-btn-ghost text-xs p-1 hover:text-white">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
