import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationsByJob, updateApplicationStatus } from '../redux/applicationSlice';
import { scheduleInterview } from '../redux/interviewSlice';
import {
    FileText, Calendar, Video, MapPin, ChevronLeft,
    ArrowRight, UserCheck, ExternalLink, Info,
    Filter, Search, X, Mail, Phone, Briefcase, Globe, User
} from 'lucide-react';
import { fetchProfile } from '../redux/profileSlice';

const JobApplicants = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { list: apps, loading } = useSelector(state => state.applications);
    const { data: viewedProfile, loading: profileLoading } = useSelector(state => state.profile);

    // UI STATES
    const [selectedApp, setSelectedApp] = useState(null);
    const [expandedApp, setExpandedApp] = useState(null);
    const [interviewData, setInterviewData] = useState({
        mode: 'ONLINE', scheduledAt: '', meetLink: '', location: '', notes: ''
    });
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // FILTER STATES
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchApplicationsByJob(jobId));
    }, [dispatch, jobId]);

    // FILTERING LOGIC
    const filteredApplicants = useMemo(() => {
        return apps.filter(app => {
            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
            const matchesSearch = app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [apps, statusFilter, searchQuery]);

    const handleStatusChange = (app, newStatus) => {
        if (newStatus === 'INTERVIEW_SCHEDULED') {
            setSelectedApp(app);
        } else {
            dispatch(updateApplicationStatus({ id: app.applicationId, status: newStatus }));
        }
    };

    const handleViewProfile = (email) => {
        dispatch(fetchProfile(email));
        setIsProfileModalOpen(true);
    };

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        dispatch(scheduleInterview({
            applicationId: selectedApp.applicationId,
            candidateEmail: selectedApp.candidateEmail,
            ...interviewData
        })).then(() => {
            // Update app status in backend after scheduling
            dispatch(updateApplicationStatus({ id: selectedApp.applicationId, status: 'INTERVIEW_SCHEDULED' }));
            setSelectedApp(null);
            setInterviewData({ mode: 'ONLINE', scheduledAt: '', meetLink: '', location: '', notes: '' });
        });
    };

    const filterOptions = ['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'];

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-15 pb-15 px-4">
            <div className="max-w-6xl mx-auto">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4 text-sm font-bold group"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Applicant Pipeline</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium italic">Role ID: <span className="text-blue-600 font-bold">#{jobId}</span></p>
                    </div>

                    <div className="flex gap-3">
                        <StatBox label="Total Applicants" count={apps.length} color="blue" />
                        <StatBox label="Filtered" count={filteredApplicants.length} color="indigo" />
                    </div>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar pb-2 lg:pb-0">
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            {filterOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => setStatusFilter(option)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-wider ${statusFilter === option
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {option.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full lg:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by candidate email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-600 transition text-sm font-medium"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* APPLICANT LIST */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-blue-600"></div>
                            <p className="text-slate-400 font-bold text-sm">Loading Pipeline...</p>
                        </div>
                    ) : filteredApplicants.length > 0 ? (
                        filteredApplicants.map(app => (
                            <div key={app.applicationId} className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                                <div className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                                    {/* Candidate Card Left */}
                                    <div className="flex items-center gap-5 flex-1 w-full">
                                        <div className="w-16 h-16 bg-gradient-to-tr from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-inner">
                                            {app.candidateEmail[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-black text-slate-900 text-lg">{app.candidateEmail}</h3>
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest ${getStatusStyles(app.status)}`}>
                                                    {app.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-5 mt-2 text-xs font-bold">
                                                {/* UPDATED ACTION: View Profile */}
                                                <button
                                                    onClick={() => handleViewProfile(app.candidateEmail)}
                                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition"
                                                >
                                                    <User size={14} /> View Full Profile
                                                </button>

                                                <button onClick={() => setExpandedApp(expandedApp === app.applicationId ? null : app.applicationId)} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition">
                                                    <Info size={14} /> {expandedApp === app.applicationId ? 'Hide Letter' : 'Cover Letter'}
                                                </button>

                                                <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition">
                                                    <FileText size={14} /> Resume <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Select */}
                                    <div className="w-full lg:w-auto">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app, e.target.value)}
                                            className="w-full lg:w-56 p-3.5 bg-slate-50 border-none rounded-2xl text-xs font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 transition cursor-pointer appearance-none text-center"
                                        >
                                            <option value="APPLIED">Applied</option>
                                            <option value="SHORTLISTED">Shortlisted</option>
                                            <option value="INTERVIEW_SCHEDULED">Schedule Interview</option>
                                            <option value="OFFERED">Send Offer</option>
                                            <option value="REJECTED">Reject Applicant</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Expanded Profile Information */}
                                {expandedApp === app.applicationId && (
                                    <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Mail size={14} className="text-slate-400" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cover Letter & Message</p>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                                {app.coverLetter || "No cover letter provided by the candidate."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                <Search size={40} />
                            </div>
                            <p className="text-slate-500 font-black text-xl">No candidates match this criteria</p>
                            <p className="text-slate-400 text-sm mt-1">Try clearing your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* INTERVIEW SCHEDULING MODAL */}
            {selectedApp && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
                            <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-3xl font-black flex items-center gap-3">
                                <Calendar /> Schedule
                            </h2>
                            <p className="text-blue-100 text-xs mt-2 font-bold uppercase tracking-widest opacity-80">Candidate: {selectedApp.candidateEmail}</p>
                        </div>

                        <form onSubmit={handleScheduleSubmit} className="p-8 space-y-5 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Mode</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-600 transition font-bold text-slate-700"
                                        value={interviewData.mode}
                                        onChange={e => setInterviewData({ ...interviewData, mode: e.target.value })}
                                    >
                                        <option value="ONLINE">Online (Video)</option>
                                        <option value="IN_PERSON">In Person (Office)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-600 transition font-bold text-slate-700"
                                        onChange={e => setInterviewData({ ...interviewData, scheduledAt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    {interviewData.mode === 'ONLINE' ? 'Video Conference Link' : 'Office Location Address'}
                                </label>
                                <div className="relative">
                                    {interviewData.mode === 'ONLINE' ?
                                        <Video size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /> :
                                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    }
                                    <input
                                        type="text"
                                        placeholder={interviewData.mode === 'ONLINE' ? "Zoom, Google Meet, or Teams link" : "Building name, Room number, City"}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-600 transition text-sm font-medium"
                                        onChange={e => setInterviewData({ ...interviewData, meetLink: e.target.value, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preparation Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Tell the candidate what to prepare for (e.g., Portfolio review, Technical task)..."
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-600 transition text-sm font-medium resize-none"
                                    onChange={e => setInterviewData({ ...interviewData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setSelectedApp(null)} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition">Discard</button>
                                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group transition-all active:scale-95">
                                    Confirm Interview <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* CANDIDATE PROFILE MODAL */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/20">
                                    {viewedProfile?.fullName?.[0] || '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{viewedProfile?.fullName || 'Fetching...'}</h2>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Candidate Profile</p>
                                </div>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {profileLoading ? (
                                <div className="flex flex-col items-center py-20 gap-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                    <p className="text-slate-400 font-bold text-sm">Loading detailed profile...</p>
                                </div>
                            ) : viewedProfile ? (
                                <div className="space-y-8">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoGroup icon={<Mail />} label="Email" value={viewedProfile.email} />
                                        <InfoGroup icon={<Phone />} label="Mobile" value={viewedProfile.mobile} />
                                        <InfoGroup icon={<UserCheck />} label="Gender" value={viewedProfile.gender} />
                                        <InfoGroup icon={<Calendar />} label="Date of Birth" value={viewedProfile.dob} />
                                    </div>

                                    {/* Professional Info */}
                                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoGroup icon={<Briefcase />} label="Total Experience" value={`${viewedProfile.experience} Years`} />
                                            <InfoGroup icon={<MapPin />} label="Location" value={`${viewedProfile.address?.city}, ${viewedProfile.address?.state}`} />
                                        </div>

                                        <div className="pt-4 border-t border-slate-200/60">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Skills & Expertise</label>
                                            <div className="flex flex-wrap gap-2">
                                                {viewedProfile.skills?.map((skill, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-4">
                                        <a
                                            href={viewedProfile.resumeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                                        >
                                            <FileText size={18} /> View Full Resume
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-400 font-bold">
                                    Could not load candidate details.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI COMPONENT HELPERS
const StatBox = ({ label, count, color = "blue" }) => (
    <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[110px]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
        <span className={`text-2xl font-black text-${color}-600 mt-1`}>{count}</span>
    </div>
);

const getStatusStyles = (status) => {
    switch (status) {
        case 'SHORTLISTED': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'INTERVIEW_SCHEDULED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'OFFERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'APPLIED': return 'bg-blue-50 text-blue-600 border-blue-100';
        default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
};

const InfoGroup = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-slate-400">
            {React.cloneElement(icon, { size: 14, strokeWidth: 2.5 })}
            <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-0.5">{label}</span>
        </div>
        <div className="text-slate-900 font-bold text-sm min-h-[1.25rem]">
            {value || <span className="text-slate-300 italic font-medium text-xs">Not Provided</span>}
        </div>
    </div>
);

export default JobApplicants;