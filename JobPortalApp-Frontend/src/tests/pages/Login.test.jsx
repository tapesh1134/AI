import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import authReducer from '../../redux/authSlice';
import Login from '../../pages/Login'; 
import * as authActions from '../../redux/authSlice';

const renderWithProviders = (preloadedState) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );
};

vi.mock('../../redux/authSlice', async () => {
  const actual = await vi.importActual('../../redux/authSlice');
  return {
    ...actual,
    loginUser: vi.fn(() => ({ type: 'auth/login/pending' })),
  };
});

describe('Login Page Component', () => {
  
  test('renders login form correctly', () => {
    renderWithProviders({ auth: { loading: false, error: null } });
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });

  test('dispatches login action on form submission', async () => {
    const mockLoginUser = vi.spyOn(authActions, 'loginUser');
    renderWithProviders({ auth: { loading: false, error: null } });

    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalled();
    });
  });
});