import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast'; // or your preferred notification library

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(forgotPassword(email));
    setLoading(false);

    if (forgotPassword.fulfilled.match(result)) {
      toast.success("OTP sent to your email!");
      // Redirect to reset page and pass email via state
      navigate('/reset-password', { state: { email } });
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-[440px] w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl mb-6">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
            <p className="text-slate-500 font-medium mt-2 text-sm">Enter your email to receive a 6-digit OTP</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8 text-sm font-medium">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;