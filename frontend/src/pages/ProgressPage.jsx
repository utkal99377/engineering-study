import React from 'react';
import { 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Layers,
  Code
} from 'lucide-react';

export const ProgressPage = ({ onNavigate }) => {
  const progressMetrics = {
    overallPercentage: 68,
    lessonsCompleted: 48,
    lessonsRemaining: 16,
    coursesStarted: 12,
    studyHours: 38.5,
  };

  const courseBreakdown = [
    {
      id: 'course_python',
      name: 'Python',
      category: 'Languages',
      progress: 80,
      completedLessons: 22,
      totalLessons: 28,
      status: 'In Progress',
    },
    {
      id: 'course_java',
      name: 'Java',
      category: 'Languages & OOP',
      progress: 65,
      completedLessons: 15,
      totalLessons: 24,
      status: 'In Progress',
    },
    {
      id: 'course_cpp',
      name: 'C++',
      category: 'Systems Programming',
      progress: 35,
      completedLessons: 7,
      totalLessons: 20,
      status: 'In Progress',
    },
    {
      id: 'course_dsa',
      name: 'Data Structures & Algorithms',
      category: 'Computer Science',
      progress: 20,
      completedLessons: 6,
      totalLessons: 32,
      status: 'In Progress',
    },
    {
      id: 'course_web_dev',
      name: 'Web Development',
      category: 'Frontend & Fullstack',
      progress: 10,
      completedLessons: 3,
      totalLessons: 26,
      status: 'In Progress',
    },
    {
      id: 'course_sql',
      name: 'SQL & Databases',
      category: 'Databases & Backend',
      progress: 0,
      completedLessons: 0,
      totalLessons: 18,
      status: 'Not Started',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-[#141414] pb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Your Progress
        </h1>
        <p className="text-sm text-[#A0A0A0]">
          Comprehensive overview of your engineering coursework and milestones.
        </p>
      </div>

      {/* Primary Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">
              {progressMetrics.overallPercentage}%
            </span>
            <span className="text-xs font-mono text-[#666666]">Active Track</span>
          </div>
          <p className="text-xs text-[#A0A0A0] font-medium">Overall Progress</p>
          <div className="mono-progress-track">
            <div 
              className="mono-progress-fill" 
              style={{ width: `${progressMetrics.overallPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">
              {progressMetrics.lessonsCompleted}
            </span>
            <span className="text-xs font-mono text-[#666666]">
              {progressMetrics.lessonsRemaining} Remaining
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] font-medium">Lessons Completed</p>
          <div className="mono-progress-track">
            <div 
              className="mono-progress-fill" 
              style={{ width: `${(progressMetrics.lessonsCompleted / (progressMetrics.lessonsCompleted + progressMetrics.lessonsRemaining)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">
              {progressMetrics.coursesStarted}
            </span>
            <span className="text-xs font-mono text-[#666666]">
              {progressMetrics.studyHours}h Studied
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] font-medium">Courses Started</p>
          <div className="mono-progress-track">
            <div className="mono-progress-fill" style={{ width: '60%' }}></div>
          </div>
        </div>

      </div>

      {/* Course-by-Course Breakdown Table */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">
          Course Breakdown
        </h2>

        <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#1F1F1F] text-[#666666] font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Course</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Lessons</th>
                  <th className="py-3 px-4 font-medium">Progress</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {courseBreakdown.map((item) => (
                  <tr key={item.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0]">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#A0A0A0]">
                      {item.completedLessons} / {item.totalLessons}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <div className="mono-progress-track flex-1">
                          <div 
                            className="mono-progress-fill" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] text-white w-8 text-right">
                          {item.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigate('course-detail', item.id)}
                        className="mono-btn-ghost text-xs px-2.5 py-1 hover:text-white"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
