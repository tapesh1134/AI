import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import jobReducer from '../../redux/jobSlice';
import EditJob from '../../pages/EditJob';
import * as jobActions from '../../redux/jobSlice';

// 1. Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '123' }),
  };
});

// 2. Mock the thunks to prevent them from setting loading: true in the real reducer
vi.mock('../../redux/jobSlice', async () => {
    const actual = await vi.importActual('../../redux/jobSlice');
    return {
      ...actual,
      // Mocking fetchJobById to return a dummy action so it doesn't trigger 'pending'
      fetchJobById: vi.fn(() => ({ type: 'jobs/fetchById/fulfilled' })),
      updateJobDetails: vi.fn(() => ({ type: 'jobs/update/fulfilled' })),
    };
});

const renderWithProviders = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { jobs: jobReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <EditJob />
      </MemoryRouter>
    </Provider>
  );
};

describe('EditJob Page Component', () => {
  const mockJob = {
    jobId: 123,
    title: 'Senior Developer',
    category: 'Engineering',
    type: 'FULL_TIME',
    location: 'Remote',
    salaryMin: 100000,
    salaryMax: 150000,
    experienceRequired: 5,
    skills: ['React', 'Vitest']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('pre-fills the form with existing job data', async () => {
    renderWithProviders({ 
        jobs: { loading: false, selectedJob: mockJob } 
    });

    // Wait for the form to appear (it should appear immediately because loading is false)
    const titleInput = await screen.findByDisplayValue('Senior Developer');
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engineering')).toBeInTheDocument();
    expect(screen.getByText(/React/i)).toBeInTheDocument();
  });

  test('adds and removes skills in the edit form', async () => {
    renderWithProviders({ jobs: { loading: false, selectedJob: mockJob } });

    await screen.findByDisplayValue('Senior Developer');
    const skillInput = screen.getByPlaceholderText(/Add skill and press Enter/i);

    fireEvent.change(skillInput, { target: { value: 'Docker' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText(/Docker/i)).toBeInTheDocument();

    const reactTag = screen.getByText(/React/i);
    const removeBtn = reactTag.querySelector('svg');
    if (removeBtn) fireEvent.click(removeBtn);

    expect(screen.queryByText(/React/i)).not.toBeInTheDocument();
  });

  test('navigates to dashboard when cancel is clicked', async () => {
    renderWithProviders({ jobs: { loading: false, selectedJob: mockJob } });
    
    await screen.findByDisplayValue('Senior Developer');
    const cancelBtn = screen.getByText(/Cancel Editing/i);
    fireEvent.click(cancelBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});