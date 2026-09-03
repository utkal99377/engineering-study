import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  FolderPlus, 
  FileQuestion, 
  Terminal, 
  Crown, 
  Users, 
  Sliders, 
  Database,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    title: 'METRICS & ACTIVITY',
    items: [
      { id: 'overview', label: 'Overview & Insights', icon: BarChart3, badgeKey: null },
    ],
  },
  {
    title: 'ACADEMIC STUDIO',
    items: [
      { id: 'courses', label: 'Courses & Syllabus', icon: BookOpen, badgeKey: 'courses' },
      { id: 'subjects', label: 'Disciplines & Subjects', icon: FolderPlus, badgeKey: 'subjects' },
      { id: 'questions', label: 'Theory & MCQs Bank', icon: FileQuestion, badgeKey: 'questions' },
      { id: 'problems', label: 'Coding Problems Arena', icon: Terminal, badgeKey: 'problems' },
    ],
  },
  {
    title: 'MONETIZATION',
    items: [
      { id: 'plans', label: 'Pro Plans & Coupons', icon: Crown, badgeKey: 'plans' },
    ],
  },
  {
    title: 'MANAGEMENT & SYSTEM',
    items: [
      { id: 'users', label: 'Students & Roles', icon: Users, badgeKey: 'users' },
      { id: 'settings', label: 'Live App Dynamic CMS', icon: Sliders, badgeKey: null },
      { id: 'database', label: 'Database & Sync', icon: Database, badgeKey: null },
    ],
  },
];

export const AdminSidebar = ({ activeTab, onSelectTab, counts = {} }) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#0E1017] border border-[#202431] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
      <div className="space-y-6">
        
        {/* Administrator Badge */}
        <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-950/60 via-[#1A1D2B] to-[#121520] border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block leading-tight">Admin Console</span>
              <span className="text-[9px] text-emerald-400 font-mono">Live Control</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded">v2.0</span>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const count = item.badgeKey ? counts[item.badgeKey] : null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#161924]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {count !== null && count !== undefined && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          isActive ? 'bg-indigo-700/80 text-white' : 'bg-[#1C202E] text-slate-400 group-hover:text-slate-200'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Quick System Tip / Footer */}
      <div className="mt-6 pt-3 border-t border-[#1C202E] px-2 text-[10px] text-slate-500">
        <p className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Zero-rebuild live updates across all student apps.</span>
        </p>
      </div>
    </aside>
  );
};
