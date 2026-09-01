import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SubscriptionModal = ({ isOpen, onClose, defaultPlanId = null }) => {
  const { user, refreshEntitlement, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setCouponCode('');
      setCouponResult(null);
      setSuccessData(null);
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data);
      if (defaultPlanId) {
        const found = data.find(p => p.id === defaultPlanId);
        setSelectedPlan(found || data[1] || data[0]);
      } else {
        setSelectedPlan(data.find(p => p.is_popular) || data[1] || data[0]);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(couponCode, selectedPlan.id);
      setCouponResult(res);
    } catch (err) {
      setCouponResult({ is_valid: false, message: err.message });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan || checkingOut) return;
    setCheckingOut(true);
    try {
      const res = await api.checkout(selectedPlan.id, couponResult?.is_valid ? couponResult.coupon_code : null);
      setSuccessData(res);
      await refreshEntitlement();
    } catch (err) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Unlock B.Tech Pro Entitlement</h2>
              <p className="text-xs text-slate-400">Unlimited access to advanced DSA, OOP, sandbox runs & test bank</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successData ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Subscription Activated!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {successData.message}
              </p>
              <div className="inline-block p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300">
                Plan: {successData.plan_name} • Paid: ₹{successData.amount_paid}
              </div>
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl gradient-brand-btn text-white text-xs font-semibold shadow-lg"
                >
                  Start Learning Now
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => { setSelectedPlan(plan); setCouponResult(null); }}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.is_popular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider shadow">
                          Most Popular
                        </span>
                      )}

                      <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                      <div className="my-2 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-white font-mono">
                          {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-xs text-slate-400">/{plan.duration_days}d</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">{plan.description}</p>

                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {plan.features?.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Promo Coupon Box */}
              {selectedPlan && selectedPlan.price > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Try coupon 'BTECH50' or 'FRESHER100'"
                        className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-500 w-full"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {couponResult && (
                    <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                      couponResult.is_valid ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {couponResult.is_valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{couponResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Total Due:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-white">
                      ₹{couponResult?.is_valid ? couponResult.final_price : (selectedPlan?.price || 0)}
                    </span>
                    {couponResult?.is_valid && (
                      <span className="text-xs text-slate-500 line-through">₹{selectedPlan?.price}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="px-6 py-2.5 rounded-xl gradient-brand-btn text-white text-xs font-semibold shadow-lg flex items-center gap-2 hover:scale-[1.02] transition"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{checkingOut ? 'Simulating Payment...' : 'Confirm & Activate Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
