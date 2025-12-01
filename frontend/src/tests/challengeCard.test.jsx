import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChallengeCard from '../components/challenges/ChallengeCard';

describe('ChallengeCard', () => {
  const mockChallenge = {
    id: 1,
    title: 'Test Challenge',
    description: 'Test Desc',
    difficulty_level: 'medium',
    category: 'programming',
    estimated_time_minutes: 30,
    points_reward: 100,
    tags: ['javascript', 'react'],
  };

  it('renders title, description, and difficulty', () => {
    render(<ChallengeCard challenge={mockChallenge} />);
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('Test Desc')).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('renders category and estimated time', () => {
    render(<ChallengeCard challenge={mockChallenge} />);
    expect(screen.getByText(/programming/i)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it('renders points reward', () => {
    render(<ChallengeCard challenge={mockChallenge} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
