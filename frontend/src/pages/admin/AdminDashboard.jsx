import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  FileQuestion, 
  Terminal, 
  Crown, 
  Database, 
  Users, 
  Plus, 
  Trash2, 
  Edit3,
  CheckCircle2, 
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Sliders,
  Megaphone,
  Save,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, settings, courses, questions, problems, plans, datasets, users
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [datasetStatus, setDatasetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Dynamic Live Platform Settings
  const [adminSettings, setAdminSettings] = useState({
    site_title: 'B.Tech Learning Platform',
    hero_badge: 'Curriculum for B.Tech CSE & Engineering Students',
    hero_title: 'Master Programming & Ace Your Engineering Exams',
    hero_subtitle: 'Data-driven courses, sequential unlocking, theory MCQs with automated scoring, and a multi-language sandbox code runner for B.Tech CSE/IT.',
    announcement_active: true,
    announcement_text: '🔥 Mid-Sem Exam Prep is Live! Practice 100+ MCQs & Code Problems now.',
    announcement_type: 'info',
    feature_coding_arena: true,
    feature_mcq_practice: true,
    feature_pro_subscription: true,
    maintenance_mode: false,
  });

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null); // { type: 'course'|'question'|'problem'|'plan', data: {...} }

  // Forms states
  const [newCourse, setNewCourse] = useState({ subject_id: '', title: '', access_type: 'free', level: 'Beginner', duration_hours: 10, short_description: '' });
  const [newModule, setNewModule] = useState({ course_id: '', title: '', order_no: 1 });
  const [newLecture, setNewLecture] = useState({ module_id: '', title: '', duration_min: 20, prerequisite_id: '', video_url: '', notes_markdown: '' });
  const [newQuestion, setNewQuestion] = useState({ course_id: '', title: '', text: '', options: ['', '', '', ''], correct_answer: '', explanation: '', marks: 2, difficulty: 'Easy', is_important: false });
  const [newProblem, setNewProblem] = useState({ course_id: '', title: '', difficulty: 'Easy', statement: '', time_limit_sec: 2.0, sample_input: '', sample_output: '', hidden_input: '', hidden_output: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', value: 20, description: '' });

  useEffect(() => {
    loadAllAdminData();
  }, [activeTab]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [st, subjs, crs, qs, probs, pls, us, dStatus, dynSettings] = await Promise.all([
        api.getAdminStats(),
        api.getSubjects(),
        api.getCourses(),
        api.getQuestions(),
        api.getProblems(),
        api.getPlans(),
        api.getAdminUsers(),
        api.getDatasetStatus(),
        api.getAdminSettings().catch(() => null),
      ]);
      setStats(st);
      setSubjects(subjs);
      setCourses(crs);
      setQuestions(qs);
      setProblems(probs);
      setPlans(pls);
      setUsers(us);
      setDatasetStatus(dStatus);
      if (dynSettings) {
        setAdminSettings(prev => ({ ...prev, ...dynSettings }));
      }
      if (subjs.length > 0 && !newCourse.subject_id) {
        setNewCourse(prev => ({ ...prev, subject_id: subjs[0].id }));
      }
      if (crs.length > 0 && !newQuestion.course_id) {
        setNewQuestion(prev => ({ ...prev, course_id: crs[0].id }));
        setNewProblem(prev => ({ ...prev, course_id: crs[0].id }));
        setNewModule(prev => ({ ...prev, course_id: crs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Handlers for Dynamic Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.saveAdminSettings(adminSettings);
      showNotification('✅ Dynamic Platform Settings saved! Changes are live across the application without code edits.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers for Editing & Updating
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      if (editingItem.type === 'course') {
        await api.updateCourse(editingItem.data.id, editingItem.data);
        showNotification('✅ Course updated successfully! Changes are live for all users.');
      } else if (editingItem.type === 'module') {
        await api.updateModule(editingItem.data.id, editingItem.data);
        showNotification('✅ Module updated successfully!');
      } else if (editingItem.type === 'lecture') {
        await api.updateLecture(editingItem.data.id, editingItem.data);
        showNotification('✅ Lecture and sequential unlock rules updated successfully!');
      } else if (editingItem.type === 'question') {
        await api.updateQuestion(editingItem.data.id, editingItem.data);
        showNotification('✅ MCQ Question updated successfully!');
      } else if (editingItem.type === 'problem') {
        await api.updateProblem(editingItem.data.id, editingItem.data);
        showNotification('✅ Coding Problem updated successfully!');
      } else if (editingItem.type === 'plan') {
        await api.updatePlan(editingItem.data.id, editingItem.data);
        showNotification('✅ Subscription Plan & Pricing updated successfully!');
      }
      setEditingItem(null);
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers for Creation & Deletion
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse(newCourse);
      showNotification('Course created successfully!');
      loadAllAdminData();
      setNewCourse(prev => ({ ...prev, title: '', short_description: '' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course and all its modules?')) return;
    try {
      await api.deleteCourse(id);
      showNotification('Course deleted successfully.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await api.createModule(newModule);
      showNotification('Module added to course!');
      loadAllAdminData();
      setNewModule(prev => ({ ...prev, title: '' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateLecture = async (e) => {
    e.preventDefault();
    try {
      await api.createLecture({
        ...newLecture,
        prerequisite_id: newLecture.prerequisite_id || null,
      });
      showNotification('Lecture added with prerequisite rules!');
      loadAllAdminData();
      setNewLecture(prev => ({ ...prev, title: '', video_url: '', notes_markdown: '' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.createQuestion(newQuestion);
      showNotification('Theory question / MCQ added!');
      loadAllAdminData();
      setNewQuestion(prev => ({ ...prev, title: '', text: '', correct_answer: '', explanation: '', options: ['', '', '', ''] }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await api.deleteQuestion(id);
      showNotification('Question deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const test_cases = [];
      if (newProblem.sample_input && newProblem.sample_output) {
        test_cases.push({
          input_data: newProblem.sample_input,
          expected_output: newProblem.sample_output,
          is_hidden: false,
          explanation: 'Sample Case'
        });
      }
      if (newProblem.hidden_input && newProblem.hidden_output) {
        test_cases.push({
          input_data: newProblem.hidden_input,
          expected_output: newProblem.hidden_output,
          is_hidden: true,
          explanation: 'Hidden Benchmark Case'
        });
      }

      await api.createProblem({
        course_id: newProblem.course_id || null,
        title: newProblem.title,
        difficulty: newProblem.difficulty,
        statement: newProblem.statement,
        time_limit_sec: parseFloat(newProblem.time_limit_sec),
        test_cases
      });

      showNotification('Coding problem & sandbox test cases published!');
      loadAllAdminData();
      setNewProblem(prev => ({ ...prev, title: '', statement: '', sample_input: '', sample_output: '', hidden_input: '', hidden_output: '' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProblem = async (id) => {
    try {
      await api.deleteProblem(id);
      showNotification('Problem deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImportDatasets = async () => {
    try {
      const res = await api.importDatasetsFromDisk();
      showNotification(`Dataset sync complete: ${JSON.stringify(res.stats || res.imported_stats)}`);
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const [syncingSupa, setSyncingSupa] = useState(false);
  const handleSyncToSupabase = async () => {
    setSyncingSupa(true);
    try {
      const res = await api.syncToSupabase();
      if (res.success) {
        showNotification(`⚡ Supabase PostgreSQL Live: ${res.message}`);
      } else {
        showNotification(res.message || 'Supabase verified.');
      }
      loadAllAdminData();
    } catch (err) {
      showNotification(`Supabase Status: ${err.message}`);
    } finally {
      setSyncingSupa(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(newCoupon);
      showNotification('Coupon code activated!');
      setNewCoupon({ code: '', discount_type: 'percentage', value: 20, description: '' });
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await api.deletePlan(id);
      showNotification('Plan deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.updateUserRole(userId, role);
      showNotification('User role updated!');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* CMS Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#1E1B4B]/40 to-[#0F172A] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Cloud PostgreSQL Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Publish courses, modules, MCQs, coding challenges, subscription plans, and manage platform data in real-time.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleSyncToSupabase}
            disabled={syncingSupa}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-md flex items-center gap-2 transition disabled:opacity-50"
            title="Verify Supabase Cloud PostgreSQL records and tables"
          >
            <Database className="w-4 h-4" />
            <span>{syncingSupa ? 'Verifying Supabase...' : '⚡ Verify Supabase Cloud'}</span>
          </button>

          <button
            onClick={handleImportDatasets}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Reload Datasets</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Overview & Stats', icon: BarChart3 },
          { id: 'settings', label: 'Live App & Dynamic CMS', icon: Sliders },
          { id: 'courses', label: 'Courses & Syllabus', icon: BookOpen },
          { id: 'questions', label: 'Theory & MCQs', icon: FileQuestion },
          { id: 'problems', label: 'Coding Problems', icon: Terminal },
          { id: 'plans', label: 'Plans & Coupons', icon: Crown },
          { id: 'datasets', label: 'Dataset Manager', icon: Database },
          { id: 'users', label: 'Students & Roles', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Total Students</span>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">{stats?.total_users || 0}</h3>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Active Pro Subscribers</span>
              <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats?.active_subscriptions || 0}</h3>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Total Submissions</span>
              <h3 className="text-2xl font-bold font-mono text-indigo-400 mt-1">{stats?.total_submissions || 0}</h3>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Total Revenue</span>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">₹{stats?.total_revenue || 0}</h3>
            </div>
          </div>

          {/* Live Recent Submissions Feed */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Live Student Sandbox Submissions</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono uppercase text-[10px]">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Problem</th>
                    <th className="pb-3">Language</th>
                    <th className="pb-3">Verdict</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stats?.recent_submissions?.map((s) => (
                    <tr key={s.id} className="py-2.5">
                      <td className="py-3 font-semibold text-white">{s.user_name}</td>
                      <td className="py-3 text-slate-300">{s.problem_title}</td>
                      <td className="py-3 font-mono text-indigo-300">{s.language}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          s.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-200">{s.score}%</td>
                      <td className="py-3 font-mono text-slate-400">{s.runtime_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DYNAMIC APP & CMS SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Live Dynamic Application Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Directly change hero headlines, top announcement bar, and feature flags live across Web & Mobile with zero code changes.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Top Announcement Bar Configuration */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Global Live Announcement Banner</h3>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.announcement_active}
                    onChange={(e) => setAdminSettings({ ...adminSettings, announcement_active: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <span>Show Banner Live</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-9">
                  <label className="text-xs text-slate-400 block mb-1">Banner Announcement Text</label>
                  <input
                    type="text"
                    value={adminSettings.announcement_text}
                    onChange={(e) => setAdminSettings({ ...adminSettings, announcement_text: e.target.value })}
                    placeholder="e.g. 🔥 Mid-Sem Exam Prep is Live! 100+ MCQs & Code Problems."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs text-slate-400 block mb-1">Alert Style</label>
                  <select
                    value={adminSettings.announcement_type}
                    onChange={(e) => setAdminSettings({ ...adminSettings, announcement_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="info">Info (Indigo/Blue)</option>
                    <option value="promo">Promo (Amber/Orange)</option>
                    <option value="warning">Warning / Notice (Rose)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Homepage Hero Branding */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Homepage Hero Headline & Branding</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Hero Pill / Badge Text</label>
                  <input
                    type="text"
                    value={adminSettings.hero_badge}
                    onChange={(e) => setAdminSettings({ ...adminSettings, hero_badge: e.target.value })}
                    placeholder="Curriculum for B.Tech CSE & Engineering Students"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Main Hero Headline</label>
                  <input
                    type="text"
                    value={adminSettings.hero_title}
                    onChange={(e) => setAdminSettings({ ...adminSettings, hero_title: e.target.value })}
                    placeholder="Master Programming & Ace Your Engineering Exams"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Hero Sub-Headline / Description</label>
                  <textarea
                    rows={2}
                    value={adminSettings.hero_subtitle}
                    onChange={(e) => setAdminSettings({ ...adminSettings, hero_subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags & Controls */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Feature Flags & Module Availability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.feature_coding_arena}
                    onChange={(e) => setAdminSettings({ ...adminSettings, feature_coding_arena: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <span>Coding Arena Enabled</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.feature_mcq_practice}
                    onChange={(e) => setAdminSettings({ ...adminSettings, feature_mcq_practice: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <span>MCQ Practice Bank Enabled</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.feature_pro_subscription}
                    onChange={(e) => setAdminSettings({ ...adminSettings, feature_pro_subscription: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <span>Pro Subscriptions Active</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl gradient-brand-btn text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save All Platform Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB: COURSES & SYLLABUS ================= */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create Course Form */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Create New B.Tech Course</span>
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Subject / Language</label>
                <select
                  value={newCourse.subject_id}
                  onChange={(e) => setNewCourse({ ...newCourse, subject_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Operating Systems & C"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Access Tier</label>
                  <select
                    value={newCourse.access_type}
                    onChange={(e) => setNewCourse({ ...newCourse, access_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="free">Free Access</option>
                    <option value="premium">Pro Premium</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newCourse.short_description}
                  onChange={(e) => setNewCourse({ ...newCourse, short_description: e.target.value })}
                  placeholder="Summary for catalog card..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl gradient-brand-btn text-white text-xs font-bold shadow"
              >
                Publish Course
              </button>
            </form>

            {/* Quick Module Add */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">Add Module to Existing Course</h4>
              <form onSubmit={handleCreateModule} className="space-y-2 text-xs">
                <select
                  value={newModule.course_id}
                  onChange={(e) => setNewModule({ ...newModule, course_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Module Title (e.g. Module 2: Trees & Graphs)"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold border border-slate-700"
                >
                  Add Module
                </button>
              </form>
            </div>
          </div>

          {/* Active Courses List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white">Active Courses Catalogue ({courses.length})</h3>
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.id} className="glass-card p-4 rounded-xl flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={c.thumbnail} alt={c.title} className="w-12 h-12 rounded-lg object-cover bg-slate-800" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="text-indigo-400">{c.subject_name}</span>
                        <span>•</span>
                        <span className={c.access_type === 'free' ? 'text-emerald-400' : 'text-amber-400'}>
                          {c.access_type.toUpperCase()}
                        </span>
                        <span>•</span>
                        <span>{c.lectures_count} lectures</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingItem({ type: 'course', data: { ...c } })}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                      title="Edit Course Live"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB: THEORY & MCQS ================= */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create MCQ Form */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Create Theory MCQ</span>
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Course</label>
                <select
                  value={newQuestion.course_id}
                  onChange={(e) => setNewQuestion({ ...newQuestion, course_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Question Text</label>
                <textarea
                  rows={2}
                  required
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="Enter the conceptual question..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block mb-1">4 MCQ Options</label>
                {newQuestion.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    required
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const opts = [...newQuestion.options];
                      opts[i] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: opts });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                  />
                ))}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Exact Correct Option String</label>
                <input
                  type="text"
                  required
                  placeholder="Paste the exact correct option text"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Concept Explanation</label>
                <textarea
                  rows={2}
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Explanation shown after answer attempt..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl gradient-brand-btn text-white text-xs font-bold shadow"
              >
                Add Question to Bank
              </button>
            </form>
          </div>

          {/* Active Questions List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-bold text-white">Question Bank ({questions.length})</h3>
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="glass-card p-3 rounded-xl flex items-center justify-between border border-slate-800 text-xs">
                  <div className="flex-1 min-w-0 mr-3">
                    <h4 className="font-semibold text-white truncate">{q.text}</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Answer: {q.correct_answer}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingItem({ type: 'question', data: { ...q } })}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded"
                      title="Edit Question Live"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: CODING PROBLEMS ================= */}
      {activeTab === 'problems' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create Coding Problem</span>
            </h3>

            <form onSubmit={handleCreateProblem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reverse Linked List"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Difficulty</label>
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Time Limit (sec)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProblem.time_limit_sec}
                    onChange={(e) => setNewProblem({ ...newProblem, time_limit_sec: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Problem Statement</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe problem statement and requirements..."
                  value={newProblem.statement}
                  onChange={(e) => setNewProblem({ ...newProblem, statement: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Sample Test Case (Public):</span>
                <input
                  type="text"
                  placeholder="Sample Stdin Input"
                  value={newProblem.sample_input}
                  onChange={(e) => setNewProblem({ ...newProblem, sample_input: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Sample Expected Output"
                  value={newProblem.sample_output}
                  onChange={(e) => setNewProblem({ ...newProblem, sample_output: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-emerald-400 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 font-mono">Hidden Test Case (Protected Graded):</span>
                <input
                  type="text"
                  placeholder="Hidden Stdin Input"
                  value={newProblem.hidden_input}
                  onChange={(e) => setNewProblem({ ...newProblem, hidden_input: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Hidden Expected Output"
                  value={newProblem.hidden_output}
                  onChange={(e) => setNewProblem({ ...newProblem, hidden_output: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-emerald-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl gradient-brand-btn text-white text-xs font-bold shadow"
              >
                Publish Problem & Test Cases
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Coding Problems Bank ({problems.length})</h3>
            <div className="space-y-2">
              {problems.map((p) => (
                <div key={p.id} className="glass-card p-3 rounded-xl flex items-center justify-between border border-slate-800 text-xs">
                  <div className="flex-1 min-w-0 mr-3">
                    <h4 className="font-bold text-white truncate">{p.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Difficulty: {p.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingItem({ type: 'problem', data: { ...p } })}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded"
                      title="Edit Problem Live"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProblem(p.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: PLANS & COUPONS ================= */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Create Discount Coupon</span>
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXAM90"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Type</label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow"
              >
                Create Coupon Code
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white">Active Subscription Tiers</h3>
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="glass-card p-4 rounded-xl flex items-center justify-between border border-slate-800 text-xs">
                  <div>
                    <h4 className="font-bold text-white">{p.name}</h4>
                    <span className="text-slate-400 font-mono">Price: ₹{p.price} / {p.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem({ type: 'plan', data: { ...p } })}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded"
                      title="Edit Plan Live"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DATASET MANAGER ================= */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <span>Curriculum Datasets Storage Engine</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Location: <code className="text-indigo-300">{datasetStatus?.datasets_directory || 'datasets/'}</code>
                </p>
              </div>

              <button
                onClick={handleImportDatasets}
                className="px-5 py-2 rounded-xl gradient-brand-btn text-white text-xs font-semibold shadow flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload & Seed All</span>
              </button>
            </div>

            {/* Files breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
              {datasetStatus && Object.entries(datasetStatus.files).map(([fname, finfo]) => (
                <div key={fname} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <span className="font-mono font-semibold text-white block">{fname}</span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Status: {finfo.exists ? 'Found' : 'Missing'}</span>
                    <span className="font-mono">{finfo.size_bytes} B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: STUDENTS & ROLES ================= */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Users & Role Permissions</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono uppercase text-[10px]">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Branch & Sem</th>
                  <th className="pb-3">Current Role</th>
                  <th className="pb-3">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="py-2.5">
                    <td className="py-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 text-slate-300">{u.college_branch} ({u.semester})</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-indigo-300 font-mono"
                      >
                        <option value="student">student</option>
                        <option value="content_manager">content_manager</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: IN-PLACE EDIT DIALOG ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-amber-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)} Live
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              {/* Course Edit Fields */}
              {editingItem.type === 'course' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Course Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, title: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Access Tier (Lock/Unlock)</label>
                      <select
                        value={editingItem.data.access_type || 'free'}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, access_type: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="free">Free Access (Unlocked)</option>
                        <option value="premium">Pro Premium (Locked for non-subscribers)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Level</label>
                      <select
                        value={editingItem.data.level || 'Beginner'}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, level: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Duration (Hours)</label>
                      <input
                        type="number"
                        value={editingItem.data.duration_hours || 10}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, duration_hours: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Thumbnail Image URL / Storage Path</label>
                    <input
                      type="text"
                      placeholder="https://... or /storage/thumbnails/course.png"
                      value={editingItem.data.thumbnail || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, thumbnail: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={editingItem.data.short_description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, short_description: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Detailed Syllabus / Description</label>
                    <textarea
                      rows={3}
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>
                </>
              )}

              {/* Module Edit Fields */}
              {editingItem.type === 'module' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Module Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, title: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Order Number</label>
                    <input
                      type="number"
                      value={editingItem.data.order_no || 1}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, order_no: parseInt(e.target.value) || 1 }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>
                </>
              )}

              {/* Lecture Edit Fields */}
              {editingItem.type === 'lecture' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Lecture Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, title: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={editingItem.data.duration_min || 20}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, duration_min: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Prerequisite Lecture ID (Lock Rule)</label>
                      <input
                        type="text"
                        placeholder="e.g. lec_py_101 or leave empty for unlocked"
                        value={editingItem.data.prerequisite_id || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, prerequisite_id: e.target.value || null }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Video Stream URL (YouTube Embed / MP4 file)</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/... or /storage/videos/lec1.mp4"
                      value={editingItem.data.video_url || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, video_url: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Lecture Notes & Content (Markdown)</label>
                    <textarea
                      rows={6}
                      value={editingItem.data.notes_markdown || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, notes_markdown: e.target.value }
                      })}
                      placeholder="# Lecture notes in Markdown..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs resize-y"
                    />
                  </div>
                </>
              )}

              {/* Theory Question Edit Fields */}
              {editingItem.type === 'question' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Question Text</label>
                    <textarea
                      rows={2}
                      required
                      value={editingItem.data.text || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, text: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 block mb-1">Options</label>
                    {(editingItem.data.options || []).map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const opts = [...editingItem.data.options];
                          opts[i] = e.target.value;
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, options: opts }
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Correct Answer String</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.correct_answer || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, correct_answer: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Explanation</label>
                    <textarea
                      rows={2}
                      value={editingItem.data.explanation || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, explanation: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>
                </>
              )}

              {/* Coding Problem Edit Fields */}
              {editingItem.type === 'problem' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Problem Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, title: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Difficulty</label>
                      <select
                        value={editingItem.data.difficulty || 'Easy'}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, difficulty: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Time Limit (sec)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingItem.data.time_limit_sec || 2.0}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, time_limit_sec: parseFloat(e.target.value) }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Problem Statement</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem.data.statement || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, statement: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white resize-none"
                    />
                  </div>
                </>
              )}

              {/* Plan Edit Fields */}
              {editingItem.type === 'plan' && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.name || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingItem.data.price || 0}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, price: parseFloat(e.target.value) }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        required
                        value={editingItem.data.duration_days || 30}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, duration_days: parseInt(e.target.value) }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-brand-btn text-white font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

