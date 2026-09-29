import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, updateJobDetails, deleteJob } from '../redux/jobSlice';
import { fetchMyApplications } from '../redux/applicationSlice';
import {
  fetchMyInterviews,
  fetchRecruiterInterviews,
  confirmInterview,
  cancelInterview,
  completeInterview,
  rescheduleInterview
} from '../redux/interviewSlice';
import {
  Users, FileText, Plus, Edit2, Trash2, ExternalLink,
  Calendar, Video, MapPin, RefreshCw, CheckCircle, XCircle,
  Filter, Search, Clock, ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('main'); 
  const [isRescheduling, setIsRescheduling] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [meetingFilter, setMeetingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { user } = useSelector((state) => state.auth);
  const { list: allJobs } = useSelector((state) => state.jobs);
  const { list: allApplications } = useSelector((state) => state.applications);
  const { list: allInterviews } = useSelector((state) => state.interviews);

  const isRecruiter = user?.role === 'RECRUITER';

  useEffect(() => {
    dispatch(fetchJobs());
    if (isRecruiter) {
      dispatch(fetchRecruiterInterviews());
    } else {
      dispatch(fetchMyApplications());
      dispatch(fetchMyInterviews());
    }
  }, [dispatch, isRecruiter]);

  // --- Filtering Logic ---
  const filteredMainData = useMemo(() => {
    if (isRecruiter) {
      const myJobs = allJobs.filter(j => j.postedBy === user.email);
      return statusFilter === 'ALL' ? myJobs : myJobs.filter(j => j.status === statusFilter);
    } else {
      return statusFilter === 'ALL' ? allApplications : allApplications.filter(app => app.status === statusFilter);
    }
  }, [allJobs, allApplications, statusFilter, isRecruiter, user.email]);

  const filteredInterviews = useMemo(() => {
    return meetingFilter === 'ALL' ? allInterviews : allInterviews.filter(m => m.status === meetingFilter);
  }, [allInterviews, meetingFilter]);

  // --- Theme Helpers ---
  const getStatusColor = (status) => {
    const map = {
      OPEN: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      PAUSED: 'text-amber-600 bg-amber-50 border-amber-100',
      CLOSED: 'text-rose-600 bg-rose-50 border-rose-100',
      APPLIED: 'text-blue-600 bg-blue-50 border-blue-100',
      SHORTLISTED: 'text-purple-600 bg-purple-50 border-purple-100',
      REJECTED: 'text-slate-500 bg-slate-50 border-slate-100',
    };
    return map[status] || 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const getMeetingStyles = (status) => {
    switch (status) {
      case 'CONFIRMED': return { color: 'indigo', icon: <CheckCircle size={18} /> };
      case 'COMPLETED': return { color: 'emerald', icon: <CheckCircle size={18} /> };
      case 'CANCELLED': return { color: 'rose', icon: <XCircle size={18} /> };
      default: return { color: 'blue', icon: <Clock size={18} /> };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-15 pb-15 px-4 md:px-8 lg:px-16 antialiased text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-xl font-black text-blue-600">
              {user?.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                {user?.role} <span className="mx-1 text-slate-200">•</span> {user?.email}
              </p>
            </div>
          </div>
          {isRecruiter && (
            <button 
                onClick={() => navigate('/post-job')} 
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg"
            >
              <Plus size={16} strokeWidth={3} /> Post Job
            </button>
          )}
        </header>

        {/* NAV & FILTER BAR */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Tab Switcher */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-fit">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'main' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {isRecruiter ? 'Active Jobs' : 'Applications'}
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'interviews' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Meetings
            </button>
          </div>

          {/* Dynamic Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm min-w-max">
                <Filter size={14} className="text-slate-300" />
                {(activeTab === 'main' ? (isRecruiter ? ['ALL', 'OPEN', 'PAUSED', 'CLOSED'] : ['ALL', 'APPLIED', 'SHORTLISTED', 'OFFERED', 'REJECTED']) : ['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).map(s => (
                <button
                    key={s}
                    onClick={() => activeTab === 'main' ? setStatusFilter(s) : setMeetingFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    (activeTab === 'main' ? statusFilter : meetingFilter) === s 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    {s}
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* MAIN LIST CONTENT */}
        {activeTab === 'main' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredMainData.length > 0 ? (
              filteredMainData.map(item => {
                const job = allJobs.find(j => j.jobId === item.jobId);
                return (
                  <div key={item.jobId || item.applicationId} className="group bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-1 w-full text-center lg:text-left">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{isRecruiter ? item.title : (job?.title || `Job #${item.jobId}`)}</h3>
                        <span className={`inline-block self-center lg:self-auto px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${getStatusColor(item.status)}`}>
                            {item.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(isRecruiter ? item.postedAt : item.appliedAt).toLocaleDateString()}</span>
                        <span className="hidden md:block h-3 w-px bg-slate-200"></span>
                        <span className="flex items-center gap-1"><FileText size={12}/> {isRecruiter ? item.category : 'Application'}</span>
                      </div>
                    </div>

                    {isRecruiter && (
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['OPEN', 'PAUSED', 'CLOSED'].map(s => (
                            <button
                                key={s}
                                onClick={() => dispatch(updateJobDetails({ jobId: item.jobId, jobData: {...item, status: s}}))}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${item.status === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                {s}
                            </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <button 
                        onClick={() => isRecruiter ? navigate(`/job/${item.jobId}/applicants`) : navigate(`/jobs/${item.jobId}`)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-[11px] hover:bg-blue-600 transition-all"
                      >
                        {isRecruiter ? <><Users size={14}/> Manage</> : <><ExternalLink size={14}/> Details</>}
                      </button>
                      {isRecruiter && (
                        <>
                            <button onClick={() => navigate(`/edit-job/${item.jobId}`)} className="p-3 text-slate-400 bg-slate-50 rounded-xl hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"><Edit2 size={16}/></button>
                            <button onClick={() => window.confirm('Delete?') && dispatch(deleteJob(item.jobId))} className="p-3 text-slate-400 bg-slate-50 rounded-xl hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
                <EmptyState icon={<Search size={40}/>} title="Empty Results" subtitle="Try changing your filters." />
            )}
          </div>
        ) : (
          /* MEETINGS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviews.length > 0 ? (
                filteredInterviews.map(meeting => {
                    const theme = getMeetingStyles(meeting.status);
                    const isFinalized = ['COMPLETED', 'CANCELLED'].includes(meeting.status);
                    
                    // Logic to prevent dynamic Tailwind class failures
                    const accentColor = 
                        theme.color === 'emerald' ? 'bg-emerald-500' : 
                        theme.color === 'rose' ? 'bg-rose-500' : 
                        theme.color === 'indigo' ? 'bg-indigo-500' : 'bg-blue-500';

                    return (
                        <div key={meeting.interviewId} className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden min-h-[320px]">
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${accentColor}`} />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-[10px] font-black px-2 py-1 bg-slate-50 rounded-md border border-slate-100 uppercase text-slate-500">
                                    {meeting.status}
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1 tracking-widest">Start Time</p>
                                    <p className="text-xs font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                                        {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRecruiter ? 'Candidate' : 'Hiring Expert'}</p>
                            <h4 className="text-base font-black text-slate-900 mb-6 truncate">{isRecruiter ? meeting.candidateEmail : (meeting.recruiterEmail || 'Manager')}</h4>

                            <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 mb-6">
                                <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                                    {meeting.mode === 'ONLINE' ? <Video size={16}/> : <MapPin size={16}/>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{meeting.mode}</p>
                                    <a href={meeting.meetLink} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline truncate block">
                                        {meeting.meetLink || meeting.location || 'Details TBD'}
                                    </a>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col sm:flex-row gap-2">
                                {!isRecruiter && meeting.status === 'SCHEDULED' && (
                                    <>
                                        <button onClick={() => dispatch(confirmInterview(meeting.interviewId))} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">Confirm</button>
                                        <button onClick={() => dispatch(cancelInterview(meeting.interviewId))} className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-all border border-slate-100">Decline</button>
                                    </>
                                )}
                                {isRecruiter && !isFinalized && (
                                    <>
                                        <button onClick={() => setIsRescheduling(meeting)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"><RefreshCw size={14}/> Reschedule</button>
                                        <button onClick={() => dispatch(completeInterview(meeting.interviewId))} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-50"><CheckCircle size={14}/> Finish</button>
                                    </>
                                )}
                                {isFinalized && (
                                    <div className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-100">
                                        {theme.icon} {meeting.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <EmptyState icon={<Calendar size={40}/>} title="No meetings" subtitle="Check other filters." />
            )}
          </div>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {isRescheduling && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-slate-900 mb-1">New Schedule</h2>
            <p className="text-xs text-slate-400 mb-6 font-medium italic">Update time for <span className="text-blue-600 font-bold">{isRescheduling.candidateEmail}</span></p>

            <form onSubmit={(e) => {
              e.preventDefault();
              dispatch(rescheduleInterview({ id: isRescheduling.interviewId, dateTime: rescheduleDate })).then(() => {
                setIsRescheduling(null);
                setRescheduleDate('');
              });
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-700 text-sm"
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-md active:scale-95 transition-all">Update Meeting</button>
                <button type="button" onClick={() => setIsRescheduling(null)} className="w-full py-3 font-bold text-slate-400 hover:text-slate-600 transition text-[10px] uppercase">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-200 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-1">{title}</h3>
    <p className="text-slate-400 text-xs font-medium">{subtitle}</p>
  </div>
);

export default Dashboard;