import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../redux/jobSlice';
import { fetchRecruiterPublicProfile } from '../redux/profileSlice';
import { fetchMyApplications } from '../redux/applicationSlice';
import {
    MapPin, Briefcase, DollarSign, Calendar,
    ChevronLeft, CheckCircle2, Clock,
    Building2, Globe, Users, ArrowUpRight, AlertCircle, BookmarkCheck
} from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedJob: job, loading: jobLoading } = useSelector((state) => state.jobs);
    const { viewedProfile: company } = useSelector((state) => state.profile);
    const { list: myApplications } = useSelector((state) => state.applications);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchJobById(id));
        if (isAuthenticated && user?.role === 'CANDIDATE') {
            dispatch(fetchMyApplications());
        }
    }, [dispatch, id, isAuthenticated, user?.role]);

    useEffect(() => {
        if (job?.postedBy) {
            dispatch(fetchRecruiterPublicProfile(job.postedBy));
        }
    }, [dispatch, job?.postedBy]);

    const hasApplied = myApplications?.some(app => Number(app.jobId) === Number(id));
    const isRecruiter = user?.role === 'RECRUITER';
    const isNotOpen = job?.status !== 'OPEN';
    const isCandidate = user?.role === 'CANDIDATE';
    const isAdmin = user?.role === 'ADMIN';

    if (jobLoading || !job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Fetching Details</p>
            </div>
        );
    }

    const renderApplyButton = () => {
        const baseClass = "w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition shadow-sm";
        
        if (!isAuthenticated) {
            return (
                <button onClick={() => navigate('/login')} className={`${baseClass} bg-slate-900 text-white hover:bg-blue-600`}>
                    Sign in to Apply
                </button>
            );
        }

        if (isRecruiter) {
            return (
                <div className={`${baseClass} bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2`}>
                    <AlertCircle size={14} /> Recruiters Cannot Apply
                </div>
            );
        }

        if (hasApplied) {
            return (
                <div className={`${baseClass} bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center gap-2`}>
                    <BookmarkCheck size={16} /> Already Applied
                </div>
            );
        }

        if (isNotOpen) {
            return (
                <div className={`${baseClass} bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center gap-2`}>
                    <AlertCircle size={14} /> Hiring {job.status}
                </div>
            );
        }

        if (isAdmin) {
            return (
                <div className={`${baseClass} bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2`}>
                    <AlertCircle size={14} /> Admin Cannot Apply
                </div>
            );
        }

        return (
            <button
                onClick={() => navigate(`/jobs/${id}/apply`)}
                className={`${baseClass} bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-100`}
            >
                Apply for Position
            </button>
        );
    };

    return (
        /* Reduced top padding from pt-24 to pt-12 */
        <div className="min-h-screen bg-[#f8fafc] pt-12 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition group text-sm">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to listings
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-5">
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-md uppercase tracking-widest border border-blue-100">
                                        {job.category}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${isNotOpen ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                        {job.status}
                                    </span>
                                </div>
                                {/* Reduced Title from text-5xl to text-3xl */}
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-[11px] uppercase tracking-wide">
                                    <div className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-600" /> {job.location}</div>
                                    <div className="flex items-center gap-1.5"><Building2 size={16} className="text-blue-600" /> {company?.companyName || "Organization"}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100 mb-6">
                                <StatItem icon={<DollarSign size={14} className="text-blue-600" />} label="Pay Range" value={`₹${job.salaryMin}-${job.salaryMax}`} />
                                <StatItem icon={<Briefcase size={14} className="text-blue-600" />} label="Type" value={job.type.replace('_', ' ')} />
                                <StatItem icon={<Clock size={14} className="text-blue-600" />} label="Experience" value={`${job.experienceRequired}+ Yrs`} />
                                <StatItem icon={<Calendar size={14} className="text-blue-600" />} label="Posted" value={new Date(job.postedAt || Date.now()).toLocaleDateString()} />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" /> Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.skills.map((skill, i) => (
                                            <span key={i} className="px-3.5 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg border border-slate-100 uppercase">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" /> Overview
                                    </h3>
                                    {/* Reduced description text from text-lg to text-base */}
                                    <p className="text-slate-500 leading-relaxed text-base font-medium">
                                        {job.description || `We are seeking a highly skilled ${job.title} for ${company?.companyName || 'the company'}. This ${job.type.toLowerCase().replace('_', ' ')} role is based in ${job.location}, requiring expertise in ${job.skills.join(', ')}.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="sticky top-12 space-y-5">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                                <h3 className="text-xl font-black text-slate-900 mb-2">Apply Now</h3>
                                <p className="text-slate-400 text-[13px] mb-6 font-medium leading-relaxed">
                                    Review the requirements carefully before submitting.
                                </p>
                                
                                <div className="space-y-2">
                                    {renderApplyButton()}
                                    {isCandidate && !hasApplied && !isNotOpen && (
                                        <button className="w-full bg-slate-50 text-slate-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition flex items-center justify-center gap-2">
                                            <Bookmark size={14} /> Save for later
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">About Organization</p>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                                            {company?.companyName ? company.companyName[0] : (job.postedBy[0].toUpperCase())}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900 leading-tight">
                                                {company?.companyName || "Organization"}
                                            </p>
                                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{company?.industry || "Tech"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                                                <Users size={14} /> <span>Staff</span>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700">{company?.companySize || "N/A"}</span>
                                        </div>
                                        {company?.website && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                                                    <Globe size={14} /> <span>Web</span>
                                                </div>
                                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-1">
                                                    Open <ArrowUpRight size={12} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Contact</p>
                                    <p className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{job.postedBy}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ icon, label, value }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {icon} {label}
        </div>
        <p className="text-xs font-black text-slate-900 truncate tracking-tight">{value}</p>
    </div>
);

const Bookmark = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
);

export default JobDetails;