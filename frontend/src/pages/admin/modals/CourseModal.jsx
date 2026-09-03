import React, { useState, useEffect } from 'react';
import { X, BookOpen, Layers, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

export const THUMBNAIL_PRESETS = [
  { label: 'DSA & Algorithms', url: 'https://images.unsplash.com/photo-1516116211227-bbc03a958e0a?w=600&auto=format&fit=crop&q=80', tag: 'DSA' },
  { label: 'Python & AI / ML', url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80', tag: 'Python' },
  { label: 'C++ & Systems', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', tag: 'C++' },
  { label: 'Fullstack Web Dev', url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&auto=format&fit=crop&q=80', tag: 'WebDev' },
  { label: 'Databases & SQL', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80', tag: 'DBMS' },
  { label: 'Cloud & DevOps', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', tag: 'DevOps' },
];

export const CourseModal = ({ isOpen, onClose, onSave, initialData, subjects }) => {
  const isEditing = Boolean(initialData?.id);
  const [formTab, setFormTab] = useState('basics'); // basics, details, thumbnail
  const [formData, setFormData] = useState({
    subject_id: '',
    title: '',
    slug: '',
    access_type: 'free',
    level: 'Beginner',
    duration_hours: 10,
    tags: '',
    thumbnail: THUMBNAIL_PRESETS[1].url,
    short_description: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        subject_id: initialData.subject_id || (subjects[0]?.id || ''),
        title: initialData.title || '',
        slug: initialData.slug || '',
        access_type: initialData.access_type || 'free',
        level: initialData.level || 'Beginner',
        duration_hours: initialData.duration_hours || 10,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
        thumbnail: initialData.thumbnail || THUMBNAIL_PRESETS[1].url,
        short_description: initialData.short_description || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        subject_id: subjects[0]?.id || '',
        title: '',
        slug: '',
        access_type: 'free',
        level: 'Beginner',
        duration_hours: 10,
        tags: 'Engineering, Coding',
        thumbnail: THUMBNAIL_PRESETS[1].url,
        short_description: '',
        description: '',
      });
    }
    setFormTab('basics');
  }, [initialData, subjects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl clean-panel border border-[#2A2E3D] shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden bg-[#111319]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#232634] flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit B.Tech Course' : 'Create New B.Tech Course'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Modify curriculum details, tier access, and metadata' : 'Publish a new engineering course live for students'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2230] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#232634] px-6 bg-[#0E1017]">
          {[
            { id: 'basics', label: '1. Basic Info' },
            { id: 'details', label: '2. Syllabus & Overview' },
            { id: 'thumbnail', label: '3. Media & Thumbnail' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFormTab(tab.id)}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
                formTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: BASICS */}
          {formTab === 'basics' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Subject / Discipline</label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.icon || 'discipline'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms with C++"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Access Tier</label>
                  <select
                    value={formData.access_type}
                    onChange={(e) => setFormData({ ...formData, access_type: e.target.value })}
                    className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="free">Free Access (Unlocked for All)</option>
                    <option value="premium">Pro Pass (Requires Active Subscription)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Academic Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Beginner">Beginner (1st & 2nd Semester)</option>
                    <option value="Intermediate">Intermediate (3rd & 4th Semester)</option>
                    <option value="Advanced">Advanced (5th - 8th Semester / Placements)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Estimated Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 10 })}
                    className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Topic Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="DSA, C++, Trees, Graphs"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {formTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Short Catalog Summary</label>
                <textarea
                  rows={2}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Concise 1-2 sentence overview displayed on course cards..."
                  className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white resize-none focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Complete Syllabus & Outcomes (Markdown Supported)</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="### Course Overview&#10;Key learning objectives, prerequisites, and semester relevance..."
                  className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono text-xs resize-y focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: THUMBNAIL */}
          {formTab === 'thumbnail' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-2 font-medium">Select a Theme Preset</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THUMBNAIL_PRESETS.map((p) => {
                    const isSelected = formData.thumbnail === p.url;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: p.url })}
                        className={`p-2 rounded-xl border text-left transition relative overflow-hidden group ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-white'
                            : 'border-[#2B3042] bg-[#161922] text-slate-400 hover:border-[#3D445D]'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded-lg mb-1.5" />
                        <span className="text-[11px] font-semibold truncate block">{p.label}</span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Or Custom Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {formData.thumbnail && (
                <div className="p-3 rounded-xl bg-[#161922] border border-[#2B3042] flex items-center gap-3">
                  <img src={formData.thumbnail} alt="Preview" className="w-16 h-12 rounded object-cover" />
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-200 font-semibold block">Active Thumbnail Preview</span>
                    <span className="truncate block max-w-sm">{formData.thumbnail}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#232634] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {formTab !== 'basics' && (
                <button
                  type="button"
                  onClick={() => setFormTab(formTab === 'thumbnail' ? 'details' : 'basics')}
                  className="px-3.5 py-2 rounded-xl bg-[#1E2230] text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Previous
                </button>
              )}
              {formTab !== 'thumbnail' && (
                <button
                  type="button"
                  onClick={() => setFormTab(formTab === 'basics' ? 'details' : 'thumbnail')}
                  className="px-3.5 py-2 rounded-xl bg-[#1E2230] text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Next Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1E2230] text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Course Live')}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
