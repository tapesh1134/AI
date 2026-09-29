import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import jobReducer from '../../redux/jobSlice';
import authReducer from '../../redux/authSlice';
import profileReducer from '../../redux/profileSlice';
import applicationReducer from '../../redux/applicationSlice';

import JobDetails from '../../pages/JobDetails';

vi.mock('../../redux/jobSlice', async () => {
  const actual = await vi.importActual('../../redux/jobSlice');
  return { ...actual, fetchJobById: vi.fn(() => ({ type: 'mock/fetch' })) };
});

vi.mock('../../redux/profileSlice', async () => {
  const actual = await vi.importActual('../../redux/profileSlice');
  return { ...actual, fetchRecruiterPublicProfile: vi.fn(() => ({ type: 'mock/fetch' })) };
});

vi.mock('../../redux/applicationSlice', async () => {
  const actual = await vi.importActual('../../redux/applicationSlice');
  return { ...actual, fetchMyApplications: vi.fn(() => ({ type: 'mock/fetch' })) };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { 
    ...actual, 
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '101' }) 
  };
});

const renderWithProviders = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { 
        jobs: jobReducer,
        auth: authReducer,
        profile: profileReducer,
        applications: applicationReducer
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <JobDetails />
      </MemoryRouter>
    </Provider>
  );
};

describe('JobDetails Page Component', () => {
  const mockJob = {
    jobId: 101,
    title: 'Software Architect',
    category: 'Engineering',
    type: 'FULL_TIME',
    location: 'Berlin',
    salaryMin: 120000,
    salaryMax: 180000,
    experienceRequired: 8,
    status: 'OPEN',
    skills: ['Java', 'AWS'],
    postedBy: 'recruiter@test.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    renderWithProviders({ jobs: { loading: true, selectedJob: null } });
    expect(screen.getByText(/Fetching Details/i)).toBeInTheDocument();
  });

  test('shows "Sign in to Apply" for unauthenticated users', async () => {
    renderWithProviders({ 
      auth: { isAuthenticated: false },
      jobs: { selectedJob: mockJob, loading: false }
    });

    const btn = await screen.findByRole('button', { name: /sign in to apply/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows "Apply for Position" for candidates who haven’t applied', async () => {
    renderWithProviders({ 
      auth: { isAuthenticated: true, user: { role: 'CANDIDATE' } },
      jobs: { selectedJob: mockJob, loading: false },
      applications: { list: [] }
    });

    expect(await screen.findByRole('button', { name: /apply for position/i })).toBeInTheDocument();
  });

  test('shows "Already Applied" if candidate has already submitted application', async () => {
    renderWithProviders({ 
      auth: { isAuthenticated: true, user: { role: 'CANDIDATE' } },
      jobs: { selectedJob: mockJob, loading: false },
      applications: { list: [{ jobId: 101 }] } 
    });

    expect(await screen.findByText(/Already Applied/i)).toBeInTheDocument();
  });

  test('shows "Recruiters Cannot Apply" for recruiter users', async () => {
    renderWithProviders({ 
      auth: { isAuthenticated: true, user: { role: 'RECRUITER' } },
      jobs: { selectedJob: mockJob, loading: false }
    });

    expect(await screen.findByText(/Recruiters Cannot Apply/i)).toBeInTheDocument();
  });

  test('shows job status (e.g. PAUSED) if job is not open', async () => {
    const closedJob = { ...mockJob, status: 'PAUSED' };
    renderWithProviders({ 
      auth: { isAuthenticated: true, user: { role: 'CANDIDATE' } },
      jobs: { selectedJob: closedJob, loading: false }
    });

    expect(await screen.findByText(/Hiring PAUSED/i)).toBeInTheDocument();
  });

  test('navigates back when back button is clicked', async () => {
    renderWithProviders({ 
      jobs: { selectedJob: mockJob, loading: false }
    });

    const backBtn = await screen.findByText(/Back to listings/i);
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});