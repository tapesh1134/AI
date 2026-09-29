import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'; // Added 'within'
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import jobReducer from '../../redux/jobSlice';
import authReducer from '../../redux/authSlice';
import applicationReducer from '../../redux/applicationSlice';
import interviewReducer from '../../redux/interviewSlice';

import Dashboard from '../../pages/Dashboard';
import * as jobActions from '../../redux/jobSlice';
import * as interviewActions from '../../redux/interviewSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../redux/jobSlice', async () => {
  const actual = await vi.importActual('../../redux/jobSlice');
  return { 
    ...actual, 
    fetchJobs: vi.fn(() => ({ type: 'mock' })), 
    updateJobDetails: vi.fn(() => ({ type: 'mock' })), 
    deleteJob: vi.fn(() => ({ type: 'mock' })) 
  };
});

vi.mock('../../redux/interviewSlice', async () => {
  const actual = await vi.importActual('../../redux/interviewSlice');
  return { 
    ...actual, 
    fetchMyInterviews: vi.fn(() => ({ type: 'mock' })), 
    fetchRecruiterInterviews: vi.fn(() => ({ type: 'mock' })), 
    confirmInterview: vi.fn(() => ({ type: 'mock' })),
    completeInterview: vi.fn(() => ({ type: 'mock' }))
  };
});

const renderWithProviders = (userRole, preloadedData = {}) => {
  const store = configureStore({
    reducer: { 
        auth: authReducer, 
        jobs: jobReducer, 
        applications: applicationReducer, 
        interviews: interviewReducer 
    },
    preloadedState: {
        auth: { user: { email: 'test@user.com', role: userRole } },
        ...preloadedData
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe('Dashboard Page Component', () => {
  const mockJobs = [
    { jobId: 1, title: 'React Dev', postedBy: 'test@user.com', status: 'OPEN', category: 'IT', postedAt: new Date().toISOString() },
  ];

  const mockInterviews = [
    { interviewId: 101, status: 'SCHEDULED', candidateEmail: 'candidate@test.com', recruiterEmail: 'test@user.com', scheduledAt: new Date().toISOString(), mode: 'ONLINE', meetLink: 'http://meet.com' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  test('Recruiter can change job status directly from list', async () => {
    const updateSpy = vi.spyOn(jobActions, 'updateJobDetails');
    renderWithProviders('RECRUITER', { jobs: { list: mockJobs } });
    const jobCard = screen.getByText('React Dev').closest('.group');

    const pausedBtn = within(jobCard).getByRole('button', { name: 'PAUSED' });
    fireEvent.click(pausedBtn);
    
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        jobId: 1,
        jobData: expect.objectContaining({ status: 'PAUSED' })
    }));
  });

  test('Recruiter can open reschedule modal', async () => {
    renderWithProviders('RECRUITER', { interviews: { list: mockInterviews }, jobs: { list: mockJobs } });
    fireEvent.click(screen.getByRole('button', { name: /Meetings/i }));
    const rescheduleBtn = await screen.findByRole('button', { name: /Reschedule/i });
    fireEvent.click(rescheduleBtn);
    expect(await screen.findByText(/New Schedule/i)).toBeInTheDocument();
  });

  test('Recruiter can delete a job after confirmation', () => {
    const deleteSpy = vi.spyOn(jobActions, 'deleteJob');
    renderWithProviders('RECRUITER', { jobs: { list: mockJobs } });
    const deleteBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg.lucide-trash2'));
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});