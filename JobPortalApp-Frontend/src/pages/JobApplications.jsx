import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationsByJob, updateApplicationStatus } from '../redux/applicationSlice';
import { fetchRecruiterAnalytics } from '../redux/analyticsSlice';
import { Mail, FileText, Check, X, Clock } from 'lucide-react';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // REDUX STATE
  const { list: apps, loading: appsLoading } = useSelector(state => state.applications);
  const { data: stats, loading: statsLoading } = useSelector(state => state.analytics);
  // Assuming you store recruiter info in an auth slice
  const { user } = useSelector(state => state.auth || { user: { id: 'REC123' } });

  const [selectedApp, setSelectedApp] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);
  const [interviewData, setInterviewData] = useState({
    mode: 'ONLINE', scheduledAt: '', meetLink: '', location: '', notes: ''
  });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchApplicationsByJob(jobId));
    dispatch(fetchRecruiterAnalytics(user.id)); // Fetch analytics on load
  }, [dispatch, jobId, user.id]);

  const filteredApplicants = useMemo(() => {
    return apps.filter(app => {
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesSearch = app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [apps, statusFilter, searchQuery]);

  // ... handleStatusChange and handleScheduleSubmit remain the same ...
  const handleStatusChange = (app, newStatus) => {
    if (newStatus === 'INTERVIEW_SCHEDULED') {
      setSelectedApp(app);
    } else {
      dispatch(updateApplicationStatus({ id: app.applicationId, status: newStatus }))
        .then(() => dispatch(fetchRecruiterAnalytics(user.id))); // Refresh stats after update
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    dispatch(scheduleInterview({
      applicationId: selectedApp.applicationId,
      candidateEmail: selectedApp.candidateEmail,
      ...interviewData
    })).then(() => {
      dispatch(updateApplicationStatus({ id: selectedApp.applicationId, status: 'INTERVIEW_SCHEDULED' }));
      dispatch(fetchRecruiterAnalytics(user.id)); // Refresh stats
      setSelectedApp(null);
      setInterviewData({ mode: 'ONLINE', scheduledAt: '', meetLink: '', location: '', notes: '' });
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-15 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4 text-sm font-bold group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Applicant Pipeline</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitoring results for Job <span className="text-blue-600 font-bold">#{jobId}</span></p>
          </div>

          {/* NEW ANALYTICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full lg:w-auto">
            <StatBox label="Total Jobs" count={stats.totalJobs} color="slate" icon={<BarChart3 size={14} />} />
            <StatBox label="Total Apps" count={stats.totalApplications} color="blue" icon={<Mail size={14} />} />
            <StatBox label="Shortlisted" count={stats.shortlistedCount} color="purple" icon={<UserCheck size={14} />} />
            <StatBox label="Offered" count={stats.offeredCount} color="emerald" icon={<ArrowRight size={14} />} />
            <StatBox label="Rejected" count={stats.rejectedCount} color="rose" icon={<X size={14} />} />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-slate-900">Applicants for Job #{jobId}</h1>
        <div className="grid gap-4">
          {apps.map(app => (
            <div key={app.applicationId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900">{app.candidateEmail}</span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2 mb-3">{app.coverLetter}</p>
                <a href={app.resumeUrl} target="_blank" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  <FileText size={14} /> View Resume
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Status</p>
                  <p className="font-bold text-blue-600">{app.status}</p>
                </div>
                <button onClick={() => handleStatus(app.applicationId, 'SHORTLISTED')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={20} /></button>
                <button onClick={() => handleStatus(app.applicationId, 'REJECTED')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, count, color = "blue", icon }) => {
  const colorVariants = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
  };

  return (
    <div className={`px-4 py-3 rounded-2xl border shadow-sm flex flex-col items-center min-w-[100px] transition-transform hover:scale-105 ${colorVariants[color]}`}>
      <div className="flex items-center gap-1.5 mb-1 opacity-70">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{label}</span>
      </div>
      <span className="text-xl font-black">{count}</span>
    </div>
  );
};

export default JobApplications;