import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../redux/authSlice';
import Signup from '../../pages/Signup';
import * as authActions from '../../redux/authSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderWithProviders = (preloadedState) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    </Provider>
  );
};

describe('Signup Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders signup form with role options', () => {
    renderWithProviders({ auth: { loading: false, error: null } });
    
    expect(screen.getByText(/Join the Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Candidate/i)).toBeInTheDocument();
    expect(screen.getByText(/Recruiter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
  });

  test('shows error if passwords do not match', async () => {
    renderWithProviders({ auth: { loading: false, error: null } });

    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Create strong password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Repeat your password/i), { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test('toggles role selection between Candidate and Recruiter', () => {
    renderWithProviders({ auth: { loading: false, error: null } });

    const candidateBtn = screen.getByRole('button', { name: /candidate/i });
    const recruiterBtn = screen.getByRole('button', { name: /recruiter/i });
    fireEvent.click(recruiterBtn);
    expect(recruiterBtn).toHaveClass('border-indigo-600');

    fireEvent.click(candidateBtn);
    expect(candidateBtn).toHaveClass('border-indigo-600');
  });

  test('dispatches signupUser and navigates on success', async () => {
    const mockSignupAction = vi.spyOn(authActions, 'signupUser').mockReturnValue({
        type: 'auth/signup/fulfilled',
        payload: {},
        meta: { requestStatus: 'fulfilled' }
    });
    
    authActions.signupUser.fulfilled = { match: (result) => result.type === 'auth/signup/fulfilled' };

    renderWithProviders({ auth: { loading: false, error: null } });

    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), { target: { value: 'newuser@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Create strong password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Repeat your password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignupAction).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        password: 'password123',
        role: 'CANDIDATE',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});