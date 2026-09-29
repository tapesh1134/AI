import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { submitApplication } from '../redux/applicationSlice';
import { fetchJobById } from '../redux/jobSlice';
import { FileText, Link as LinkIcon, Send, AlertCircle } from 'lucide-react';

const ApplyJob = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { selectedJob: job } = useSelector(state => state.jobs);
  
  const [formData, setFormData] = useState({ coverLetter: '', resumeUrl: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CANDIDATE') {
      navigate(`/jobs/${id}`);
    }
    dispatch(fetchJobById(id));
  }, [id, isAuthenticated, user, navigate, dispatch]);

  const validate = () => {
    let tempErrors = {};
    
    // Resume URL Validation
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i' // fragment locator
    );
    
    if (!formData.resumeUrl) {
      tempErrors.resumeUrl = "Resume URL is required";
    } else if (!urlPattern.test(formData.resumeUrl)) {
      tempErrors.resumeUrl = "Please enter a valid URL (e.g., https://drive.google.com/...)";
    }

    // Cover Letter Validation
    if (!formData.coverLetter.trim()) {
      tempErrors.coverLetter = "Cover letter cannot be empty";
    } else if (formData.coverLetter.trim().length < 50) {
      tempErrors.coverLetter = "Cover letter should be at least 50 characters long";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      const result = await dispatch(submitApplication({ jobId: id, ...formData }));
      setIsSubmitting(false);
      
      if (submitApplication.fulfilled.match(result)) {
        alert("Application submitted successfully!");
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-15 pb-15 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Apply for {job?.title || 'Position'}</h1>
          <p className="text-slate-500">Submit your application to {job?.companyName || 'the recruiter'}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume URL Field */}
          <div className="space-y-2">
            <label className={`text-sm font-bold flex items-center gap-2 ${errors.resumeUrl ? 'text-red-500' : 'text-slate-700'}`}>
              <LinkIcon size={16} /> Resume URL
            </label>
            <input 
              name="resumeUrl"
              type="url" 
              className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition focus:ring-2 
                ${errors.resumeUrl ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
              placeholder="https://drive.google.com/your-resume"
              value={formData.resumeUrl}
              onChange={handleChange}
            />
            {errors.resumeUrl && (
              <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.resumeUrl}
              </p>
            )}
          </div>

          {/* Cover Letter Field */}
          <div className="space-y-2">
            <label className={`text-sm font-bold flex items-center gap-2 ${errors.coverLetter ? 'text-red-500' : 'text-slate-700'}`}>
              <FileText size={16} /> Cover Letter
            </label>
            <textarea 
              name="coverLetter"
              rows="6" 
              className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition focus:ring-2 
                ${errors.coverLetter ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
              placeholder="Tell the recruiter why you are a good fit..."
              value={formData.coverLetter}
              onChange={handleChange}
            ></textarea>
            {errors.coverLetter && (
              <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.coverLetter}
              </p>
            )}
            <p className="text-slate-400 text-[10px] text-right">
              {formData.coverLetter.length} characters (min 50)
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 
              ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}`}
          >
            {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;