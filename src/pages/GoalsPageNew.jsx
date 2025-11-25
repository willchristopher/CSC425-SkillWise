import React, { useState } from 'react';

const GoalsPage = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Master React Hooks",
      description: "Learn and practice all React hooks including useState, useEffect, useContext, and custom hooks.",
      targetDate: "2024-02-15",
      progress: 65,
      difficulty: "Medium",
      category: "Frontend",
      points: 150,
      completed: false
    },
    {
      id: 2,
      title: "Algorithm Fundamentals",
      description: "Understand and implement basic algorithms: sorting, searching, and graph traversal.",
      targetDate: "2024-03-01",
      progress: 30,
      difficulty: "Hard",
      category: "Algorithms",
      points: 200,
      completed: false
    },
    {
      id: 3,
      title: "JavaScript ES6+ Features",
      description: "Master modern JavaScript features including arrow functions, destructuring, and async/await.",
      targetDate: "2024-01-30",
      progress: 100,
      difficulty: "Easy",
      category: "JavaScript",
      points: 100,
      completed: true
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    difficulty: 'Medium',
    category: 'Programming'
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return { bg: '#dcfce7', color: '#166534' };
      case 'medium': return { bg: '#fef3c7', color: '#d97706' };
      case 'hard': return { bg: '#fecaca', color: '#dc2626' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Frontend': { bg: '#dbeafe', color: '#1d4ed8' },
      'Backend': { bg: '#dcfce7', color: '#166534' },
      'Algorithms': { bg: '#e9d5ff', color: '#7c3aed' },
      'JavaScript': { bg: '#fef3c7', color: '#d97706' },
      'Programming': { bg: '#f3e8ff', color: '#8b5cf6' }
    };
    return colors[category] || { bg: '#f3f4f6', color: '#374151' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim() || !newGoal.description.trim() || !newGoal.targetDate) {
      alert('Please fill in all fields!');
      return;
    }

    const goal = {
      id: Date.now(),
      ...newGoal,
      progress: 0,
      points: newGoal.difficulty === 'Easy' ? 100 : newGoal.difficulty === 'Medium' ? 150 : 200,
      completed: false
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetDate: '',
      difficulty: 'Medium',
      category: 'Programming'
    });
    setShowAddGoal(false);
  };

  const updateProgress = (goalId, newProgress) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress: newProgress, completed: newProgress >= 100 }
        : goal
    ));
  };

  const completedGoals = goals.filter(goal => goal.completed);
  const activeGoals = goals.filter(goal => !goal.completed);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            🎯 Learning Goals
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            Set and track your programming learning objectives
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              {goals.length}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Total Goals</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              {completedGoals.length}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Completed</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
              {activeGoals.length}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>In Progress</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💎</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
              {goals.reduce((sum, goal) => sum + (goal.completed ? goal.points : 0), 0)}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Points Earned</p>
          </div>
        </div>

        {/* Add Goal Button */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ➕ Add New Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #3b82f6'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              🎯 Create New Goal
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Master Python Basics"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe what you want to learn and achieve..."
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Difficulty
                  </label>
                  <select
                    value={newGoal.difficulty}
                    onChange={(e) => setNewGoal({...newGoal, difficulty: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Programming">Programming</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Algorithms">Algorithms</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={handleAddGoal}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Create Goal
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              🚀 Active Goals
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {activeGoals.map(goal => (
                <div key={goal.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '1rem'
                  }}>
                    {goal.title}
                  </h3>

                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      backgroundColor: getDifficultyColor(goal.difficulty).bg,
                      color: getDifficultyColor(goal.difficulty).color,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {goal.difficulty}
                    </span>
                    <span style={{
                      backgroundColor: getCategoryColor(goal.category).bg,
                      color: getCategoryColor(goal.category).color,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {goal.category}
                    </span>
                  </div>

                  <p style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem',
                    lineHeight: '1.6'
                  }}>
                    {goal.description}
                  </p>

                  <div style={{
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Progress</span>
                      <span style={{ color: '#6b7280' }}>{goal.progress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${goal.progress}%`,
                        height: '100%',
                        backgroundColor: goal.progress >= 75 ? '#10b981' : goal.progress >= 50 ? '#3b82f6' : '#f59e0b',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}>
                      📅 {formatDate(goal.targetDate)}
                    </span>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      💎 {goal.points} points
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      +10% Progress
                    </button>
                    {goal.progress >= 90 && (
                      <button
                        onClick={() => updateProgress(goal.id, 100)}
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              ✅ Completed Goals
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {completedGoals.map(goal => (
                <div key={goal.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #10b981',
                  opacity: 0.9
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: 0,
                      flex: 1
                    }}>
                      {goal.title}
                    </h3>
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      ✓ COMPLETED
                    </span>
                  </div>

                  <p style={{
                    color: '#6b7280',
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {goal.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        backgroundColor: getDifficultyColor(goal.difficulty).bg,
                        color: getDifficultyColor(goal.difficulty).color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {goal.difficulty}
                      </span>
                      <span style={{
                        backgroundColor: getCategoryColor(goal.category).bg,
                        color: getCategoryColor(goal.category).color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {goal.category}
                      </span>
                    </div>

                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      💎 +{goal.points} points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '4rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              No Goals Yet
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Start your learning journey by setting your first goal!
            </p>
            <button
              onClick={() => setShowAddGoal(true)}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;