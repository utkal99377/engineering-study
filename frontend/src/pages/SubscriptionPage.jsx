import React, { useEffect, useState } from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Tag, 
  Receipt, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SubscriptionPage = ({ onOpenSubscribe }) => {
  const { user, entitlement } = useAuth();
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [plansData, historyData] = await Promise.all([
        api.getPlans(),
        user ? api.getPaymentHistory() : Promise.resolve([]),
      ]);
      setPlans(plansData);
      setInvoices(historyData);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Flexible Engineering Subscription Plans</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Accelerate Your Career with <span className="gradient-text">B.Tech Pro</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Get complete access to advanced DSA placement curricula, private video streams, downloadable notes, and unlimited sandbox submissions.
        </p>
      </div>

      {/* Current Active Plan Status Banner */}
      {entitlement && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Your Current Status</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{entitlement.plan_name}</span>
                {entitlement.is_premium && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-normal">Active</span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {entitlement.days_remaining > 0 && entitlement.days_remaining < 9000 && (
              <span className="text-xs font-mono text-slate-400">
                Expires in {entitlement.days_remaining} days
              </span>
            )}
            <button
              onClick={() => onOpenSubscribe()}
              className="px-5 py-2 rounded-xl gradient-brand-btn text-white text-xs font-semibold shadow"
            >
              {entitlement.is_premium ? 'Change / Extend Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      )}

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = entitlement?.plan_id === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative glass-card rounded-3xl p-8 flex flex-col justify-between border transition-all ${
                plan.is_popular
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold uppercase tracking-wider shadow-lg">
                  Most Popular for Students
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-xs text-slate-400">/{plan.duration_days} days</span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Included Perks:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {plan.features?.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => onOpenSubscribe(plan.id)}
                  className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                    plan.is_popular
                      ? 'gradient-brand-btn text-white hover:scale-[1.02]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{plan.price === 0 ? 'Get Started' : 'Subscribe Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice & Payment History */}
      {invoices.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Billing & Payment Invoices</h2>
          </div>

          <div className="divide-y divide-slate-800">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">{inv.plan_name}</span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Ref: {inv.reference} {inv.coupon_used && `• Coupon: ${inv.coupon_used}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white">₹{inv.amount}</span>
                  <span className="block text-[10px] text-emerald-400 uppercase font-semibold">Success</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
