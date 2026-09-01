import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  BookOpen, 
  Terminal, 
  Award, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Crown, 
  Edit3,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = ({ onNavigate, onOpenSubscribe }) => {
  const { user, entitlement, refreshUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBranch(user.college_branch || '');
      setEditSemester(user.semester || '');
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [courses, subs, stats] = await Promise.all([
        api.getMyCourses(),
        api.getMySubmissions(),
        api.getPracticeStats(),
      ]);
      setEnrolledCourses(courses);
      setSubmissions(subs);
      setPracticeStats(stats);
    } catch (err) {
      console.error('Failed to load user profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.updateProfile({
        name: editName,
        college_branch: editBranch,
        semester: editSemester,
      });
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=engineer"}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-indigo-500/40 p-1"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                {user?.college_branch || 'CSE / IT'}
              </span>
              <span>•</span>
              <span className="text-slate-400">{user?.semester || '3rd Semester'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Drawer */}
      {isEditing && (
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Update Academic & Profile Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Engineering Branch</label>
              <input
                type="text"
                value={editBranch}
                onChange={(e) => setEditBranch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Current Semester</label>
              <input
                type="text"
                value={editSemester}
                onChange={(e) => setEditSemester(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 rounded-xl gradient-brand-btn text-white text-xs font-semibold shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono">Enrolled Courses</span>
          <h3 className="text-2xl font-bold font-mono text-white">{enrolledCourses.length}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono">MCQ Score Accuracy</span>
          <h3 className="text-2xl font-bold font-mono text-emerald-400">
            {practiceStats?.accuracy_percentage || 0}%
          </h3>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono">Coding Submissions</span>
          <h3 className="text-2xl font-bold font-mono text-indigo-400">{submissions.length}</h3>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>My Active Learning Roadmap</span>
          </h2>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl text-slate-500 text-xs">
            You haven't enrolled in any courses yet. Browse the catalog to begin!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledCourses.map((c) => (
              <div
                key={c.course_id}
                onClick={() => onNavigate('course-detail', c.course_id)}
                className="glass-card p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-indigo-500/40"
              >
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{c.title}</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{c.completed_lectures} / {c.total_lectures} Lectures</span>
                      <span className="text-indigo-300 font-bold">{c.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${c.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Coding Submissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>My Sandbox Submissions</span>
        </h2>

        {submissions.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl text-slate-500 text-xs">
            No code submissions recorded yet. Try solving problems in the Coding Arena!
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="divide-y divide-slate-800">
              {submissions.slice(0, 8).map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{sub.problem_title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Language: {sub.language} • Passed: {sub.passed_test_cases}/{sub.total_test_cases} • Runtime: {sub.runtime_ms}ms
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-semibold ${
                    sub.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
