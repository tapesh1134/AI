import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import jobReducer from '../../redux/jobSlice';
import PostJob from '../../pages/PostJob';
import * as jobActions from '../../redux/jobSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderWithProviders = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { jobs: jobReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>
    </Provider>
  );
};

describe('PostJob Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all form fields correctly', () => {
    renderWithProviders();
    
    expect(screen.getByText(/Create Opportunity/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Senior Software Engineer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Engineering \/ Design/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Years/i)).toBeInTheDocument();
  });

  test('updates input fields on user input', () => {
    renderWithProviders();
    
    const titleInput = screen.getByPlaceholderText(/e.g. Senior Software Engineer/i);
    fireEvent.change(titleInput, { target: { value: 'Frontend Developer' } });
    expect(titleInput.value).toBe('Frontend Developer');

    const minSalaryInput = screen.getAllByRole('spinbutton')[0]; // First number input
    fireEvent.change(minSalaryInput, { target: { value: '50000' } });
    expect(minSalaryInput.value).toBe('50000');
  });

  test('adds and removes skills correctly', () => {
    renderWithProviders();
    
    const skillInput = screen.getByPlaceholderText(/Add skill/i);

    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });
    fireEvent.change(skillInput, { target: { value: 'Node' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/React/i)).toBeInTheDocument();
    expect(screen.getByText(/Node/i)).toBeInTheDocument();
    const reactSkillTag = screen.getByText(/React/i);
    const removeButton = reactSkillTag.querySelector('svg'); 
    
    if (removeButton) {
        fireEvent.click(removeButton);
    }

    expect(screen.queryByText(/React/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Node/i)).toBeInTheDocument();
  });

  test('dispatches postJob action and navigates on success', async () => {
    const mockPostAction = vi.spyOn(jobActions, 'postJob').mockReturnValue({
        type: 'jobs/post/fulfilled',
        payload: { success: true }
    });
    jobActions.postJob.fulfilled = { match: (result) => result.type === 'jobs/post/fulfilled' };

    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Software Engineer/i), { target: { value: 'DevOps' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Engineering \/ Design/i), { target: { value: 'IT' } });
    fireEvent.change(screen.getByPlaceholderText(/Remote, Mumbai, or Hybrid/i), { target: { value: 'Remote' } });
    const spinButtons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinButtons[0], { target: { value: '80000' } }); // Min Salary
    fireEvent.change(spinButtons[1], { target: { value: '120000' } }); // Max Salary
    fireEvent.change(spinButtons[2], { target: { value: '3' } }); // Experience

    const submitBtn = screen.getByText(/Publish Opportunity/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPostAction).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});