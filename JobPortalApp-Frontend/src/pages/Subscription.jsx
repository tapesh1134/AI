import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSubscription, fetchMySubscriptions } from '../redux/subscriptionSlice';
import { useNavigate } from 'react-router-dom';
import { 
    Check, Zap, Crown, ShieldCheck, ArrowRight, 
    Info, CreditCard, TrendingUp 
} from 'lucide-react';

const Subscription = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { active } = useSelector(state => state.subscription);
  const { list: allJobs } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMySubscriptions());
  }, [dispatch]);

  const myJobsCount = allJobs.filter(j => j.postedBy === user?.email).length;
  const currentSub = active?.find(s => s.status === 'SUBSCRIBED');

  const plans = [
    { 
        name: 'FREE', price: '0', duration: 'Forever', icon: <Info />, 
        features: ['Post up to 5 Jobs', 'Basic Applicant Tracking', 'Email Support'],
    },
    { 
        name: 'MONTHLY', price: '999', duration: '1 Month', icon: <Zap />, 
        features: ['Unlimited Job Posts', 'Advanced Filters', 'Direct Messaging'],
    },
    { 
        name: 'QUARTERLY', price: '2,499', duration: '3 Months', icon: <Zap />, 
        features: ['Everything in Monthly', 'Featured Job Tag', 'CSV Exports'],
        popular: true 
    },
    { 
        name: 'HALF_YEARLY', price: '4,499', duration: '6 Months', icon: <Crown />, 
        features: ['Everything in Quarterly', 'Priority Support', 'Custom Branding'],
    },
    { 
        name: 'FULL_YEAR', price: '7,999', duration: '12 Months', icon: <Crown />, 
        features: ['Everything in Half-Yearly', 'Dedicated Account Manager', '2 Months Free Included'],
        bestValue: true 
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-4">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Stripe Secure Infrastructure</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 text-balance">Fuel your recruitment engine.</h1>
            <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm">
                Choose a plan that scales with your hiring needs. Upgrade or downgrade at any time.
            </p>
        </header>

        {/* FREE USAGE TRACKER */}
        {!currentSub && (
            <div className="max-w-md mx-auto bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-12 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Usage</p>
                    <h4 className="text-sm font-bold text-slate-900">{myJobsCount} / 5 Free Slots Used</h4>
                </div>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${Math.min((myJobsCount / 5) * 100, 100)}%` }} />
                </div>
            </div>
        )}

        {/* PRICING GRID - Dynamic columns for 5 plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan) => {
                const isActive = currentSub ? currentSub.plan === plan.name : plan.name === 'FREE';
                
                return (
                    <div key={plan.name} className={`relative bg-white p-6 rounded-[2.5rem] border-2 transition-all flex flex-col h-full ${
                        plan.popular ? 'border-blue-600 shadow-2xl shadow-blue-100 xl:scale-105 z-10' : 
                        plan.bestValue ? 'border-amber-400 shadow-xl shadow-amber-50' : 'border-slate-100'
                    }`}>
                        
                        {/* Badges */}
                        {plan.popular && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Recommended</span>
                        )}
                        {plan.bestValue && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><TrendingUp size={10}/> Best Value</span>
                        )}
                        
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${plan.name === 'FREE' ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'}`}>
                            {plan.icon}
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{plan.name.replace('_', ' ')}</h3>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-6">{plan.duration}</p>
                        
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase">/ {plan.name === 'FREE' ? 'Limit' : 'Plan'}</span>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map(feat => (
                                <li key={feat} className="flex items-start gap-3 text-[11px] font-bold text-slate-500 leading-tight">
                                    <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <button 
                            disabled={isActive}
                            onClick={() => plan.name !== 'FREE' && dispatch(createSubscription(plan.name))}
                            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                isActive 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg'
                            }`}
                        >
                            {isActive ? 'Active Now' : plan.name === 'FREE' ? 'Default' : 'Select Plan'}
                        </button>
                    </div>
                )
            })}
        </div>

        {/* FOOTER LINK */}
        <div className="mt-16 text-center">
            <button 
                onClick={() => navigate('/billing')} 
                className="group inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all"
            >
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                    <CreditCard size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">
                    Access Billing Center & Invoice Records
                </span>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;