import React, { useState } from 'react';

const AITutorPage = () => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      alert('Please enter some code to get feedback!');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFeedback(`Great code! Here's some feedback on your implementation:

📝 **Code Analysis:**
• Your code structure looks clean and readable
• Good variable naming conventions
• Consider adding error handling for edge cases

💡 **Suggestions:**
• You could optimize this by using a more efficient algorithm
• Consider adding comments to explain complex logic
• Think about input validation

🚀 **Next Steps:**
• Try implementing this with a different approach
• Test with various input sizes
• Consider time and space complexity`);
      setLoading(false);
    }, 2000);
  };

  const handleGetHint = () => {
    const hints = [
      "Try breaking this problem down into smaller steps",
      "Consider what data structure would be most efficient here",
      "Think about the edge cases your solution needs to handle",
      "What's the time complexity of your current approach?",
      "Can you solve this with a different algorithmic approach?"
    ];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    setFeedback(`💡 **Hint:** ${randomHint}\n\nTry applying this hint to your code and see if it helps!`);
  };

  const handleClearAll = () => {
    setCode('');
    setFeedback('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 50%, #e0e7ff 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            🤖 AI Coding Assistant
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#6b7280'
          }}>
            Get instant feedback, hints, and guidance powered by AI
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {[
              { id: 'feedback', label: 'Get Feedback', icon: '📝' },
              { id: 'hints', label: 'Get Hints', icon: '💡' },
              { id: 'learn', label: 'Learn More', icon: '📚' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Code Input */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>👨‍💻</span>
              Your Code
            </h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here...

Example:
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}"
              style={{
                width: '100%',
                height: '300px',
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'Monaco, Consolas, monospace',
                resize: 'vertical',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={handleSubmitCode}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                {loading ? '🔄 Analyzing...' : '📝 Get Feedback'}
              </button>
              
              <button
                onClick={handleGetHint}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
              >
                💡 Get Hint
              </button>
              
              <button
                onClick={handleClearAll}
                style={{
                  padding: '1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Feedback Output */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>🤖</span>
              AI Feedback
            </h2>
            
            {feedback ? (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
                minHeight: '300px',
                whiteSpace: 'pre-line',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                {feedback}
              </div>
            ) : (
              <div style={{
                backgroundColor: '#f9fafb',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '3rem',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  No feedback yet
                </h3>
                <p>Submit your code or ask for a hint to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            🎯 How to Use the AI Tutor
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '📝',
                title: 'Get Detailed Feedback',
                description: 'Submit your code to receive comprehensive analysis, including strengths, improvements, and best practices.',
                color: '#3b82f6'
              },
              {
                icon: '💡',
                title: 'Request Smart Hints',
                description: 'Stuck on a problem? Get helpful hints that guide you toward the solution without spoiling it.',
                color: '#f59e0b'
              },
              {
                icon: '🚀',
                title: 'Learn & Improve',
                description: 'Use AI suggestions to understand algorithms, optimize performance, and write cleaner code.',
                color: '#10b981'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '2rem',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: feature.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;