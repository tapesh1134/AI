import React from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setRole } from '../redux/authSlice';
import { User, Briefcase, ChevronRight, Sparkles } from 'lucide-react';

const RoleSelection = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'social';

  const selectRoleAndRedirect = (role) => {
    dispatch(setRole(role));
    // Redirect to backend OAuth endpoint
    window.location.href = `/oauth2/api/auth/oauth2/authorization/${provider}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 blur-[100px] rounded-full -z-10" />

      <div className="max-w-[500px] w-full">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-12 border border-slate-100 text-center">
          
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-2xl mb-8">
            <Sparkles className="text-indigo-600 w-7 h-7" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Define your journey</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Select how you'd like to use the platform to continue your secure login with <span className="text-indigo-600 font-bold capitalize">{provider}</span>.
          </p>
          
          <div className="grid grid-cols-1 gap-5">
            {/* Candidate Card */}
            <button 
              onClick={() => selectRoleAndRedirect('CANDIDATE')}
              className="group relative p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 text-left flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">Candidate</h3>
                <p className="text-sm text-slate-500 font-medium">I am looking for my next elite role.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Recruiter Card */}
            <button 
              onClick={() => selectRoleAndRedirect('RECRUITER')}
              className="group relative p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 text-left flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">Recruiter</h3>
                <p className="text-sm text-slate-500 font-medium">I want to hire world-class talent.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <p className="mt-10 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Secure encrypted authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;