import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { fetchCurrentUser, updateUserRole } from './redux/authSlice';
import { fetchProfile } from './redux/profileSlice';

import Home from './pages/Home';
import AiAssistant from './pages/AiAssistant';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ManageProfile from './pages/ManageProfile';

import Navbar from './components/Navbar';
import BrowseJobs from './pages/BrowseJobs';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import EditJob from './pages/EditJob';
import ApplyJob from './pages/ApplyJob';
import JobApplications from './pages/JobApplications';
import JobApplicants from './pages/JobApplicants';
import Subscription from './pages/Subscription';
import Billing from './pages/Billing';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard'; // Added
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/ForgotPassword';
import AboutUs from './pages/AboutUs';

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  const { user, isAuthenticated, selectedRole } = useSelector((state) => state.auth);
  const { profileExists, loading: profileLoading } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchCurrentUser()).then((action) => {
      const userData = action.payload;
      if (!userData) return;

      if (!userData.role && selectedRole) {
        dispatch(updateUserRole(selectedRole)).then(() => {
          dispatch(fetchCurrentUser());
        });
      }
    }).finally(() => setAuthChecked(true));
  }, [dispatch, selectedRole]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      dispatch(fetchProfile(user.email));
    }
  }, [isAuthenticated, user?.email, dispatch]);

  if (
    user?.role !== 'ADMIN' &&
    isAuthenticated &&
    profileExists === false &&
    profileExists !== null &&
    !profileLoading &&
    location.pathname !== '/complete-profile'
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-assistant" element={!authChecked ? <div className="p-12 text-center">Loading your workspace…</div> : isAuthenticated ? <AiAssistant /> : <Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/dashboard" element={
            isAuthenticated ? (
              user?.role === 'ADMIN' ? (
                <AdminDashboard />
              ) : (
                <Dashboard />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/manage-profile" element={<ManageProfile />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/:id/apply" element={<ApplyJob />} />
          <Route path="/post-job" element={isAuthenticated && user?.role === 'RECRUITER'
            ? <PostJob />
            : <Navigate to="/dashboard" />
          } />

          <Route path="/edit-job/:id" element={isAuthenticated && user?.role === 'RECRUITER'
            ? <EditJob />
            : <Navigate to="/dashboard" />
          } />
          <Route path="/subscription" element={isAuthenticated && user?.role === 'RECRUITER'
            ? <Subscription />
            : <Navigate to="/dashboard" />
          } />
          <Route path="/billing" element={isAuthenticated && user?.role === 'RECRUITER'
            ? <Billing />
            : <Navigate to="/dashboard" />
          } />
          <Route
            path="/analytics/:jobId" element={isAuthenticated ? (user?.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : (
              <JobApplicants />
            )
            ) : (
              <Navigate to="/login" replace />
            )
            } />
          <Route path="/jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="/job/:jobId/applicants" element={<JobApplicants />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path='/about-us' element={<AboutUs />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;