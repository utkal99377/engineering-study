import React, { useState, useEffect } from 'react';
import { X, Video, Lock, FileText, Eye, Edit3, CheckCircle2 } from 'lucide-react';

export const LectureModal = ({ isOpen, onClose, onSave, initialData, availableLectures = [], moduleName = '' }) => {
  const isEditing = Boolean(initialData?.id);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [formData, setFormData] = useState({
    title: '',
    duration_min: 20,
    video_url: '',
    prerequisite_id: '',
    notes_markdown: '# Lecture Overview\n\n### Core Concepts\nWrite equations, code snippets, and explanations in Markdown...',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        module_id: initialData.module_id,
        title: initialData.title || '',
        duration_min: initialData.duration_min || 20,
        video_url: initialData.video_url || '',
        prerequisite_id: initialData.prerequisite_id || '',
        notes_markdown: initialData.notes_markdown || '',
      });
    } else {
      setFormData({
        title: '',
        duration_min: 20,
        video_url: '',
        prerequisite_id: '',
        notes_markdown: `# ${moduleName || 'Lecture Notes'}\n\n### Summary\nWrite key takeaways, diagrams, and code explanation here in Markdown.`,
      });
    }
    setActiveTab('editor');
  }, [initialData, moduleName, isOpen]);

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
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232634] flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Lecture' : 'Add Lecture to Module'}
              </h3>
              <p className="text-xs text-slate-400">
                {moduleName ? `Module: ${moduleName}` : 'Configure video streams, notes, and sequential unlock rules'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Lecture Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 1.2 Binary Search Trees & Tree Traversals"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Estimated Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration_min}
                onChange={(e) => setFormData({ ...formData, duration_min: parseInt(e.target.value) || 20 })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium flex items-center justify-between">
                <span>Prerequisite Lecture</span>
                <span className="text-[10px] text-amber-400 font-normal">Sequential Lock</span>
              </label>
              <select
                value={formData.prerequisite_id || ''}
                onChange={(e) => setFormData({ ...formData, prerequisite_id: e.target.value || null })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">None (Available from start)</option>
                {availableLectures
                  .filter((l) => l.id !== formData.id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      Requires: {l.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Video Stream URL</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=... or /storage/videos/lec1.mp4"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Supports standard YouTube URLs, Vimeo URLs, or local MP4 files from storage.
            </span>
          </div>

          {/* Notes Markdown Editor with Preview Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">Lecture Notes & Explanations (Markdown)</label>
              <div className="flex items-center gap-1 bg-[#161922] border border-[#2B3042] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3 h-3 inline mr-1" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Live Preview
                </button>
              </div>
            </div>

            {activeTab === 'editor' ? (
              <textarea
                rows={8}
                value={formData.notes_markdown}
                onChange={(e) => setFormData({ ...formData, notes_markdown: e.target.value })}
                placeholder="# Lecture notes in Markdown..."
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-3 text-white font-mono text-xs resize-y focus:border-indigo-500 focus:outline-none"
              />
            ) : (
              <div className="w-full bg-[#0E1017] border border-[#2B3042] rounded-xl p-4 min-h-[190px] max-h-[300px] overflow-y-auto text-slate-300 prose prose-invert prose-xs">
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {formData.notes_markdown || 'No notes written yet.'}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#232634] flex items-center justify-end gap-2.5">
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
              {submitting ? 'Saving...' : (isEditing ? 'Save Lecture' : 'Publish Lecture to Module')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
