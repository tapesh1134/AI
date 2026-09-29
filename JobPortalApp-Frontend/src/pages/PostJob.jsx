import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { postJob } from '../redux/jobSlice';
import { 
    Briefcase, MapPin, DollarSign, Target, Plus, X, 
    ChevronLeft, Sparkles, Layers, Clock, ShieldCheck, AlertCircle
} from 'lucide-react';

const PostJob = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '', category: '', type: 'FULL_TIME', location: '', 
        salaryMin: '', salaryMax: '', experienceRequired: '', skills: [], status: 'OPEN'
    });
    
    const [skillInput, setSkillInput] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        
        // String Validations
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.category.trim()) newErrors.category = "Category is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";

        // Numeric Validations
        const minSal = Number(formData.salaryMin);
        const maxSal = Number(formData.salaryMax);
        const exp = Number(formData.experienceRequired);

        if (!formData.salaryMin || minSal <= 0) newErrors.salaryMin = "Enter valid min salary";
        if (!formData.salaryMax || maxSal <= 0) newErrors.salaryMax = "Enter valid max salary";
        if (minSal > maxSal) newErrors.salaryMax = "Max salary cannot be less than min salary";
        
        if (formData.experienceRequired === "" || exp < 0) {
            newErrors.experienceRequired = "Experience is required (use 0 for freshers)";
        }

        // Skills Validation
        if (formData.skills.length === 0) {
            newErrors.skills = "Please add at least one required skill";
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
                // Clear skill error if it existed
                if (errors.skills) setErrors({ ...errors, skills: null });
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
        const result = await dispatch(postJob(formData));
        setIsSubmitting(false);

        if (postJob.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-10 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                
                {/* BACK BUTTON & HEADER */}
                <div className="mb-10">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition font-bold text-sm mb-6 group"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Opportunity</h1>
                            <p className="text-slate-500 font-medium mt-1">Fill in the details to find your next great hire.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100">
                            <Sparkles size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Premium Listing</span>
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
                            <h3 className="text-xl font-black text-slate-900">Core Job Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField 
                                label="Job Title" 
                                icon={<Briefcase size={16}/>}
                                value={formData.title} 
                                error={errors.title}
                                onChange={v => { setFormData({...formData, title: v}); if(errors.title) setErrors({...errors, title: null}); }} 
                                placeholder="e.g. Senior Software Engineer" 
                            />
                            <InputField 
                                label="Category" 
                                icon={<Layers size={16}/>}
                                value={formData.category} 
                                error={errors.category}
                                onChange={v => { setFormData({...formData, category: v}); if(errors.category) setErrors({...errors, category: null}); }} 
                                placeholder="e.g. Engineering / Design" 
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Arrangement</label>
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
                                onChange={v => { setFormData({...formData, location: v}); if(errors.location) setErrors({...errors, location: null}); }} 
                                placeholder="e.g. Remote, Mumbai, or Hybrid" 
                            />
                        </div>
                    </div>

                    {/* SECTION 2: BUDGET & EXP */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Compensation & Experience</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Min Salary (₹)" type="number" value={formData.salaryMin} error={errors.salaryMin} onChange={v => { setFormData({...formData, salaryMin: v}); if(errors.salaryMin) setErrors({...errors, salaryMin: null}); }} />
                            <InputField label="Max Salary (₹)" type="number" value={formData.salaryMax} error={errors.salaryMax} onChange={v => { setFormData({...formData, salaryMax: v}); if(errors.salaryMax) setErrors({...errors, salaryMax: null}); }} />
                            <InputField label="Min. Experience" type="number" value={formData.experienceRequired} error={errors.experienceRequired} onChange={v => { setFormData({...formData, experienceRequired: v}); if(errors.experienceRequired) setErrors({...errors, experienceRequired: null}); }} placeholder="Years" />
                        </div>
                    </div>

                    {/* SECTION 3: SKILLS */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-100">
                                <Target size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Skillset Requirements</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="relative group">
                                <Plus size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.skills ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                                <input 
                                    type="text" 
                                    className={`w-full pl-12 pr-4 py-5 bg-slate-50 border rounded-2xl text-sm font-medium outline-none transition focus:ring-2 
                                        ${errors.skills ? 'border-red-200 focus:ring-red-100' : 'border-slate-100 focus:ring-blue-600'}`}
                                    placeholder="Add skill (e.g. React, Python) and press Enter..."
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                />
                            </div>
                            {errors.skills && (
                                <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1 animate-in slide-in-from-top-1">
                                    <AlertCircle size={14} /> {errors.skills}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.skills.map((skill, index) => (
                                    <span key={index} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all group">
                                        {skill}
                                        <X 
                                            size={14} 
                                            className="cursor-pointer opacity-50 group-hover:opacity-100" 
                                            onClick={() => removeSkill(index)} 
                                        />
                                    </span>
                                ))}
                                {formData.skills.length === 0 && !errors.skills && (
                                    <p className="text-xs text-slate-400 italic font-medium ml-2">No skills added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button 
                            disabled={isSubmitting}
                            className={`flex-[2] py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3
                                ${isSubmitting ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-100'}`}
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                            ) : (
                                <><ShieldCheck size={20} /> Publish Opportunity</>
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
            {icon && (
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-400'}`}>
                    {icon}
                </div>
            )}
            <input 
                type={type} 
                className={`w-full ${icon ? 'pl-12' : 'px-5'} pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 outline-none transition focus:ring-2 
                    ${error ? 'border-red-200 focus:ring-red-100' : 'border-slate-100 focus:ring-blue-600'} 
                    placeholder:text-slate-300 placeholder:font-medium`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
        {error && (
            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 ml-1 mt-1 animate-in slide-in-from-top-1">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

export default PostJob;