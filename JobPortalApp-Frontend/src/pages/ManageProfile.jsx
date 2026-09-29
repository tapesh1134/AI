import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { updateProfile } from '../redux/profileSlice';
import { forgotPassword, resetPassword } from '../redux/authSlice'; 
import {
  fetchMySubscriptions, fetchInvoices
} from '../redux/subscriptionSlice';
import {
  User, MapPin, Briefcase, Globe, Phone, Mail,
  Calendar, Award, Building, Link as LinkIcon, Save, X, Edit3,
  Crown, History, Eye, CheckCircle, Printer, CreditCard, 
  ShieldCheck, Lock, KeyRound, Send, Loader2, AlertCircle
} from 'lucide-react';

const ManageProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: profile } = useSelector(state => state.profile);
  const { user: authUser } = useSelector(state => state.auth); 
  const { active: subscriptions, invoices } = useSelector(state => state.subscription);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- Password State ---
  const [passwordStep, setPasswordStep] = useState(1);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ otp: '', newPassword: '', confirmPassword: '' });

  // FIX 1: Determine roles from authUser because profile is null for Admin
  const isRecruiter = authUser?.role === 'RECRUITER';
  const isAdmin = authUser?.role === 'ADMIN';
  const activeSub = subscriptions?.find(s => s.status === 'SUBSCRIBED');

  // FIX 2: Initialize editData for Admin manually
  useEffect(() => {
    if (isAdmin) {
      setEditData({ fullName: 'Administrator' });
    } else if (profile) {
      setEditData(profile);
      if (isRecruiter) {
        dispatch(fetchMySubscriptions());
        dispatch(fetchInvoices());
      }
    }
  }, [profile, dispatch, isRecruiter, isAdmin]);

  const handleUpdate = () => {
    let finalData = { ...editData };
    if (!isRecruiter && !isAdmin && typeof editData.skills === 'string') {
      finalData.skills = editData.skills.split(',').map(s => s.trim()).filter(s => s !== "");
    }
    dispatch(updateProfile(finalData));
    setIsEditing(false);
  };

  const handleRequestOTP = async () => {
    setIsChangingPassword(true);
    const result = await dispatch(forgotPassword(authUser.email));
    setIsChangingPassword(false);
    if (forgotPassword.fulfilled.match(result)) {
      toast.success("Verification code sent to email!");
      setPasswordStep(2);
    } else {
      toast.error(result.payload || "Failed to send code");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setIsChangingPassword(true);
    const result = await dispatch(resetPassword({ 
      email: authUser.email, 
      otp: passwordData.otp, 
      newPassword: passwordData.newPassword 
    }));
    setIsChangingPassword(false);
    
    if (resetPassword.fulfilled.match(result)) {
      toast.success("Password updated successfully!");
      setPasswordStep(1);
      setPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.payload);
    }
  };

  // FIX 3: Don't show loading spinner if it's an admin (since profile will be null)
  if (!isAdmin && (!profile || !editData)) return <LoadingSpinner />;
  // Added safety for Admin initialization
  if (isAdmin && !editData) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-15 pb-15 px-4 sm:px-6 md:px-8 lg:px-12 font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* 1. TOP HEADER BAR */}
        <div className="bg-white rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 mb-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl relative shrink-0 ${isAdmin ? 'bg-rose-600' : (activeSub ? 'bg-gradient-to-tr from-amber-400 to-orange-600 shadow-amber-100' : 'bg-slate-900')}`}>
              {isAdmin ? 'A' : (profile?.fullName ? profile.fullName[0].toUpperCase() : 'U')}
              {activeSub && <Crown size={16} className="absolute -top-2 -right-2 text-amber-500 fill-amber-500" />}
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate max-w-[250px] sm:max-w-none">
                {isAdmin ? 'System Administrator' : (profile?.fullName || 'User')}
              </h1>
              <p className="text-slate-400 font-bold text-[10px] flex flex-wrap justify-center sm:justify-start items-center gap-2 uppercase tracking-widest mt-1.5">
                {isAdmin ? <span className="text-rose-600">Admin Access</span> : (activeSub ? <span className="text-amber-600">Premium Recruiter</span> : authUser?.role)}
                <span className="hidden sm:block h-1 w-1 bg-slate-200 rounded-full" /> 
                <span className="truncate max-w-[200px] sm:max-w-none">{authUser?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {isEditing ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-3 font-black text-[10px] uppercase text-slate-400 tracking-widest">Cancel</button>
                <button onClick={handleUpdate} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100"><Save size={14} /> Save</button>
              </div>
            ) : (
              !isAdmin && (
                <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"><Edit3 size={14} /> Edit Profile</button>
              )
            )}
          </div>
        </div>

        {/* 2. MAIN CONTENT GRID */}
        <div className={`grid grid-cols-1 ${isAdmin ? '' : 'lg:grid-cols-12'} gap-6`}>

          {/* Left Column */}
          <div className={`${isAdmin ? 'max-w-xl mx-auto w-full' : 'lg:col-span-4'} space-y-6`}>
            <Section title="Account Identity" icon={<User size={16} />} color={isAdmin ? "rose" : "blue"}>
              <InputField label="Full Name" icon={User} value={editData?.fullName} name="fullName" isEditing={isEditing} onChange={setEditData} data={editData} />
              <InputField label="Email Address" icon={Mail} value={authUser?.email} name="email" isEditing={false} onChange={()=>{}} data={editData} />
              {!isAdmin && (
                <InputField label="Mobile No" icon={Phone} value={editData?.mobile} name="mobile" type="number" isEditing={isEditing} onChange={setEditData} data={editData} />
              )}
            </Section>

            {/* SECURITY SECTION */}
            <Section title="Security & Access" icon={<ShieldCheck size={16} />} color="rose">
              {passwordStep === 1 ? (
                <div className="space-y-4">
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    To change your password, we need to verify your identity via email.
                  </p>
                  <button 
                    onClick={handleRequestOTP}
                    disabled={isChangingPassword}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Request Reset Code
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                   <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
                        <AlertCircle className="text-amber-600 shrink-0" size={14} />
                        <p className="text-[9px] text-amber-700 font-bold leading-tight">Check your email for the 6-digit code.</p>
                   </div>
                   <input
                        type="text"
                        placeholder="CODE"
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-center font-black tracking-[0.3em] text-sm focus:ring-1 focus:ring-rose-500"
                        value={passwordData.otp}
                        onChange={(e) => setPasswordData({...passwordData, otp: e.target.value})}
                        required
                    />
                    <div className="space-y-3">
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-rose-500"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-1 focus:ring-rose-500"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setPasswordStep(1)} className="flex-1 py-3 text-[9px] font-black uppercase text-slate-400">Back</button>
                        <button type="submit" disabled={isChangingPassword} className="flex-[2] py-3 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-rose-100">
                            {isChangingPassword ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <CheckCircle size={14} className="inline mr-1" />}
                            Update
                        </button>
                    </div>
                </form>
              )}
            </Section>
          </div>

          {/* Right Column (Hidden for Admins) */}
          {!isAdmin && editData && (
            <div className="lg:col-span-8 space-y-6">
              <Section title="Residency & Address" icon={<MapPin size={16} />} color="slate">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <InputField label="House/Unit No" value={editData.address?.houseNo} name="houseNo" nested="address" isEditing={isEditing} onChange={setEditData} data={editData} icon={MapPin} />
                  <InputField label="Street" value={editData.address?.street} name="street" nested="address" isEditing={isEditing} onChange={setEditData} data={editData} icon={MapPin} />
                  <InputField label="City" value={editData.address?.city} name="city" nested="address" isEditing={isEditing} onChange={setEditData} data={editData} icon={MapPin} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="State" value={editData.address?.state} name="state" nested="address" isEditing={isEditing} onChange={setEditData} data={editData} icon={MapPin} />
                    <InputField label="Pincode" value={editData.address?.pincode} name="pincode" type="number" nested="address" isEditing={isEditing} onChange={setEditData} data={editData} icon={MapPin} />
                  </div>
                </div>
              </Section>

              <Section title={isRecruiter ? "Company Details" : "Professional Portfolio"} icon={isRecruiter ? <Building size={16} /> : <Briefcase size={16} />} color="indigo">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {isRecruiter ? (
                    <>
                      <InputField label="Company Name" value={editData.companyName} name="companyName" isEditing={isEditing} onChange={setEditData} data={editData} icon={Building} />
                      <InputField label="Industry" value={editData.industry} name="industry" isEditing={isEditing} onChange={setEditData} data={editData} icon={Globe} />
                    </>
                  ) : (
                    <>
                      <div className="col-span-full">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1 mb-2"><Award size={12} /> Expertise & Skills</label>
                        {isEditing ? (
                          <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner" placeholder="Java, React..." value={Array.isArray(editData.skills) ? editData.skills.join(', ') : editData.skills} onChange={e => setEditData({ ...editData, skills: e.target.value })} rows="3" />
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {profile?.skills?.length > 0 ? profile.skills.map((s, i) => <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase">{s}</span>) : <span className="text-xs text-slate-400 font-bold">No skills added</span>}
                          </div>
                        )}
                      </div>
                      <InputField label="Experience (Years)" value={editData.experience} name="experience" type="number" isEditing={isEditing} onChange={setEditData} data={editData} icon={Briefcase} />
                    </>
                  )}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components remains the same as your original
const Section = ({ title, icon, color, children }) => (
  <div className="bg-white p-6 sm:p-7 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-500`} />
    <h3 className="text-[10px] font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] leading-none">{icon} {title}</h3>
    <div className="space-y-5">{children}</div>
  </div>
);

const InputField = ({ label, icon: Icon, value, name, type = "text", nested = null, isEditing, onChange, data }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1 whitespace-nowrap">
      <Icon size={12} className="text-blue-500 shrink-0" /> {label}
    </label>
    {isEditing ? (
      <input type={type} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-blue-600 outline-none transition text-xs font-bold text-slate-700 shadow-inner" value={value || ''} onChange={(e) => {
        if (nested) { onChange({ ...data, [nested]: { ...data[nested], [name]: e.target.value } }); }
        else { onChange({ ...data, [name]: e.target.value }); }
      }} />
    ) : (
      <p className="text-xs font-black text-slate-700 py-1 px-1 break-all">{value || '—'}</p>
    )}
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-blue-600"></div>
    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Account</p>
  </div>
);

export default ManageProfile;