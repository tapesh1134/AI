import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProfile } from '../redux/profileSlice';
import { AlertCircle, User, Briefcase, MapPin, Globe, Phone, Calendar } from 'lucide-react';

// 1. MOVE THIS OUTSIDE THE MAIN COMPONENT
const FormField = ({ label, name, type = "text", placeholder, icon: Icon, value, onChange, errors }) => {
  // Extract the specific error for this field (handling nested address keys)
  const fieldName = name.includes('.') ? name.split('.').pop() : name;
  const error = errors[fieldName];

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={14} />} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition focus:ring-2 
          ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500'}`}
      />
      {error && (
        <p className="text-red-500 text-[11px] flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

const CompleteProfile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    address: { houseNo: '', street: '', city: '', state: '', pincode: '' },
    dob: '', 
    gender: '', 
    skills: '', 
    experience: '', 
    resumeUrl: '',
    companyName: '', 
    companySize: '', 
    industry: '', 
    website: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this specific field
    const fieldName = name.includes('.') ? name.split('.').pop() : name;
    if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!/^\d{6}$/.test(formData.address.pincode)) newErrors.pincode = "Enter a 6-digit pincode";

    if (user?.role === 'CANDIDATE') {
      if (!formData.skills.trim()) newErrors.skills = "Please add at least one skill";
      if (!formData.resumeUrl || !urlPattern.test(formData.resumeUrl)) newErrors.resumeUrl = "Valid Resume URL required";
      if (formData.experience === "" || formData.experience < 0) newErrors.experience = "Experience is required";
    }

    if (user?.role === 'RECRUITER') {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (formData.website && !urlPattern.test(formData.website)) newErrors.website = "Valid website URL required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const submissionData = { ...formData };
    if (user?.role === 'CANDIDATE') {
      submissionData.skills = formData.skills.split(',').map(s => s.trim()).filter(s => s !== "");
    }

    const result = await dispatch(createProfile({ role: user.role, profileData: submissionData }));
    setIsSubmitting(false);
    
    if (createProfile.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
        <header className="mb-10">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <User size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Complete Profile</h1>
          <p className="text-slate-500">Tell us more about yourself to get started as a <span className="font-semibold text-blue-600">{user?.role}</span></p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Full Name" name="fullName" placeholder="John Doe" icon={User} value={formData.fullName} onChange={handleChange} errors={errors} />
              <FormField label="Mobile Number" name="mobile" type="number" placeholder="9876543210" icon={Phone} value={formData.mobile} onChange={handleChange} errors={errors} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
              <MapPin size={16} /> Address Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField label="House No" name="address.houseNo" placeholder="123" value={formData.address.houseNo} onChange={handleChange} errors={errors} />
              <FormField label="Street" name="address.street" placeholder="Main St" value={formData.address.street} onChange={handleChange} errors={errors} />
              <FormField label="City" name="address.city" placeholder="New York" value={formData.address.city} onChange={handleChange} errors={errors} />
              <FormField label="State" name="address.state" placeholder="NY" value={formData.address.state} onChange={handleChange} errors={errors} />
              <FormField label="Pincode" name="address.pincode" type="number" placeholder="100001" value={formData.address.pincode} onChange={handleChange} errors={errors} />
            </div>
          </section>

          {user?.role === 'CANDIDATE' ? (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Briefcase size={16} /> Professional Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Date of Birth" name="dob" type="date" icon={Calendar} value={formData.dob} onChange={handleChange} errors={errors} />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2"><User size={14}/> Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <FormField label="Skills" name="skills" placeholder="React, Node, Figma" value={formData.skills} onChange={handleChange} errors={errors} />
                <FormField label="Experience (Years)" name="experience" type="number" placeholder="2" value={formData.experience} onChange={handleChange} errors={errors} />
                <div className="md:col-span-2">
                  <FormField label="Resume URL" name="resumeUrl" placeholder="https://..." icon={Globe} value={formData.resumeUrl} onChange={handleChange} errors={errors} />
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Briefcase size={16} /> Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Company Name" name="companyName" placeholder="Tech Corp" value={formData.companyName} onChange={handleChange} errors={errors} />
                <FormField label="Industry" name="industry" placeholder="Software" value={formData.industry} onChange={handleChange} errors={errors} />
                <FormField label="Company Size" name="companySize" placeholder="50-100" value={formData.companySize} onChange={handleChange} errors={errors} />
                <FormField label="Website URL" name="website" placeholder="https://company.com" icon={Globe} value={formData.website} onChange={handleChange} errors={errors} />
              </div>
            </section>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-extrabold text-white transition-all transform active:scale-[0.98]
              ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
          >
            {isSubmitting ? 'Saving Profile...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;