import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import profileReducer from '../../redux/profileSlice';
import authReducer from '../../redux/authSlice';
import CompleteProfile from '../../pages/CompleteProfile';
import * as profileActions from '../../redux/profileSlice';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock the thunk
vi.mock('../../redux/profileSlice', async () => {
    const actual = await vi.importActual('../../redux/profileSlice');
    return {
      ...actual,
      createProfile: vi.fn(() => ({ type: 'profile/create/fulfilled' })),
    };
});

const renderWithProviders = (userRole) => {
  const store = configureStore({
    reducer: { 
        profile: profileReducer,
        auth: authReducer 
    },
    preloadedState: {
        auth: { user: { role: userRole } }
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CompleteProfile />
      </MemoryRouter>
    </Provider>
  );
};

describe('CompleteProfile Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Candidate specific fields when role is CANDIDATE', () => {
    renderWithProviders('CANDIDATE');
    
    expect(screen.getByText(/Complete Your CANDIDATE Profile/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Skills \(comma separated\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Resume URL/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Company Name/i)).not.toBeInTheDocument();
  });

  test('renders Recruiter specific fields when role is RECRUITER', () => {
    renderWithProviders('RECRUITER');
    
    expect(screen.getByText(/Complete Your RECRUITER Profile/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Industry/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Skills \(comma separated\)/i)).not.toBeInTheDocument();
  });

  test('updates common address fields correctly', () => {
    renderWithProviders('CANDIDATE');
    
    const cityInput = screen.getByPlaceholderText(/City/i);
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
    expect(cityInput.value).toBe('Mumbai');
  });

  test('candidate submission splits skills string into an array', async () => {
    const mockCreateAction = vi.spyOn(profileActions, 'createProfile');
    // Mock the .match function for the fulfilled check
    profileActions.createProfile.fulfilled = { match: () => true };

    renderWithProviders('CANDIDATE');

    // Fill common fields
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Mobile Number/i), { target: { value: '1234567890' } });
    
    // Fill Candidate fields
    fireEvent.change(screen.getByPlaceholderText(/Skills \(comma separated\)/i), { 
        target: { value: 'React, Node, Testing' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /Save & Continue/i }));

    await waitFor(() => {
      expect(mockCreateAction).toHaveBeenCalledWith(expect.objectContaining({
        role: 'CANDIDATE',
        profileData: expect.objectContaining({
          // Verify string was converted to array and trimmed
          skills: ['React', 'Node', 'Testing']
        })
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});