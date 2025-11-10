import React from 'react';
import { render, screen } from '@testing-library/react';
import ChallengeCard from '../components/challenges/ChallengeCard';

describe('ChallengeCard', () => {
  it('renders title, description, and status', () => {
    render(<ChallengeCard title="Test Challenge" description="Test Desc" status="active" />);
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('Test Desc')).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });
});
