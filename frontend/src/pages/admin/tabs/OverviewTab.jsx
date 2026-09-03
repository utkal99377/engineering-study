import React from 'react';
import { 
  Users, 
  Crown, 
  Terminal, 
  IndianRupee, 
  BookOpen, 
  FileQuestion, 
  Layers,
  ArrowUpRight,
  Sparkles,
  Clock
} from 'lucide-react';

export const OverviewTab = ({ stats, courses = [], questions = [], problems = [], onNavigateTab }) => {
  const totalLectures = courses.reduce((acc, c) => acc + (c.lectures_count || 0), 0);

  const kpis = [
    {
      title: 'Total Enrolled Students',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      tabTarget: 'users',
    },
    {
      title: 'Active Pro Subscribers',
      value: stats?.active_subscriptions || 0,
      icon: Crown,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      tabTarget: 'plans',
    },
    {
      title: 'Sandbox Submissions',
      value: stats?.total_submissions || 0,
      icon: Terminal,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      tabTarget: 'problems',
    },
    {
      title: 'Platform Gross Revenue',
      value: `₹${stats?.total_revenue || 0}`,
      icon: IndianRupee,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      tabTarget: 'plans',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              onClick={() => kpi.tabTarget && onNavigateTab(kpi.tabTarget)}
              className="clean-card bg-[#11141E] border border-[#222634] p-5 rounded-2xl cursor-pointer hover:border-[#383E54] transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bgColor} ${kpi.borderColor} border flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
              </div>
              <span className="text-xs text-slate-400 font-medium block">{kpi.title}</span>
              <h3 className={`text-2xl font-bold font-mono tracking-tight mt-1 ${kpi.color}`}>
                {kpi.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Academic Content Quick Summary */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-5">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3 tracking-wider">
          Curriculum Inventory Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div 
            onClick={() => onNavigateTab('courses')}
            className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] flex items-center gap-3 cursor-pointer hover:border-indigo-500/40 transition"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-slate-400 text-[11px] block">Published Courses</span>
              <span className="text-sm font-bold text-white font-mono">{courses.length} tracks</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('courses')}
            className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] flex items-center gap-3 cursor-pointer hover:border-indigo-500/40 transition"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-slate-400 text-[11px] block">Total Lectures</span>
              <span className="text-sm font-bold text-white font-mono">{totalLectures} lectures</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('questions')}
            className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] flex items-center gap-3 cursor-pointer hover:border-indigo-500/40 transition"
          >
            <FileQuestion className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 text-[11px] block">Theory Questions</span>
              <span className="text-sm font-bold text-white font-mono">{questions.length} MCQs</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('problems')}
            className="p-3.5 rounded-xl bg-[#161924] border border-[#252A3B] flex items-center gap-3 cursor-pointer hover:border-indigo-500/40 transition"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-400 text-[11px] block">Coding Challenges</span>
              <span className="text-sm font-bold text-white font-mono">{problems.length} problems</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Student Sandbox Submissions Table */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Live Student Sandbox Submissions
              </h3>
              <p className="text-[11px] text-slate-400">
                Real-time code execution outcomes and test case results
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Realtime Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232738] text-slate-500 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Coding Challenge</th>
                <th className="pb-3 font-semibold">Language</th>
                <th className="pb-3 font-semibold">Verdict</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2130]">
              {(!stats?.recent_submissions || stats.recent_submissions.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No student submissions logged yet.
                  </td>
                </tr>
              ) : (
                stats.recent_submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#161926] transition">
                    <td className="py-3 font-semibold text-white">{s.user_name}</td>
                    <td className="py-3 text-slate-300">{s.problem_title}</td>
                    <td className="py-3 font-mono text-indigo-400 font-medium">{s.language}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        s.status === 'Accepted'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-200 font-medium">{s.score}%</td>
                    <td className="py-3 font-mono text-slate-400">{s.runtime_ms} ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
