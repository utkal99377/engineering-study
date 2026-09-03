import React, { useState, useEffect } from 'react';
import { X, Terminal, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProblemModal = ({ isOpen, onClose, onSave, initialData, courses = [] }) => {
  const isEditing = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    difficulty: 'Easy',
    statement: '',
    time_limit_sec: 2.0,
    sample_input: '',
    sample_output: '',
    hidden_input: '',
    hidden_output: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Parse sample and hidden test cases if present
      let sampleIn = '';
      let sampleOut = '';
      let hiddenIn = '';
      let hiddenOut = '';

      if (Array.isArray(initialData.test_cases)) {
        const sampleCase = initialData.test_cases.find((tc) => !tc.is_hidden);
        const hiddenCase = initialData.test_cases.find((tc) => tc.is_hidden);
        if (sampleCase) {
          sampleIn = sampleCase.input_data || '';
          sampleOut = sampleCase.expected_output || '';
        }
        if (hiddenCase) {
          hiddenIn = hiddenCase.input_data || '';
          hiddenOut = hiddenCase.expected_output || '';
        }
      }

      setFormData({
        id: initialData.id,
        course_id: initialData.course_id || (courses[0]?.id || ''),
        title: initialData.title || '',
        difficulty: initialData.difficulty || 'Easy',
        statement: initialData.statement || '',
        time_limit_sec: initialData.time_limit_sec || 2.0,
        sample_input: sampleIn,
        sample_output: sampleOut,
        hidden_input: hiddenIn,
        hidden_output: hiddenOut,
      });
    } else {
      setFormData({
        course_id: courses[0]?.id || '',
        title: '',
        difficulty: 'Easy',
        statement: '',
        time_limit_sec: 2.0,
        sample_input: '',
        sample_output: '',
        hidden_input: '',
        hidden_output: '',
      });
    }
  }, [initialData, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const test_cases = [];
      if (formData.sample_input && formData.sample_output) {
        test_cases.push({
          input_data: formData.sample_input,
          expected_output: formData.sample_output,
          is_hidden: false,
          explanation: 'Sample Case',
        });
      }
      if (formData.hidden_input && formData.hidden_output) {
        test_cases.push({
          input_data: formData.hidden_input,
          expected_output: formData.hidden_output,
          is_hidden: true,
          explanation: 'Hidden Benchmark Case',
        });
      }

      const payload = {
        ...formData,
        time_limit_sec: parseFloat(formData.time_limit_sec) || 2.0,
        test_cases,
      };

      await onSave(payload);
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Coding Problem' : 'Publish Coding Sandbox Problem'}
              </h3>
              <p className="text-xs text-slate-400">
                Setup problem statement, runtime limits, and test case benchmarks
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
              <label className="text-slate-300 block mb-1.5 font-medium">Problem Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Invert a Binary Tree"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Associated Course</label>
              <select
                value={formData.course_id || ''}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value || null })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">General Coding Arena</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Time Limit (Seconds)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={formData.time_limit_sec}
                onChange={(e) => setFormData({ ...formData, time_limit_sec: parseFloat(e.target.value) || 2.0 })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Problem Statement (Markdown Supported)</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the problem, input format, constraints, and output format..."
              value={formData.statement}
              onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-3 text-white font-mono text-xs resize-y focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Test Case Builders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Public Sample Test Case */}
            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#2B3042] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200">Public Sample Case (Visible)</span>
                <span className="text-[10px] text-slate-400 font-mono">Example 1</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Sample Stdin Input</label>
                <input
                  type="text"
                  placeholder="e.g. 5&#10;1 2 3 4 5"
                  value={formData.sample_input}
                  onChange={(e) => setFormData({ ...formData, sample_input: e.target.value })}
                  className="w-full bg-[#0E1017] border border-[#2B3042] rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Expected Output</label>
                <input
                  type="text"
                  placeholder="e.g. 15"
                  value={formData.sample_output}
                  onChange={(e) => setFormData({ ...formData, sample_output: e.target.value })}
                  className="w-full bg-[#0E1017] border border-[#2B3042] rounded-lg p-2 text-emerald-400 font-mono text-xs"
                />
              </div>
            </div>

            {/* Hidden Graded Benchmark Case */}
            <div className="p-3.5 rounded-xl bg-[#161922] border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  Hidden Benchmark Case
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">Graded Run</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Hidden Stdin Input</label>
                <input
                  type="text"
                  placeholder="e.g. 100&#10;..."
                  value={formData.hidden_input}
                  onChange={(e) => setFormData({ ...formData, hidden_input: e.target.value })}
                  className="w-full bg-[#0E1017] border border-[#2B3042] rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Hidden Expected Output</label>
                <input
                  type="text"
                  placeholder="e.g. 5050"
                  value={formData.hidden_output}
                  onChange={(e) => setFormData({ ...formData, hidden_output: e.target.value })}
                  className="w-full bg-[#0E1017] border border-[#2B3042] rounded-lg p-2 text-emerald-400 font-mono text-xs"
                />
              </div>
            </div>

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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (isEditing ? 'Save Problem' : 'Publish Problem to Arena')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
