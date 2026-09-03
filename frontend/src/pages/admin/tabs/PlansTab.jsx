import React from 'react';
import { Crown, Plus, Tag, Edit3, Trash2, CheckCircle2, IndianRupee, Clock } from 'lucide-react';

export const PlansTab = ({ plans = [], onCreatePlan, onEditPlan, onDeletePlan, onCreateCoupon }) => {
  return (
    <div className="space-y-8">
      
      {/* SECTION 1: SUBSCRIPTION PLANS */}
      <div className="space-y-4">
        <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pro Subscription Tiers & Pricing ({plans.length})
              </h3>
              <p className="text-xs text-slate-400">
                Manage student premium plans, pricing, and validity duration
              </p>
            </div>
          </div>

          <button
            onClick={onCreatePlan}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition self-end sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan Tier</span>
          </button>
        </div>

        {/* Plan Cards */}
        {plans.length === 0 ? (
          <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
            <Crown className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No subscription tiers configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first plan (e.g. "Pro Semester Pass - ₹499 / 180 Days").
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className="clean-card bg-[#11141E] border border-[#222634] rounded-2xl p-5 hover:border-amber-500/40 flex flex-col justify-between gap-4 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Tier
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {p.duration_days} days validity
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{p.name}</h4>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-mono text-white">₹{p.price}</span>
                    <span className="text-xs text-slate-400">/ {p.duration_days} days</span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-400">{p.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1E2230] flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditPlan(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                    title="Edit Plan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: DISCOUNT COUPONS */}
      <div className="space-y-4">
        <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Discount Coupons & Promotional Codes
              </h3>
              <p className="text-xs text-slate-400">
                Create and manage instant checkout discounts for engineering students
              </p>
            </div>
          </div>

          <button
            onClick={onCreateCoupon}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition self-end sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon Code</span>
          </button>
        </div>
      </div>

    </div>
  );
};
