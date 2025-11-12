// TODO: Implement goals management page
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GoalCard from '../components/goals/GoalCard';
import './GoalsPage.css';

const GoalsPage = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Master Frontend Development',
      description: 'Learn React, Vue, and modern CSS frameworks',
      category: 'Programming',
      targetDate: '2025-12-31',
      progress: 65,
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Complete JavaScript Course',
      description: 'Deep dive into ES6+ features and async programming',
      category: 'Programming',
      targetDate: '2025-11-30',
      progress: 80,
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Learn UI/UX Design',
      description: 'Master design principles and tools like Figma',
      category: 'Design',
      targetDate: '2026-01-15',
      progress: 30,
      status: 'in-progress'
    }
  ]);
  const [filter, setFilter] = useState('all');
  
  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(goal => goal.category.toLowerCase() === filter.toLowerCase());
  
  return (
    <div className="goals-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-button">
          ← Back to Dashboard
        </Link>
        <h1>My Learning Goals</h1>
        <p>Set goals, track progress, and achieve your learning objectives</p>
      </div>

      <div className="goals-controls">
        <div className="goals-filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
          </select>
        </div>
        <button className="btn-primary">+ Create New Goal</button>
      </div>

      <div className="goals-grid">
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No goals yet</h3>
            <p>Create your first learning goal to get started on your journey!</p>
            <button className="btn-primary">Create Goal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;