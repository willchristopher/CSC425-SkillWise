import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AiChallengeGenerator from '../AiChallengeGenerator';

jest.mock('axios');

describe('AiChallengeGenerator', () => {
  const exampleResponse = {
    title: 'Reverse Pairs',
    description: 'Given an array of integers, count the number of pairs (i,j) where i<j and nums[i] > nums[j]. Provide O(n log n) solution.',
    difficulty: 'medium',
    hints: ['Use merge sort pattern', 'Count cross inversions'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the generate button (snapshot)', () => {
    const { asFragment } = render(<AiChallengeGenerator />);
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('opens modal and displays challenge on success', async () => {
    axios.post.mockResolvedValueOnce({ data: exampleResponse });
    render(<AiChallengeGenerator />);
    const btn = screen.getByTestId('generate-btn');
    fireEvent.click(btn);
    expect(await screen.findByTestId('modal-bg')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('challenge-content')).toBeInTheDocument());
    expect(screen.getByText(exampleResponse.title)).toBeInTheDocument();
    expect(screen.getByText(exampleResponse.description)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByTestId('save-draft-btn')).toBeInTheDocument();
    expect(screen.getByTestId('close-btn')).toBeInTheDocument();
  });

  it('shows error if API fails', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });
    render(<AiChallengeGenerator />);
    fireEvent.click(screen.getByTestId('generate-btn'));
    expect(await screen.findByTestId('modal-bg')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeInTheDocument());
    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    let resolve;
    axios.post.mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    render(<AiChallengeGenerator />);
    const btn = screen.getByTestId('generate-btn');
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    resolve({ data: exampleResponse });
  });
});
