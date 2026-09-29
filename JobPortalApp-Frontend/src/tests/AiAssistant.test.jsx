import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AiAssistant from '../pages/AiAssistant';
import api from '../services/api';

const state = vi.hoisted(() => ({ user: { email: 'candidate@example.test', role: 'CANDIDATE' } }));
vi.mock('react-redux', () => ({ useSelector: (select) => select({ auth: { user: state.user } }) }));
vi.mock('../services/api', () => ({ default: { post: vi.fn(), delete: vi.fn() } }));

beforeEach(() => {
  state.user = { email: 'candidate@example.test', role: 'CANDIDATE' };
  vi.clearAllMocks();
  Element.prototype.scrollTo = vi.fn();
});
afterEach(cleanup);
const mount = () => render(<MemoryRouter><AiAssistant /></MemoryRouter>);

describe('AI Assistant integration', () => {
  it('sends chat without client-controlled role and displays supporting evidence', async () => {
    api.post.mockResolvedValueOnce({ data: { answer: 'Your application is APPLIED.', agent: 'candidate',
      conversation_id: 'abc', evidence: [{ tool: 'application_status', data: [{ status: 'APPLIED' }] }] } });
    mount();
    fireEvent.click(screen.getByRole('button', { name: /Check my application status/ }));
    expect(await screen.findByText('Your application is APPLIED.')).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/ai/chat', { message: 'Check my application status', conversation_id: null }, { timeout: 300000 });
    expect(screen.getByText(/View supporting data/)).toBeInTheDocument();
  });
  it('shows provider errors and restores the question for retry', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { detail: 'Model provider denied access.' } } });
    mount();
    fireEvent.click(screen.getByRole('button', { name: /Check my application status/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Model provider denied access.');
    expect(screen.getByRole('textbox')).toHaveValue('Check my application status');
  });
  it('uploads candidate resumes as multipart data', async () => {
    api.post.mockResolvedValueOnce({ data: { resume: { summary: 'Java developer', skills: ['Java'] } } });
    const { container } = mount();
    fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [new File(['Java developer'], 'resume.txt', { type: 'text/plain' })] } });
    expect(await screen.findByText('Java developer')).toBeInTheDocument();
    expect(api.post.mock.calls[0][0]).toBe('/ai/resumes');
    expect(api.post.mock.calls[0][1]).toBeInstanceOf(FormData);
  });
  it('exposes job indexing only in the admin workspace', async () => {
    state.user = { email: 'admin@example.test', role: 'ADMIN' };
    api.post.mockResolvedValueOnce({ data: { scanned: 10, updated: 2, next_offset: 10 } });
    mount();
    expect(screen.queryByText('Upload resume')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Refresh job index/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Continue indexing/ })).toBeEnabled());
  });
});
