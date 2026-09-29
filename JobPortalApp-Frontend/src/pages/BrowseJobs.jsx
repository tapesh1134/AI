import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, searchJobs } from '../redux/jobSlice';
import { 
    Search, MapPin, Briefcase, DollarSign, 
    Filter, X, ChevronRight, Clock, 
    SlidersHorizontal, ArrowRight, Trash2 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const BrowseJobs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: jobs = [], loading = false } = useSelector((state) => state.jobs || {});
    const [showFilters, setShowFilters] = useState(false);
    
    const [filters, setFilters] = useState({
        title: '', location: '', category: '', minSalary: '', maxSalary: '', experienceRequired: ''
    });

    useEffect(() => {
        dispatch(fetchJobs());
    }, [dispatch]);

    const triggerSearch = (e) => {
        if (e) e.preventDefault();
        const cleanedFilters = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null) {
                cleanedFilters[key] = ['minSalary', 'maxSalary', 'experienceRequired'].includes(key) 
                    ? Number(value) : value;
            }
        });
        dispatch(searchJobs(cleanedFilters));
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({ title: '', location: '', category: '', minSalary: '', maxSalary: '', experienceRequired: '' });
        dispatch(fetchJobs());
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pt-15 pb-15 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Sidebar Filter - Desktop & Mobile Overlay */}
                <aside className={`
                    lg:w-80 w-full bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-200 h-fit sticky top-24 transition-all z-50
                    ${showFilters ? 'fixed inset-0 pt-24 overflow-y-auto rounded-none lg:relative lg:pt-7 lg:rounded-[2.5rem]' : 'hidden lg:block'}
                `}>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-slate-900 text-xl tracking-tight flex items-center gap-2">
                            <SlidersHorizontal size={20} className="text-indigo-600" /> Filters
                        </h3>
                        <div className="flex items-center gap-4">
                            <button onClick={clearFilters} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Reset</button>
                            {showFilters && <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 bg-slate-100 rounded-full"><X size={18} /></button>}
                        </div>
                    </div>

                    <form onSubmit={triggerSearch} className="space-y-6">
                        <FilterInput label="Location" value={filters.location} onChange={v => setFilters({ ...filters, location: v })} placeholder="e.g. Remote, NYC" />
                        <FilterInput label="Category" value={filters.category} onChange={v => setFilters({ ...filters, category: v })} placeholder="e.g. IT, Design" />

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Salary Range (₹)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" placeholder="Min" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-600/20" value={filters.minSalary} onChange={e => setFilters({...filters, minSalary: e.target.value})} />
                                <input type="number" placeholder="Max" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-600/20" value={filters.maxSalary} onChange={e => setFilters({...filters, maxSalary: e.target.value})} />
                            </div>
                        </div>

                        <FilterInput label="Min Experience (Yrs)" value={filters.experienceRequired} onChange={v => setFilters({ ...filters, experienceRequired: v })} type="number" placeholder="0" />

                        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95">
                            Apply Filters
                        </button>
                    </form>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 space-y-6">
                    {/* TOP SEARCH BAR */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by job title or keyword..."
                            className="w-full pl-14 pr-24 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 outline-none transition-all"
                            value={filters.title}
                            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && triggerSearch()}
                        />
                        <button 
                            onClick={triggerSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                                Found {jobs?.length || 0} Openings
                            </h2>
                        </div>
                        <button 
                            onClick={() => setShowFilters(true)} 
                            className="lg:hidden flex items-center gap-2 text-xs font-bold text-slate-600 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
                        >
                            <Filter size={14} /> Filters
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-indigo-600"></div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Searching...</p>
                        </div>
                    ) : jobs.length > 0 ? (
                        <div className="space-y-4">
                            {jobs.map((job) => <JobCard key={job.jobId} job={job} />)}
                        </div>
                    ) : (
                        <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-200 shadow-sm">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No vacancies matched</h3>
                            <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto">Try adjusting your keywords or filters to find what you're looking for.</p>
                            <button onClick={clearFilters} className="mt-6 text-indigo-600 font-bold text-sm underline">Clear all filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const JobCard = ({ job }) => {
    const navigate = useNavigate();
    const isPaused = job.status === 'PAUSED';
    const isOpen = job.status === 'OPEN';

    return (
        <div
            onClick={() => navigate(`/jobs/${job.jobId}`)}
            className="group bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                            {job.title}
                        </h3>
                        {!isOpen && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                isPaused ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {job.status}
                            </span>
                        )}
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {job.category}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-6">
                        <JobMeta icon={<MapPin size={16} />} text={job.location} />
                        <JobMeta icon={<Briefcase size={16} />} text={job.type?.replace('_', ' ')} />
                        <JobMeta icon={<DollarSign size={16} />} text={`₹${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`} />
                    </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                    {isOpen ? (
                        <div className="w-12 h-12 hidden md:flex items-center justify-center bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 group-hover:translate-x-2 transition-all shadow-lg">
                            <ArrowRight size={20} />
                        </div>
                    ) : (
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Applications Closed</div>
                    )}
                    <button className="md:hidden w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">View Details</button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap gap-2">
                {job.skills?.slice(0, 5).map((skill, i) => (
                    <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-xl border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
};

const JobMeta = ({ icon, text }) => (
    <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs transition-colors group-hover:text-slate-700">
        <div className="text-slate-300 group-hover:text-indigo-400">{icon}</div>
        {text}
    </div>
);

const FilterInput = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <input
            type={type}
            className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:bg-white focus:border-indigo-200 outline-none transition text-sm font-semibold text-slate-700 placeholder:text-slate-300"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

export default BrowseJobs;