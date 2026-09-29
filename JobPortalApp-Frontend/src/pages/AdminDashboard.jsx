import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAnalytics } from '../redux/analyticsSlice';
import { fetchAllProfiles, adminDeleteProfile } from '../redux/profileSlice';
import { fetchAdminAllInvoices } from '../redux/subscriptionSlice';
import {
    Users, Briefcase, X, TrendingUp, Search,
    Trash2, Eye, MapPin, Globe, Mail,
    Calendar, Building2, Phone,
    UserCheck, FileText, ExternalLink, 
    Receipt, DollarSign, ArrowUpRight, ShieldAlert,
    CalendarDays
} from 'lucide-react';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    
    const { allProfiles = [] } = useSelector(state => state.profile);
    const { adminInvoices = [] } = useSelector(state => state.subscription);

    const [activeTab, setActiveTab] = useState('USERS');
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [timeFilter, setTimeFilter] = useState('ALL'); // NEW: Financial Filter

    useEffect(() => {
        dispatch(fetchAdminAnalytics());
        dispatch(fetchAllProfiles());
        dispatch(fetchAdminAllInvoices());
    }, [dispatch]);

    const handleDelete = (userId) => {
        if (window.confirm("Permanent Action: Delete this user profile?")) {
            dispatch(adminDeleteProfile(userId));
        }
    };

    // --- FILTER LOGIC ---

    const filteredInvoices = useMemo(() => {
        const now = new Date();
        return adminInvoices.filter(inv => {
            const invDate = new Date(inv.paymentDate);
            const diffInDays = (now - invDate) / (1000 * 60 * 60 * 24);

            if (timeFilter === 'DAY') return diffInDays <= 1;
            if (timeFilter === 'WEEK') return diffInDays <= 7;
            if (timeFilter === 'MONTH') return diffInDays <= 30;
            return true;
        });
    }, [adminInvoices, timeFilter]);

    const totalRevenue = useMemo(() => 
        filteredInvoices.reduce((acc, curr) => acc + curr.amount, 0), 
    [filteredInvoices]);

    const filteredUsers = useMemo(() => {
        return allProfiles.filter(user => {
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
            const nameMatch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
            const emailMatch = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesRole && (nameMatch || emailMatch);
        });
    }, [allProfiles, roleFilter, searchQuery]);

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-15 pb-15 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Control</h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {activeTab === 'USERS' ? 'Manage global users and profiles' : 'Monitor platform revenue and growth'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 whitespace-nowrap">Live Updates</span>
                    </div>
                </div>

                {/* 1. KPI SECTION - Now Reacts to timeFilter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <AdminStatCard icon={<Users />} label="Total Users" value={allProfiles.length} color="indigo" />
                    <AdminStatCard icon={<DollarSign />} label={timeFilter === 'ALL' ? "Total Revenue" : "Period Revenue"} value={`₹${totalRevenue.toLocaleString()}`} color="emerald" />
                    <AdminStatCard icon={<Receipt />} label="Transactions" value={filteredInvoices.length} color="blue" />
                    <AdminStatCard icon={<ArrowUpRight />} label="Period" value={timeFilter.replace('_', ' ')} color="violet" />
                </div>

                {/* 2. NAVIGATION & TABS */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
                    <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full lg:w-auto">
                        {['USERS', 'FINANCIALS'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                                    activeTab === tab 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    {/* FILTERS - DYNAMIC BASED ON TAB */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        {activeTab === 'USERS' ? (
                            <>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search name/email..." 
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="w-full sm:w-auto bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold shadow-sm"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="CANDIDATE">Candidates</option>
                                    <option value="RECRUITER">Recruiters</option>
                                </select>
                            </>
                        ) : (
                            <div className="flex p-1 bg-white border border-slate-200 rounded-2xl w-full sm:w-auto overflow-x-auto shadow-sm">
                                {['DAY', 'WEEK', 'MONTH', 'ALL'].map(period => (
                                    <button
                                        key={period}
                                        onClick={() => setTimeFilter(period)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest whitespace-nowrap transition-all ${
                                            timeFilter === period 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {period === 'ALL' ? 'ALL TIME' : `LAST ${period}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. TABLES */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    {activeTab === 'USERS' ? (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeTab === 'USERS' ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.profileId} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-100">
                                                        {user.fullName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                                                    user.role === 'RECRUITER' 
                                                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-bold text-slate-500 italic">
                                                {user.address?.city || 'Not set'}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Eye size={16} /></button>
                                                    <button onClick={() => handleDelete(user.profileId)} className="p-2 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredInvoices.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 text-xs font-bold italic uppercase tracking-widest">No transactions found for this period</td></tr>
                                    ) : (
                                        filteredInvoices.map(invoice => (
                                            <tr key={invoice.invoiceID} className="hover:bg-slate-50/50">
                                                <td className="px-8 py-6">
                                                    <span className="font-mono text-[10px] bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-600 uppercase">#{invoice.transactionId?.slice(0, 8)}</span>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-slate-700">{invoice.recruiterEmail}</td>
                                                <td className="px-8 py-6 text-xs font-bold text-slate-400">{new Date(invoice.paymentDate).toLocaleDateString()}</td>
                                                <td className="px-8 py-6 text-right font-black text-emerald-600">₹{invoice.amount.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL (UserCheck Fix applied here) */}
            {selectedUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center text-2xl font-black">{selectedUser.fullName?.[0]}</div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedUser.fullName}</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedUser.role} Account</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={14} /> Identity</h3>
                                    <div className="grid grid-cols-1 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <InfoGroup icon={<Mail />} label="Email" value={selectedUser.email} />
                                        <InfoGroup icon={<Phone />} label="Mobile" value={selectedUser.mobile} />
                                        <InfoGroup icon={<MapPin />} label="Address" value={selectedUser.address?.city ? `${selectedUser.address.city}, ${selectedUser.address.state}` : 'N/A'} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Briefcase size={14} /> Professional</h3>
                                    <div className="grid grid-cols-1 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        {selectedUser.role === 'RECRUITER' ? (
                                            <>
                                                <InfoGroup icon={<Building2 />} label="Company" value={selectedUser.companyName} />
                                                <InfoGroup icon={<Globe />} label="Industry" value={selectedUser.industry} />
                                                <InfoGroup icon={<ExternalLink />} label="Website" value={selectedUser.website} />
                                            </>
                                        ) : (
                                            <>
                                                <InfoGroup icon={<UserCheck />} label="Experience" value={`${selectedUser.experience || 0} Years`} />
                                                <InfoGroup icon={<Calendar />} label="Birthday" value={selectedUser.dob?.split('T')[0]} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 shrink-0">
                            <button onClick={() => setSelectedUser(null)} className="px-8 py-3.5 text-slate-500 font-bold text-sm">Close</button>
                            <button onClick={() => { handleDelete(selectedUser.profileId); setSelectedUser(null); }} className="px-8 py-3.5 bg-rose-600 text-white font-black rounded-2xl text-sm flex items-center gap-2">
                                <Trash2 size={16} /> Delete Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// COMPONENT: KPI CARD
const AdminStatCard = ({ icon, label, value, color }) => {
    const theme = {
        indigo: "text-indigo-600 bg-white border-indigo-100",
        emerald: "text-emerald-600 bg-white border-emerald-100",
        blue: "text-blue-600 bg-white border-blue-100",
        violet: "text-violet-600 bg-white border-violet-100",
    };

    return (
        <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-start transition-all hover:shadow-lg hover:-translate-y-1 ${theme[color]}`}>
            <div className={`mb-4 p-3 rounded-2xl bg-slate-50 ${theme[color].split(' ')[0]}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</span>
            <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        </div>
    );
};

// COMPONENT: INFO GROUP
const InfoGroup = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 text-slate-400">
            {React.cloneElement(icon, { size: 14, className: "opacity-70 shrink-0" })}
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
        </div>
        <div className="text-slate-800 font-bold text-sm truncate">
            {value || <span className="text-slate-300 font-normal italic">Unspecified</span>}
        </div>
    </div>
);

export default AdminDashboard;