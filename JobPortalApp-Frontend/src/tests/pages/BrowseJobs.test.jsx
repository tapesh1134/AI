import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import jobReducer from '../../redux/jobSlice';
import BrowseJobs from '../../pages/BrowseJobs';
import * as jobActions from '../../redux/jobSlice';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Redux Thunks
vi.mock('../../redux/jobSlice', async () => {
  const actual = await vi.importActual('../../redux/jobSlice');
  return {
    ...actual,
    fetchJobs: vi.fn(() => ({ type: 'jobs/fetchAll/fulfilled' })),
    searchJobs: vi.fn(() => ({ type: 'jobs/search/fulfilled' })),
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
        <BrowseJobs />
      </MemoryRouter>
    </Provider>
  );
};

describe('BrowseJobs Page Component', () => {
  const mockJobs = [
    {
      jobId: 1,
      title: 'React Developer',
      category: 'IT',
      location: 'Remote',
      type: 'FULL_TIME',
      salaryMin: 50000,
      salaryMax: 80000,
      status: 'OPEN',
      skills: ['React', 'CSS']
    },
    {
      jobId: 2,
      title: 'Backend Engineer',
      category: 'IT',
      location: 'New York',
      type: 'CONTRACT',
      salaryMin: 90000,
      salaryMax: 120000,
      status: 'OPEN',
      skills: ['Node', 'SQL']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows empty state message when no jobs are found', () => {
    renderWithProviders({ jobs: { list: [], loading: false } });
    expect(screen.getByText(/No vacancies matched/i)).toBeInTheDocument();
  });

  test('triggers search by title when Search button is clicked', async () => {
    const searchSpy = vi.spyOn(jobActions, 'searchJobs');
    renderWithProviders({ jobs: { list: mockJobs, loading: false } });

    const searchInput = screen.getByPlaceholderText(/Search by job title/i);
    fireEvent.change(searchInput, { target: { value: 'Frontend' } });

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);

    expect(searchSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Frontend' }));
  });

  test('applies sidebar filters correctly', () => {
    const searchSpy = vi.spyOn(jobActions, 'searchJobs');
    renderWithProviders({ jobs: { list: mockJobs, loading: false } });

    // Fill filter fields
    fireEvent.change(screen.getByPlaceholderText(/e.g. Remote, NYC/i), { target: { value: 'Remote' } });
    fireEvent.change(screen.getByPlaceholderText('Min'), { target: { value: '40000' } });

    const applyBtn = screen.getByText(/Apply Filters/i);
    fireEvent.click(applyBtn);

    expect(searchSpy).toHaveBeenCalledWith(expect.objectContaining({
      location: 'Remote',
      minSalary: 40000
    }));
  });

  test('clears filters and re-fetches jobs when Reset is clicked', () => {
    const fetchSpy = vi.spyOn(jobActions, 'fetchJobs');
    renderWithProviders({ jobs: { list: mockJobs, loading: false } });

    const resetBtn = screen.getByText(/Reset/i);
    fireEvent.click(resetBtn);

    expect(fetchSpy).toHaveBeenCalledTimes(2); // Once on mount, once on reset
  });
});