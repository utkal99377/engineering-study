import React, { useState, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';

export const SubjectModal = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditing = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'code',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        icon: initialData.icon || 'code',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        icon: 'code',
        description: '',
      });
    }
  }, [initialData, isOpen]);

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
      <div className="w-full max-w-md clean-panel border border-[#2A2E3D] shadow-2xl rounded-2xl flex flex-col overflow-hidden bg-[#111319]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232634] flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Subject / Discipline' : 'Add New Discipline'}
              </h3>
              <p className="text-xs text-slate-400">
                Categorize courses under engineering branches
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Subject / Branch Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence & Machine Learning"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Icon Identifier</label>
            <input
              type="text"
              placeholder="code, cpu, database, cloud, terminal, globe"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Description</label>
            <textarea
              rows={3}
              placeholder="Short description of this engineering domain..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white resize-none focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#232634] flex items-center justify-end gap-2.5">
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
              {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Subject')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
