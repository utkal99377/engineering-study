import React, { useState, useEffect } from 'react';
import { X, BookOpen, Layers, Check } from 'lucide-react';

export const CourseModal = ({ isOpen, onClose, onSave, initialData, subjects = [] }) => {
  const isEditing = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    thumbnail: '',
    subject_id: '',
    category: 'Computer Science',
    level: 'Beginner',
    duration_hours: 10,
    duration_text: '8h 30m',
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        short_description: initialData.short_description || '',
        thumbnail: initialData.thumbnail || '',
        subject_id: initialData.subject_id || (subjects[0]?.id || ''),
        category: initialData.category || initialData.subject_name || 'Computer Science',
        level: initialData.level || 'Beginner',
        duration_hours: initialData.duration_hours || 10,
        duration_text: initialData.duration_text || `${initialData.duration_hours || 10}h 00m`,
        status: initialData.status || 'published',
      });
    } else {
      setFormData({
        title: '',
        short_description: '',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        subject_id: subjects[0]?.id || '',
        category: 'Computer Science',
        level: 'Beginner',
        duration_hours: 8,
        duration_text: '8h 30m',
        status: 'published',
      });
    }
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
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1F1F1F] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            {isEditing ? 'Edit Course' : 'Add New Course'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#666666] hover:text-white hover:bg-[#141414] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          
          {/* Course Name */}
          <div className="space-y-1">
            <label className="text-white font-medium block">
              Course Name <span className="text-[#666666]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Java, C++, Python"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label className="text-white font-medium block">
              Short Description <span className="text-[#666666]">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Learn Java programming from fundamentals to object-oriented programming."
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md resize-none focus:border-[#444444]"
            />
          </div>

          {/* Course Category & Difficulty Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-white font-medium block">
                Course Category
              </label>
              {subjects.length > 0 ? (
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Programming, Computer Science"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-white font-medium block">
                Difficulty Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Estimated Duration & Course Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-white font-medium block">
                Estimated Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 8h 30m or 12 hours"
                value={formData.duration_text}
                onChange={(e) => setFormData({ ...formData, duration_text: e.target.value })}
                className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-white font-medium block">
                Course Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Course Thumbnail URL / Icon */}
          <div className="space-y-1">
            <label className="text-white font-medium block">
              Course Thumbnail / Icon URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md font-mono text-[11px] focus:border-[#444444]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1F1F1F] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="mono-btn-secondary text-xs px-3.5 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="mono-btn-primary text-xs px-4 py-2"
            >
              {submitting ? 'Saving...' : 'Save Course'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
