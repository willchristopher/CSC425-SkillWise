import React, { useState } from 'react';

const ChallengesPage = () => {
  const [challenges] = useState([
    {
      id: 1,
      title: "Two Sum Problem",
      difficulty: "Easy",
      category: "Arrays",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      points: 10,
      solved: true
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      category: "Trees",
      description: "Implement three different tree traversal methods: inorder, preorder, and postorder.",
      points: 25,
      solved: false
    },
    {
      id: 3,
      title: "Dynamic Programming - Fibonacci",
      difficulty: "Medium",
      category: "DP",
      description: "Solve the Fibonacci sequence using dynamic programming for optimal time complexity.",
      points: 20,
      solved: false
    },
    {
      id: 4,
      title: "Graph BFS Implementation",
      difficulty: "Hard",
      category: "Graphs",
      description: "Implement breadth-first search for an undirected graph representation.",
      points: 40,
      solved: false
    }
  ]);

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState(null);
  const [generating, setGenerating] = useState(false);

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
      'Arrays': { bg: '#dbeafe', color: '#1d4ed8' },
      'Trees': { bg: '#dcfce7', color: '#166534' },
      'DP': { bg: '#e9d5ff', color: '#7c3aed' },
      'Graphs': { bg: '#fed7d7', color: '#c53030' }
    };
    return colors[category] || { bg: '#f3f4f6', color: '#374151' };
  };

  const handleGenerateChallenge = async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe what kind of challenge you want!');
      return;
    }

    setGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const categories = ['Arrays', 'Trees', 'DP', 'Graphs', 'Strings'];
      
      setGeneratedChallenge({
        id: Date.now(),
        title: `AI Generated: ${aiPrompt.split(' ').slice(0, 3).join(' ')} Challenge`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Here's a custom challenge based on your request: "${aiPrompt}". This problem will test your understanding of the concepts you mentioned and help you practice relevant algorithms and data structures.`,
        points: Math.floor(Math.random() * 30) + 15,
        solved: false,
        isAIGenerated: true
      });
      setGenerating(false);
    }, 2000);
  };

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
            🚀 Coding Challenges
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            Solve problems, earn points, and improve your skills
          </p>
        </div>

        {/* AI Challenge Generator Button */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#8b5cf6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🤖 Generate AI Challenge
          </button>
        </div>

        {/* AI Challenge Generator */}
        {showAIGenerator && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #8b5cf6'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>🎯</span>
              AI Challenge Generator
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the type of challenge you want...

Examples:
- 'Create a challenge about sorting algorithms'
- 'I want to practice binary search'
- 'Generate a problem about graph traversal'
- 'Make a challenge for dynamic programming beginners'"
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <button
              onClick={handleGenerateChallenge}
              disabled={generating}
              style={{
                padding: '1rem 2rem',
                backgroundColor: generating ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {generating ? '🔄 Generating...' : '✨ Generate Challenge'}
            </button>

            {generatedChallenge && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                border: '2px solid #10b981'
              }}>
                <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>
                  ✅ Challenge Generated Successfully!
                </h3>
                <p style={{ color: '#047857' }}>
                  Your custom challenge has been created and added to the list below.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Challenges Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Show generated challenge first if it exists */}
          {generatedChallenge && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '2px solid #8b5cf6',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                🤖 AI GENERATED
              </div>
              
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem',
                marginRight: '8rem'
              }}>
                {generatedChallenge.title}
              </h2>
              
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{
                  ...getDifficultyColor(generatedChallenge.difficulty),
                  backgroundColor: getDifficultyColor(generatedChallenge.difficulty).bg,
                  color: getDifficultyColor(generatedChallenge.difficulty).color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {generatedChallenge.difficulty}
                </span>
                <span style={{
                  ...getCategoryColor(generatedChallenge.category),
                  backgroundColor: getCategoryColor(generatedChallenge.category).bg,
                  color: getCategoryColor(generatedChallenge.category).color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {generatedChallenge.category}
                </span>
              </div>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                {generatedChallenge.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  {generatedChallenge.points} points
                </span>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Start Challenge
                </button>
              </div>
            </div>
          )}

          {/* Regular challenges */}
          {challenges.map(challenge => (
            <div key={challenge.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              opacity: challenge.solved ? 0.8 : 1
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h2 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  flex: 1
                }}>
                  {challenge.title}
                </h2>
                {challenge.solved && (
                  <span style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginLeft: '1rem'
                  }}>
                    ✓ SOLVED
                  </span>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{
                  backgroundColor: getDifficultyColor(challenge.difficulty).bg,
                  color: getDifficultyColor(challenge.difficulty).color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {challenge.difficulty}
                </span>
                <span style={{
                  backgroundColor: getCategoryColor(challenge.category).bg,
                  color: getCategoryColor(challenge.category).color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {challenge.category}
                </span>
              </div>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                {challenge.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  backgroundColor: challenge.solved ? '#f3f4f6' : '#dcfce7',
                  color: challenge.solved ? '#6b7280' : '#166534',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  {challenge.points} points
                </span>
                <button style={{
                  backgroundColor: challenge.solved ? '#6b7280' : '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: challenge.solved ? 'default' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!challenge.solved) e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  if (!challenge.solved) e.target.style.backgroundColor = '#3b82f6';
                }}
                >
                  {challenge.solved ? 'Completed' : 'Start Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;