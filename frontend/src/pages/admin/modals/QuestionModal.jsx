import React, { useState, useEffect } from 'react';
import { X, FileQuestion, CheckCircle2 } from 'lucide-react';

export const QuestionModal = ({ isOpen, onClose, onSave, initialData, courses = [] }) => {
  const isEditing = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    marks: 2,
    difficulty: 'Easy',
    is_important: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        course_id: initialData.course_id || (courses[0]?.id || ''),
        title: initialData.title || '',
        text: initialData.text || '',
        options: Array.isArray(initialData.options) && initialData.options.length === 4
          ? initialData.options
          : ['', '', '', ''],
        correct_answer: initialData.correct_answer || '',
        explanation: initialData.explanation || '',
        marks: initialData.marks || 2,
        difficulty: initialData.difficulty || 'Easy',
        is_important: initialData.is_important || false,
      });
    } else {
      setFormData({
        course_id: courses[0]?.id || '',
        title: '',
        text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        marks: 2,
        difficulty: 'Easy',
        is_important: false,
      });
    }
  }, [initialData, courses, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (idx, value) => {
    const updated = [...formData.options];
    const oldVal = updated[idx];
    updated[idx] = value;
    // If the correct answer matched the old value, update it
    let correct = formData.correct_answer;
    if (correct === oldVal && oldVal !== '') {
      correct = value;
    }
    setFormData({ ...formData, options: updated, correct_answer: correct });
  };

  const handleSelectCorrect = (optionVal) => {
    if (optionVal.trim()) {
      setFormData({ ...formData, correct_answer: optionVal });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.correct_answer) {
      alert('Please specify the correct answer by clicking "Mark as Correct" next to one of the options.');
      return;
    }
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
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit MCQ Question' : 'Add MCQ Question to Bank'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure conceptual question, 4 choices, correct answer, and explanation
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
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-slate-300 block mb-1.5 font-medium">Target Course</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Difficulty Level</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Question Text</label>
            <textarea
              rows={3}
              required
              placeholder="What is the worst-case time complexity of QuickSort when the pivot is always the smallest element?"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-3 text-white resize-none focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 4 MCQ Options */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">4 Answer Choices</label>
              <span className="text-[10px] text-indigo-400">Click a radio button to mark as the correct answer</span>
            </div>

            {formData.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isCorrect = formData.correct_answer && formData.correct_answer === opt && opt.trim() !== '';
              return (
                <div 
                  key={idx} 
                  className={`p-2 rounded-xl border flex items-center gap-2.5 transition ${
                    isCorrect ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-[#161922] border-[#2B3042]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectCorrect(opt)}
                    className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition ${
                      isCorrect 
                        ? 'bg-emerald-600 text-white shadow' 
                        : 'bg-[#1E2230] text-slate-400 hover:text-white'
                    }`}
                    title="Click to select this as the correct answer"
                  >
                    {letter}
                  </button>

                  <input
                    type="text"
                    required
                    placeholder={`Option ${letter} text...`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-none text-white text-xs focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleSelectCorrect(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      isCorrect 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {isCorrect ? '✓ Correct Answer' : 'Set as Correct'}
                  </button>
                </div>
              );
            })}
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Concept Explanation (shown after attempt)</label>
            <textarea
              rows={2}
              placeholder="Explain why this option is correct and why other options are incorrect..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
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
              {submitting ? 'Saving...' : (isEditing ? 'Save Question' : 'Add to Question Bank')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
