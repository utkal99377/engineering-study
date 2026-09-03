import React, { useState, useEffect } from 'react';
import { Sliders, Megaphone, Sparkles, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SettingsTab = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState({
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Top Control Bar with Save Action */}
        <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Live Dynamic Platform Customizer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly adjust announcements, hero headlines, and feature flags with zero app rebuilds.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition disabled:opacity-50 self-end sm:self-auto shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Live...' : 'Save & Publish Live'}</span>
          </button>
        </div>

        {/* Global Live Announcement Banner */}
        <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2230] pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Global Announcement Banner</h3>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcement_active}
                onChange={(e) => setFormData({ ...formData, announcement_active: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
              <span>Show Banner Live</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-9">
              <label className="text-slate-300 block mb-1 font-medium">Banner Text</label>
              <input
                type="text"
                value={formData.announcement_text}
                onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
                placeholder="🔥 Mid-Sem Exam Prep is Live! 100+ MCQs & Code Problems."
                className="w-full bg-[#161924] border border-[#2B3042] rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-slate-300 block mb-1 font-medium">Alert Style</label>
              <select
                value={formData.announcement_type}
                onChange={(e) => setFormData({ ...formData, announcement_type: e.target.value })}
                className="w-full bg-[#161924] border border-[#2B3042] rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="info">Info (Indigo / Blue)</option>
                <option value="promo">Promo (Amber / Gold)</option>
                <option value="warning">Warning (Rose / Red)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Homepage Hero Branding */}
        <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1E2230] pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Homepage Hero Headline & Copy</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Hero Pill / Badge Text</label>
              <input
                type="text"
                value={formData.hero_badge}
                onChange={(e) => setFormData({ ...formData, hero_badge: e.target.value })}
                placeholder="Curriculum for B.Tech CSE & Engineering Students"
                className="w-full bg-[#161924] border border-[#2B3042] rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Main Hero Headline</label>
              <input
                type="text"
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                placeholder="Master Programming & Ace Your Engineering Exams"
                className="w-full bg-[#161924] border border-[#2B3042] rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Hero Sub-Headline / Description</label>
              <textarea
                rows={2}
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                className="w-full bg-[#161924] border border-[#2B3042] rounded-xl p-2.5 text-white resize-none focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags & Controls */}
        <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#1E2230] pb-3">
            Feature Flags & Platform Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#161924] border border-[#262B3D] cursor-pointer hover:border-[#383E54] transition">
              <input
                type="checkbox"
                checked={formData.feature_coding_arena}
                onChange={(e) => setFormData({ ...formData, feature_coding_arena: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
              <span className="font-medium text-slate-200">Coding Arena Enabled</span>
            </label>

            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#161924] border border-[#262B3D] cursor-pointer hover:border-[#383E54] transition">
              <input
                type="checkbox"
                checked={formData.feature_mcq_practice}
                onChange={(e) => setFormData({ ...formData, feature_mcq_practice: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
              <span className="font-medium text-slate-200">MCQ Bank Practice Enabled</span>
            </label>

            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#161924] border border-[#262B3D] cursor-pointer hover:border-[#383E54] transition">
              <input
                type="checkbox"
                checked={formData.feature_pro_subscription}
                onChange={(e) => setFormData({ ...formData, feature_pro_subscription: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
              <span className="font-medium text-slate-200">Pro Subscriptions Active</span>
            </label>
          </div>
        </div>

      </form>

    </div>
  );
};
