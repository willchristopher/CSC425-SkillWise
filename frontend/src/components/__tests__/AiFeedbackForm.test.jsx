import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AiFeedbackForm from '../AiFeedbackForm';

jest.mock('axios');

describe('AiFeedbackForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields', async () => {
    render(<AiFeedbackForm />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });

  it('submits form and shows success', async () => {
    axios.post.mockResolvedValueOnce({ data: { submissionId: 123, status: 'queued', aiSummary: 'Great job!' } });
    render(<AiFeedbackForm />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Solution' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'My approach...' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/submission received/i)).toBeInTheDocument();
    expect(screen.getByText(/great job/i)).toBeInTheDocument();
  });

  it('handles server error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });
    render(<AiFeedbackForm />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Solution' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'My approach...' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
