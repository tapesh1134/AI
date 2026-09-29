import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import {
  Search, Users, ArrowRight, Building2,
  Zap, Globe, ShieldCheck, Sparkles,
  Mail, Lock, Loader2, LayoutDashboard,
  Eye, EyeOff // Added Icons
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  // Local state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added state

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/oauth2/api/auth/oauth2/authorization/${provider}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden">

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 sm:pt-15 pb-16 sm:pb-15 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent -z-10" />

        <div className="max-w-7xl mx-auto">
          {!isAuthenticated ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-200">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">The Future of Talent</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
                  Hiring. <br />
                  <span className="text-indigo-600 italic">Evolved.</span>
                </h1>
                <p className="max-w-xl mx-auto lg:mx-0 text-slate-500 text-lg font-medium leading-relaxed">
                  Join the elite network connecting ambitious companies with world-class professionals.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-400">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><ShieldCheck size={16} className="text-emerald-500" /> Verified</div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Zap size={16} className="text-amber-500" /> Real-time</div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Globe size={16} className="text-blue-500" /> Global</div>
                </div>
              </div>

              {/* LOGIN CARD - MATCHED TO SIGNUP UI */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 font-medium mt-1">Login to your professional portal</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        {error}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type="email"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:bg-white focus:border-indigo-600/20 outline-none transition-all font-medium"
                          placeholder="name@company.com"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <Link to="/forgot-password" title="reset" className="text-[11px] font-bold text-indigo-600 hover:underline">Forgot Password?</Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:bg-white focus:border-indigo-600/20 outline-none transition-all font-medium"
                          placeholder="Enter your password"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="bg-white px-4 text-slate-400">Social Access</span>
                    </div>
                  </div>

                  {/* <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSocialLogin('google')} 
                      disabled
                      className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm active:scale-95"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" /> Google
                    </button>
                    <button 
                      onClick={() => handleSocialLogin('github')} 
                      className="flex items-center justify-center gap-3 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-xs shadow-xl active:scale-95"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      GitHub
                    </button>
                  </div> */}

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSocialLogin('google')}
                      disabled
                      title="OAuth does not work on non-secure domains (HTTP). Use localhost or HTTPS."
                      className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl bg-slate-100 cursor-not-allowed font-bold text-slate-500 text-xs shadow-sm"
                    >
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="w-4 h-4"
                        alt="Google"
                      />
                      Google
                    </button>

                    <button
                      onClick={() => handleSocialLogin('github')}
                      disabled
                      title="OAuth does not work on non-secure domains (HTTP). Use localhost or HTTPS."
                      className="flex items-center justify-center gap-3 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-xs shadow-xl active:scale-95"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      GitHub
                    </button>

                    <p className="col-span-2 text-center text-[11px] text-slate-500 mt-1">
                      OAuth login does not work on non-secure domains (HTTP). This will work on{" "}
                      <span className="font-semibold">localhost</span> or{" "}
                      <span className="font-semibold">HTTPS</span>.
                    </p>
                  </div>

                  <p className="text-center text-slate-500 mt-10 text-sm font-medium">
                    New to the portal?{' '}
                    <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* --- LOGGED IN VIEW --- */
            <div className="text-center py-12 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Active Workspace</span>
              </div>
              <h1 className="text-5xl sm:text-8xl font-black text-slate-900 tracking-tighter leading-none">
                Hello, <span className="text-indigo-600 uppercase italic">{user?.email?.split('@')[0]}</span>
              </h1>
              <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium">
                Your professional journey continues. Browse new opportunities or manage your current applications.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
                >
                  <LayoutDashboard size={20} /> Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                >
                  <Search size={20} /> Find Jobs
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-6xl mx-auto px-6 pb-20 sm:pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 py-8 sm:py-12 px-6 sm:px-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />
          <StatItem value="12k+" label="Live Positions" />
          <StatItem value="500+" label="Global Partners" />
          <StatItem value="98%" label="Success Rate" />
          <StatItem value="24h" label="Avg. Response" />
        </div>
      </section>

      {/* 3. PATHWAYS */}
      <section className="max-w-6xl mx-auto px-6 pb-20 sm:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="group bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 hover:border-indigo-400 transition-all shadow-sm flex flex-col items-start relative overflow-hidden">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Users size={28} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">I'm a Candidate</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Manage your career with a professional pipeline and access roles from top-tier tech companies.
            </p>
            <button onClick={() => navigate('/jobs')} className="flex items-center gap-3 text-indigo-600 font-black text-[11px] uppercase tracking-widest hover:gap-5 transition-all">
              Browse Openings <ArrowRight size={18} />
            </button>
          </div>

          <div className="group bg-slate-900 p-8 sm:p-12 rounded-[3rem] transition-all shadow-2xl flex flex-col items-start relative overflow-hidden">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-8">
              <Building2 size={28} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">I'm a Recruiter</h3>
            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
              Post opportunities, track top talent, and build your dream team with advanced analytics.
            </p>
            <button onClick={() => navigate('/post-job')} className="flex items-center gap-3 text-white font-black text-[11px] uppercase tracking-widest hover:text-indigo-400 transition-all">
              Post Opportunity <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      {!isAuthenticated && (
        <section className="py-20 sm:py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-indigo-600 p-12 sm:p-24 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
            <h2 className="text-4xl sm:text-6xl font-black mb-10 tracking-tighter leading-tight">Ready to evolve <br /> your career?</h2>
            <button
              onClick={() => navigate('/signup')}
              className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl active:scale-95"
            >
              Get Started for Free
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 text-center">
    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
  </div>
);

export default Home;