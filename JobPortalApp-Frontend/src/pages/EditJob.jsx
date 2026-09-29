import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobById, updateJobDetails } from '../redux/jobSlice';
import { 
    Briefcase, MapPin, DollarSign, Target, Plus, X, 
    ChevronLeft, Save, Sparkles, Layers, Clock, 
    RotateCcw, Info, AlertCircle
} from 'lucide-react';

const EditJob = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedJob, loading: fetching } = useSelector((state) => state.jobs);
    const [skillInput, setSkillInput] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '', category: '', type: 'FULL_TIME', location: '', 
        salaryMin: '', salaryMax: '', experienceRequired: '', skills: [], status: 'OPEN'
    });

    useEffect(() => {
        dispatch(fetchJobById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedJob && selectedJob.jobId?.toString() === id) {
            setFormData({
                title: selectedJob.title || '',
                category: selectedJob.category || '',
                type: selectedJob.type || 'FULL_TIME',
                location: selectedJob.location || '',
                salaryMin: selectedJob.salaryMin || '',
                salaryMax: selectedJob.salaryMax || '',
                experienceRequired: selectedJob.experienceRequired || '',
                skills: selectedJob.skills || [],
                status: selectedJob.status || 'OPEN'
            });
        }
    }, [selectedJob, id]);

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.category.trim()) newErrors.category = "Category is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        
        const minSal = Number(formData.salaryMin);
        const maxSal = Number(formData.salaryMax);

        if (minSal <= 0) newErrors.salaryMin = "Min salary must be greater than 0";
        if (maxSal <= 0) newErrors.salaryMax = "Max salary must be greater than 0";
        if (minSal > maxSal) newErrors.salaryMax = "Max salary cannot be less than Min salary";
        
        if (formData.experienceRequired === "" || formData.experienceRequired < 0) {
            newErrors.experienceRequired = "Experience is required (0 for freshers)";
        }
        
        if (formData.skills.length === 0) {
            newErrors.skills = "At least one skill is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            const skill = skillInput.trim();
            if (!formData.skills.includes(skill)) {
                setFormData({ ...formData, skills: [...formData.skills, skill] });
                setErrors({ ...errors, skills: null });
            }
            setSkillInput('');
        }
    };

    const removeSkill = (index) => {
        setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const result = await dispatch(updateJobDetails({ jobId: id, jobData: formData }));
        setIsSubmitting(false);
        
        if (updateJobDetails.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Retrieving Listing...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-10 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                
                {/* HEADER & NAVIGATION */}
                <div className="mb-10">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition font-bold text-sm mb-6 group"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Cancel Editing
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <RotateCcw size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Management Console</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Posting</h1>
                            <p className="text-slate-500 font-medium">Refining: <span className="text-slate-900 font-bold">"{formData.title || 'Untitled Job'}"</span></p>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm shadow-amber-100">
                            <Info size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Job ID: {id}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECTION 1: CORE DETAILS */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                                <Briefcase size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Core Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField 
                                label="Job Title" 
                                icon={<Briefcase size={16}/>}
                                value={formData.title} 
                                error={errors.title}
                                onChange={v => { setFormData({...formData, title: v}); setErrors({...errors, title: null}); }} 
                            />
                            <InputField 
                                label="Category" 
                                icon={<Layers size={16}/>}
                                value={formData.category} 
                                error={errors.category}
                                onChange={v => { setFormData({...formData, category: v}); setErrors({...errors, category: null}); }} 
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Type</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select 
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none cursor-pointer" 
                                        value={formData.type} 
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="INTERNSHIP">Internship</option>
                                    </select>
                                </div>
                            </div>
                            <InputField 
                                label="Location" 
                                icon={<MapPin size={16}/>}
                                value={formData.location} 
                                error={errors.location}
                                onChange={v => { setFormData({...formData, location: v}); setErrors({...errors, location: null}); }} 
                            />
                        </div>
                    </div>

                    {/* SECTION 2: FINANCE & EXPERIENCE */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Salary & Experience</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Min Salary" type="number" value={formData.salaryMin} error={errors.salaryMin} onChange={v => { setFormData({...formData, salaryMin: v}); setErrors({...errors, salaryMin: null}); }} />
                            <InputField label="Max Salary" type="number" value={formData.salaryMax} error={errors.salaryMax} onChange={v => { setFormData({...formData, salaryMax: v}); setErrors({...errors, salaryMax: null}); }} />
                            <InputField label="Experience (Years)" type="number" value={formData.experienceRequired} error={errors.experienceRequired} onChange={v => { setFormData({...formData, experienceRequired: v}); setErrors({...errors, experienceRequired: null}); }} />
                        </div>
                    </div>

                    {/* SECTION 3: SKILLS */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-100">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Requirement Update</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                {formData.skills.length} Skills Added
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="relative group">
                                <Plus size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.skills ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                                <input 
                                    type="text" 
                                    className={`w-full pl-12 pr-4 py-5 bg-slate-50 border rounded-2xl text-sm font-medium outline-none transition focus:ring-2 
                                        ${errors.skills ? 'border-red-200 focus:ring-red-100' : 'border-slate-100 focus:ring-blue-600'}`}
                                    placeholder="Add skill (e.g. React) and press Enter..."
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                />
                            </div>
                            {errors.skills && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1"><AlertCircle size={14}/> {errors.skills}</p>}

                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.skills.length === 0 && !errors.skills && (
                                    <p className="text-slate-400 text-xs italic ml-2">No skills added yet.</p>
                                )}
                                {formData.skills.map((skill, index) => (
                                    <span key={index} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all group">
                                        {skill}
                                        <X 
                                            size={14} 
                                            className="cursor-pointer opacity-50 group-hover:opacity-100" 
                                            onClick={() => removeSkill(index)} 
                                        />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 py-5 rounded-[2rem] font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition uppercase tracking-widest text-[10px]"
                        >
                            Discard Changes
                        </button>
                        <button 
                            disabled={isSubmitting}
                            className={`flex-[2] py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3
                            ${isSubmitting ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-100'}`}
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                            ) : (
                                <><Save size={20} /> Apply Updates</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, icon, type = "text", error }) => (
    <div className="space-y-2">
        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${error ? 'text-red-500' : 'text-slate-400'}`}>
            {label}
        </label>
        <div className="relative">
            {icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-400'}`}>{icon}</div>}
            <input 
                type={type} 
                className={`w-full ${icon ? 'pl-12' : 'px-5'} pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 outline-none transition focus:ring-2 
                    ${error ? 'border-red-200 focus:ring-red-100' : 'border-slate-100 focus:ring-blue-600'}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 ml-1 mt-1 animate-in slide-in-from-top-1"><AlertCircle size={12}/> {error}</p>}
    </div>
);

export default EditJob;