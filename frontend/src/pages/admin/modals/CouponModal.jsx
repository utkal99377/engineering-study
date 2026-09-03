import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

export const CouponModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    value: 20,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        value: parseFloat(formData.value) || 0,
      });
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
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Create Discount Coupon
              </h3>
              <p className="text-xs text-slate-400">
                Generate promo codes for student checkouts
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
            <label className="text-slate-300 block mb-1.5 font-medium">Coupon Code (Uppercase)</label>
            <input
              type="text"
              required
              placeholder="e.g. SEMESTER50, EXAM90"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Discount Value</label>
              <input
                type="number"
                required
                min="1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#161922] border border-[#2B3042] rounded-xl p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Description</label>
            <textarea
              rows={2}
              placeholder="e.g. 50% discount for college exam prep"
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Activate Coupon'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
