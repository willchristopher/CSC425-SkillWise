import React, { useState } from 'react';

const PeerReviewPage = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [selectedReview, setSelectedReview] = useState(null);
  const [newFeedback, setNewFeedback] = useState('');

  const reviewsToGive = [
    {
      id: 1,
      author: 'Sarah Kim',
      avatar: '👩‍💻',
      challenge: 'Binary Tree Traversal',
      difficulty: 'Medium',
      language: 'Python',
      submittedAt: '2 hours ago',
      code: `def inorder_traversal(root):
    if not root:
        return []
    
    result = []
    stack = []
    current = root
    
    while stack or current:
        while current:
            stack.append(current)
            current = current.left
        
        current = stack.pop()
        result.append(current.val)
        current = current.right
    
    return result`,
      description: 'Iterative implementation of binary tree inorder traversal. Looking for feedback on efficiency and code clarity.'
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar: '🧑‍💻',
      challenge: 'Two Sum Problem',
      difficulty: 'Easy',
      language: 'JavaScript',
      submittedAt: '4 hours ago',
      code: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
      description: 'Hash map approach to solve two sum. First time using Map in JavaScript, would appreciate any suggestions!'
    }
  ];

  const mySubmissions = [
    {
      id: 1,
      challenge: 'Merge Sort Implementation',
      difficulty: 'Medium',
      language: 'Java',
      submittedAt: '1 day ago',
      reviewsReceived: 3,
      avgRating: 4.3,
      status: 'reviewed',
      feedbacks: [
        {
          reviewer: 'Alex Chen',
          avatar: '👨‍💻',
          rating: 5,
          comment: 'Excellent implementation! Clean recursive approach and good variable naming. The time complexity is optimal.',
          helpful: 8,
          timestamp: '18 hours ago'
        },
        {
          reviewer: 'Emma Wilson', 
          avatar: '👩‍💻',
          rating: 4,
          comment: 'Good solution overall. Consider adding comments to explain the merge logic for better readability.',
          helpful: 5,
          timestamp: '12 hours ago'
        },
        {
          reviewer: 'David Lee',
          avatar: '👨‍💻',
          rating: 4,
          comment: 'Nice work! You might want to add input validation for edge cases like null arrays.',
          helpful: 3,
          timestamp: '8 hours ago'
        }
      ]
    },
    {
      id: 2,
      challenge: 'Dynamic Programming - Fibonacci',
      difficulty: 'Easy',
      language: 'Python',
      submittedAt: '3 days ago',
      reviewsReceived: 2,
      avgRating: 3.5,
      status: 'reviewed',
      feedbacks: [
        {
          reviewer: 'Lisa Zhang',
          avatar: '👩‍💻',
          rating: 4,
          comment: 'Good use of memoization! The iterative approach would be even more efficient.',
          helpful: 6,
          timestamp: '2 days ago'
        },
        {
          reviewer: 'Chris Taylor',
          avatar: '👨‍💻',
          rating: 3,
          comment: 'Works correctly but could benefit from better variable names and documentation.',
          helpful: 2,
          timestamp: '2 days ago'
        }
      ]
    }
  ];

  const myReviews = [
    {
      id: 1,
      author: 'Anna Davis',
      challenge: 'Quick Sort Algorithm',
      rating: 5,
      comment: 'Outstanding implementation with excellent pivot selection strategy. Code is very readable and well-documented.',
      submittedAt: '1 day ago',
      helpful: 12
    },
    {
      id: 2,
      author: 'James Brown',
      challenge: 'Linked List Reversal',
      rating: 4,
      comment: 'Good iterative approach. Consider adding the recursive solution as well for comparison.',
      submittedAt: '3 days ago',
      helpful: 7
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const StarRating = ({ rating, size = '1.25rem' }) => {
    return (
      <div style={{ display: 'flex', gap: '0.125rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              fontSize: size,
              color: star <= rating ? '#fbbf24' : '#e5e7eb'
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const submitReview = (submissionId, rating, feedback) => {
    console.log('Review submitted:', { submissionId, rating, feedback });
    setNewFeedback('');
    setSelectedReview(null);
    // In real app, would make API call here
  };

  const renderReviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          🔍 Code Reviews Available
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Help fellow learners by reviewing their code submissions
        </p>
      </div>

      {reviewsToGive.map(review => (
        <div
          key={review.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: selectedReview === review.id ? '2px solid #3b82f6' : '1px solid #e5e7eb'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {review.avatar}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {review.author}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  {review.submittedAt}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{
                backgroundColor: getDifficultyColor(review.difficulty),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {review.difficulty}
              </span>
              <span style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {review.language}
              </span>
            </div>
          </div>

          <h4 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            {review.challenge}
          </h4>

          <p style={{
            color: '#6b7280',
            marginBottom: '1.5rem',
            lineHeight: 1.6
          }}>
            {review.description}
          </p>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <pre style={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: '#1f2937',
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }}>
              {review.code}
            </pre>
          </div>

          {selectedReview === review.id ? (
            <div style={{
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#eff6ff'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Your Rating
                </label>
                <StarRating rating={5} size="2rem" />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Feedback
                </label>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Provide constructive feedback about the code quality, efficiency, readability, or suggest improvements..."
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => submitReview(review.id, 5, newFeedback)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSelectedReview(review.id)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Review This Code
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderMySubmissionsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          📝 My Submissions
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Track the feedback and reviews received on your code submissions
        </p>
      </div>

      {mySubmissions.map(submission => (
        <div
          key={submission.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                {submission.challenge}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: getDifficultyColor(submission.difficulty),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {submission.difficulty}
                </span>
                <span style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}>
                  {submission.language}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Submitted {submission.submittedAt}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <StarRating rating={Math.round(submission.avgRating)} />
                <span style={{
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontSize: '1.1rem'
                }}>
                  {submission.avgRating}
                </span>
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {submission.reviewsReceived} reviews received
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {submission.feedbacks.map((feedback, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {feedback.avatar}
                    </div>
                    <div>
                      <h4 style={{
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {feedback.reviewer}
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {feedback.timestamp}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StarRating rating={feedback.rating} />
                    <span style={{
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      👍 {feedback.helpful} helpful
                    </span>
                  </div>
                </div>

                <p style={{
                  color: '#374151',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {feedback.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMyReviewsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          ✍️ My Reviews
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Reviews you've provided to help other learners improve their code
        </p>
      </div>

      {myReviews.map(review => (
        <div
          key={review.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Review for {review.author}
              </h3>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>
                {review.challenge} • {review.submittedAt}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <StarRating rating={review.rating} />
              <span style={{
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                👍 {review.helpful} found helpful
              </span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <p style={{
              color: '#374151',
              lineHeight: 1.6,
              margin: 0
            }}>
              {review.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            👥 Peer Review
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            Learn from others and help fellow developers improve their code
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'review', label: '🔍 Review Code', count: reviewsToGive.length },
              { id: 'submissions', label: '📝 My Submissions', count: mySubmissions.length },
              { id: 'myreviews', label: '✍️ My Reviews', count: myReviews.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
                  color: activeTab === tab.id ? 'white' : '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {tab.label}
                <span style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#d1d5db',
                  color: activeTab === tab.id ? 'white' : '#374151',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'review' && renderReviewTab()}
        {activeTab === 'submissions' && renderMySubmissionsTab()}
        {activeTab === 'myreviews' && renderMyReviewsTab()}
      </div>
    </div>
  );
};

export default PeerReviewPage;