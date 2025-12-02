import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import '../styles/pages.css';

// SVG Icons
const DocumentIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const UploadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LightbulbIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PeerReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [receivedFeedback, setReceivedFeedback] = useState({
    reviews: [],
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('review-others');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Review modal state
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    feedback: '',
    strengths: '',
    improvements: '',
  });

  // Submit work modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'General',
    difficulty: 'Intermediate',
  });

  // Edit submission modal state
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'General',
    difficulty: 'Intermediate',
  });

  // Delete confirmation state
  const [deletingSubmission, setDeletingSubmission] = useState(null);

  // Feedback detail modal state
  const [viewingFeedback, setViewingFeedback] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [queueRes, submissionsRes, feedbackRes] = await Promise.all([
        apiService.peerReview.getReviewQueue(),
        apiService.peerReview.getMySubmissions(),
        apiService.peerReview.getReceivedFeedback(),
      ]).catch((err) => {
        console.error('Error fetching peer review data:', err);
        return [null, null, null];
      });

      if (queueRes?.data?.success) {
        const queue = queueRes.data.data || [];
        const formattedQueue = queue.map((item) => ({
          id: item.id,
          submissionId: item.id,
          title: item.challenge_title || 'Untitled Submission',
          author:
            item.user_name ||
            `${item.submitter_first_name || ''} ${
              item.submitter_last_name || ''
            }`.trim() ||
            'Anonymous',
          authorInitials: getInitials(
            item.user_name ||
              `${item.submitter_first_name || ''} ${
                item.submitter_last_name || ''
              }`
          ),
          category: item.category || item.challenge_category || 'General',
          difficulty: item.difficulty_level || 'Intermediate',
          submittedAt: item.created_at || item.submitted_at,
          description:
            item.notes ||
            item.challenge_description ||
            'No description provided',
          workSnippet:
            item.submission_text?.substring(0, 200) ||
            'View full submission...',
          fullContent: item.submission_text,
          needsReview: true,
          reviewsCount:
            parseInt(item.review_count) ||
            parseInt(item.completed_reviews) ||
            0,
          maxReviews: 3,
        }));
        setReviews(formattedQueue);
      }

      if (submissionsRes?.data?.success) {
        const submissions = submissionsRes.data.data || [];
        const formattedSubmissions = submissions.map((sub) => ({
          id: sub.id,
          submissionId: sub.id,
          title: sub.challenge_title || sub.title || 'Untitled',
          description: sub.description || '',
          content: sub.content || '',
          category: sub.category || sub.challenge_category || 'General',
          difficulty: sub.difficulty_level || sub.difficulty || 'Intermediate',
          submittedAt: sub.created_at || sub.submitted_at,
          status: (sub.reviewCount || 0) >= 3 ? 'completed' : 'under-review',
          reviewsReceived: sub.reviewCount || 0,
          maxReviews: 3,
          averageRating: sub.averageRating || null,
          feedback: sub.latest_feedback || null,
          reviews: sub.reviews || [],
        }));
        setMySubmissions(formattedSubmissions);
      }

      if (feedbackRes?.data?.success) {
        setReceivedFeedback(
          feedbackRes.data.data || { reviews: [], unreadCount: 0 }
        );
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load peer review data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }
    return (name[0] || '?').toUpperCase();
  };

  const handleStartReview = (submission) => {
    setReviewingSubmission(submission);
    setReviewForm({ rating: 5, feedback: '', strengths: '', improvements: '' });
  };

  const handleCancelReview = () => {
    setReviewingSubmission(null);
    setReviewForm({ rating: 5, feedback: '', strengths: '', improvements: '' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.feedback.trim()) {
      alert('Please provide feedback before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiService.peerReview.submitReview(
        reviewingSubmission.submissionId,
        {
          submissionId: reviewingSubmission.submissionId,
          rating: reviewForm.rating,
          feedback: reviewForm.feedback,
          strengths: reviewForm.strengths,
          improvements: reviewForm.improvements,
        }
      );
      if (response.data.success) {
        alert(
          'Review submitted successfully! You earned 5 points for helping a peer.'
        );
        setReviews((prev) =>
          prev.filter((r) => r.id !== reviewingSubmission.id)
        );
        setReviewingSubmission(null);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(
        err.response?.data?.error ||
          'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submitForm.title.trim() || !submitForm.content.trim()) {
      alert('Please provide a title and your work content.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiService.peerReview.submitWorkForReview({
        title: submitForm.title,
        description: submitForm.description,
        content: submitForm.content,
        category: submitForm.category,
        difficulty: submitForm.difficulty,
      });
      if (response.data.success) {
        alert('Work submitted successfully! Other users can now review it.');
        setShowSubmitModal(false);
        setSubmitForm({
          title: '',
          description: '',
          content: '',
          category: 'General',
          difficulty: 'Intermediate',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error submitting work:', err);
      alert(
        err.response?.data?.error || 'Failed to submit work. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFeedback = async (submission) => {
    setViewingFeedback(submission);
    if (submission.reviews?.length > 0) {
      for (const review of submission.reviews) {
        if (!review.read_by_reviewee) {
          try {
            await apiService.peerReview.markFeedbackRead(review.id);
          } catch (err) {
            console.error('Error marking feedback as read:', err);
          }
        }
      }
      setReceivedFeedback((prev) => ({
        ...prev,
        unreadCount: Math.max(
          0,
          prev.unreadCount -
            submission.reviews.filter((r) => !r.read_by_reviewee).length
        ),
      }));
    }
  };

  // Handle editing a submission
  const handleEditSubmission = (submission) => {
    setEditingSubmission(submission);
    setEditForm({
      title: submission.title || '',
      description: submission.description || '',
      content: submission.content || '',
      category: submission.category || 'General',
      difficulty: submission.difficulty || 'Intermediate',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      alert('Please provide a title.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiService.peerReview.updateSubmission(
        editingSubmission.submissionId,
        {
          title: editForm.title,
          description: editForm.description,
          content: editForm.content,
          category: editForm.category,
          difficulty: editForm.difficulty,
        }
      );
      if (response.data.success) {
        alert('Submission updated successfully!');
        setEditingSubmission(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      alert(
        err.response?.data?.error ||
          'Failed to update submission. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a submission
  const handleDeleteSubmission = async () => {
    if (!deletingSubmission) return;
    setSubmitting(true);
    try {
      const response = await apiService.peerReview.deleteSubmission(
        deletingSubmission.submissionId
      );
      if (response.data.success) {
        alert('Submission deleted successfully!');
        setDeletingSubmission(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert(
        err.response?.data?.error ||
          'Failed to delete submission. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(
    (review) =>
      selectedCategory === 'all' ||
      review.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const getStatusBadge = (status) => {
    const statusClass = {
      'under-review': 'under-review',
      completed: 'completed',
      'needs-revision': 'needs-revision',
    };
    const statusText = {
      'under-review': 'Under Review',
      completed: 'Completed',
      'needs-revision': 'Needs Revision',
    };
    return (
      <span className={`status-badge ${statusClass[status] || ''}`}>
        {statusText[status] || status}
      </span>
    );
  };

  const getDifficultyClass = (difficulty) => {
    const classes = {
      Beginner: 'beginner',
      Intermediate: 'intermediate',
      Advanced: 'advanced',
    };
    return classes[difficulty] || '';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderStars = (rating) => (
    <span style={{ color: '#fbbf24' }}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  );

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  };
  const modalContentStyle = {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border-primary)',
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    fontSize: '1rem',
  };
  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
  };
  const cancelBtnStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: 500,
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-primary)',
  };

  return (
    <AppLayout
      title="Peer Review"
      subtitle="Collaborate with fellow learners and improve together"
    >
      {/* Review Modal */}
      {reviewingSubmission && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <button
              onClick={handleCancelReview}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
            >
              <CloseIcon />
            </button>
            <h2 style={{ marginBottom: '1rem' }}>
              Review: {reviewingSubmission.title}
            </h2>
            <p
              style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}
            >
              By {reviewingSubmission.author} • {reviewingSubmission.category}
            </p>
            <div
              style={{
                backgroundColor: 'var(--color-input-bg)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                maxHeight: '200px',
                overflow: 'auto',
              }}
            >
              <h4 style={{ marginBottom: '0.5rem' }}>Submission:</h4>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              >
                {reviewingSubmission.fullContent ||
                  reviewingSubmission.workSnippet}
              </pre>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Rating (1-5 stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color:
                          star <= reviewForm.rating ? '#fbbf24' : '#6b7280',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  What did they do well? (Strengths)
                </label>
                <textarea
                  value={reviewForm.strengths}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, strengths: e.target.value })
                  }
                  placeholder="Describe what the submitter did well..."
                  style={textareaStyle}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Areas for Improvement
                </label>
                <textarea
                  value={reviewForm.improvements}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      improvements: e.target.value,
                    })
                  }
                  placeholder="Suggest areas where they could improve..."
                  style={textareaStyle}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Overall Feedback *
                </label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, feedback: e.target.value })
                  }
                  placeholder="Provide your overall feedback and suggestions..."
                  required
                  style={{ ...textareaStyle, minHeight: '120px' }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={handleCancelReview}
                  style={cancelBtnStyle}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Work Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <button
              onClick={() => setShowSubmitModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
            >
              <CloseIcon />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Submit Work for Review</h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                marginBottom: '1.5rem',
              }}
            >
              Share your work, homework, or code for feedback from peers
            </p>
            <form onSubmit={handleSubmitWork}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={submitForm.title}
                  onChange={(e) =>
                    setSubmitForm({ ...submitForm, title: e.target.value })
                  }
                  placeholder="E.g., Python Function for Sorting, Essay on Climate Change..."
                  required
                  style={inputStyle}
                />
              </div>
              <div
                style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={submitForm.category}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, category: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option value="General">General</option>
                    <option value="Programming">Programming</option>
                    <option value="Writing">Writing</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="Language">Language</option>
                    <option value="Business">Business</option>
                    <option value="Creative Arts">Creative Arts</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                    }}
                  >
                    Difficulty
                  </label>
                  <select
                    value={submitForm.difficulty}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        difficulty: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Description (optional)
                </label>
                <textarea
                  value={submitForm.description}
                  onChange={(e) =>
                    setSubmitForm({
                      ...submitForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Provide context about what you're working on or what kind of feedback you're looking for..."
                  style={textareaStyle}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Your Work *
                </label>
                <textarea
                  value={submitForm.content}
                  onChange={(e) =>
                    setSubmitForm({ ...submitForm, content: e.target.value })
                  }
                  placeholder="Paste your code, essay, solution, or any work you'd like reviewed..."
                  required
                  style={{
                    ...textareaStyle,
                    minHeight: '200px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={cancelBtnStyle}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <button
              onClick={() => setViewingFeedback(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
            >
              <CloseIcon />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>
              Feedback for: {viewingFeedback.title}
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                marginBottom: '1.5rem',
              }}
            >
              {viewingFeedback.reviewsReceived} review(s) received • Average
              rating: {viewingFeedback.averageRating?.toFixed(1) || 'N/A'}
            </p>
            {viewingFeedback.reviews?.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {viewingFeedback.reviews.map((review, idx) => (
                  <div
                    key={review.id || idx}
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: !review.read_by_reviewee
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>
                        {review.is_anonymous
                          ? 'Anonymous Reviewer'
                          : `${review.reviewer_first_name || ''} ${
                              review.reviewer_last_name || ''
                            }`.trim() || 'Reviewer'}
                      </span>
                      <span>{renderStars(review.rating || 0)}</span>
                    </div>
                    <p
                      style={{ whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}
                    >
                      {review.review_text}
                    </p>
                    <small style={{ color: 'var(--color-text-muted)' }}>
                      {formatTimeAgo(review.completed_at)}
                      {!review.read_by_reviewee && (
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            color: 'var(--color-primary)',
                          }}
                        >
                          • New
                        </span>
                      )}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '2rem',
                }}
              >
                No feedback received yet. Check back later!
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
              }}
            >
              <button
                onClick={() => setViewingFeedback(null)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <button
              onClick={() => setEditingSubmission(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
            >
              <CloseIcon />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Edit Submission</h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                marginBottom: '1.5rem',
              }}
            >
              Update your submission details
            </p>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="E.g., Python Function for Sorting..."
                  required
                  style={inputStyle}
                />
              </div>
              <div
                style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option value="General">General</option>
                    <option value="Programming">Programming</option>
                    <option value="Writing">Writing</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="Language">Language</option>
                    <option value="Business">Business</option>
                    <option value="Creative Arts">Creative Arts</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                    }}
                  >
                    Difficulty
                  </label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) =>
                      setEditForm({ ...editForm, difficulty: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Description (optional)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Provide context about what you're working on..."
                  style={textareaStyle}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  Your Work
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  placeholder="Your code, essay, or work..."
                  style={{
                    ...textareaStyle,
                    minHeight: '200px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
                  style={cancelBtnStyle}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubmission && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div
            className="modal-content"
            style={{
              ...modalContentStyle,
              maxWidth: '450px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Delete Submission?</h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                marginBottom: '1.5rem',
              }}
            >
              Are you sure you want to delete "
              <strong>{deletingSubmission.title}</strong>"? This will also
              delete all associated reviews and feedback. This action cannot be
              undone.
            </p>
            <div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
            >
              <button
                onClick={() => setDeletingSubmission(null)}
                style={cancelBtnStyle}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmission}
                className="btn"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                }}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Notification Banner */}
      {receivedFeedback.unreadCount > 0 && (
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <BellIcon />
          <span>
            You have <strong>{receivedFeedback.unreadCount}</strong> new
            feedback on your submissions!
          </span>
          <button
            onClick={() => setActiveTab('my-submissions')}
            style={{
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            View Feedback
          </button>
        </div>
      )}

      <div className="review-tabs">
        <button
          className={`review-tab ${
            activeTab === 'review-others' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('review-others')}
        >
          Review Others ({reviews.filter((r) => r.needsReview).length})
        </button>
        <button
          className={`review-tab ${
            activeTab === 'my-submissions' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('my-submissions')}
        >
          My Submissions ({mySubmissions.length})
          {receivedFeedback.unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-error)',
                color: 'white',
                borderRadius: '50%',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                marginLeft: '0.5rem',
              }}
            >
              {receivedFeedback.unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'review-others' && (
        <div>
          <div className="section-header">
            <h2 className="profile-section-title">Help Others Improve</h2>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="writing">Writing</option>
              <option value="math">Math</option>
              <option value="science">Science</option>
              <option value="language">Language</option>
              <option value="business">Business</option>
              <option value="creative arts">Creative Arts</option>
              <option value="general">General</option>
            </select>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading submissions for review..." />
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchData} className="btn btn-primary">
                Retry
              </button>
            </div>
          ) : (
            <div className="review-grid">
              {filteredReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="author-info">
                      <div className="avatar">{review.authorInitials}</div>
                      <div>
                        <h4 className="podium-name">{review.title}</h4>
                        <p className="podium-points">by {review.author}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span
                        className={`difficulty-badge ${getDifficultyClass(
                          review.difficulty
                        )}`}
                      >
                        {review.difficulty}
                      </span>
                      <span className="level-badge">{review.category}</span>
                    </div>
                  </div>
                  <div className="review-card-content">
                    <p>{review.description}</p>
                    <div className="code-preview">
                      <code>{review.workSnippet}</code>
                    </div>
                  </div>
                  <div className="review-card-footer">
                    <div className="review-meta">
                      <span>{formatTimeAgo(review.submittedAt)}</span>
                      <span>
                        {review.reviewsCount}/{review.maxReviews} reviews
                      </span>
                    </div>
                    {review.needsReview &&
                    review.reviewsCount < review.maxReviews ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStartReview(review)}
                      >
                        Start Review
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        Review Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredReviews.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <DocumentIcon />
                  </div>
                  <h3>No submissions available</h3>
                  <p>
                    Check back later for new submissions to review, or submit
                    your own work!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-submissions' && (
        <div>
          <div className="section-header">
            <h2 className="profile-section-title">Your Submissions</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowSubmitModal(true)}
            >
              <UploadIcon /> Submit New Work
            </button>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading your submissions..." />
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {mySubmissions.map((submission) => (
                <div key={submission.id} className="review-card">
                  <div className="review-card-header">
                    <div>
                      <h4
                        className="podium-name"
                        style={{ marginBottom: '0.5rem' }}
                      >
                        {submission.title}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="level-badge">
                          {submission.category}
                        </span>
                        <span
                          className={`difficulty-badge ${getDifficultyClass(
                            submission.difficulty
                          )}`}
                        >
                          {submission.difficulty}
                        </span>
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditSubmission(submission)}
                        title="Edit submission"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => setDeletingSubmission(submission)}
                        title="Delete submission"
                        style={{
                          backgroundColor: 'var(--color-error)',
                          color: 'white',
                        }}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleViewFeedback(submission)}
                      >
                        View Feedback
                        {submission.reviews?.some(
                          (r) => !r.read_by_reviewee
                        ) && (
                          <span
                            style={{
                              backgroundColor: 'var(--color-error)',
                              color: 'white',
                              borderRadius: '50%',
                              padding: '0.15rem 0.4rem',
                              fontSize: '0.7rem',
                              marginLeft: '0.5rem',
                            }}
                          >
                            New
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="submission-stats">
                    <div>
                      <div className="stat-value">
                        {submission.reviewsReceived}
                      </div>
                      <div className="stat-label">Reviews Received</div>
                    </div>
                    <div>
                      <div className="stat-value">
                        {submission.averageRating?.toFixed(1) || '—'}
                      </div>
                      <div className="stat-label">Average Rating</div>
                    </div>
                    <div>
                      <div className="stat-value">
                        {formatTimeAgo(submission.submittedAt)}
                      </div>
                      <div className="stat-label">Submitted</div>
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="feedback-section">
                      <h5 className="feedback-title">Latest Feedback:</h5>
                      <p className="feedback-text">
                        "{submission.feedback.substring(0, 150)}
                        {submission.feedback.length > 150 ? '...' : ''}"
                      </p>
                    </div>
                  )}
                  <div className="feedback-section">
                    <div className="feedback-title">
                      Review Progress: {submission.reviewsReceived}/
                      {submission.maxReviews}
                    </div>
                    <div
                      className="progress-track"
                      style={{
                        height: '8px',
                        backgroundColor: 'var(--color-progress-bg)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: 'var(--color-progress-fill)',
                          borderRadius: '4px',
                          width: `${
                            (submission.reviewsReceived /
                              submission.maxReviews) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {mySubmissions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <UploadIcon />
                  </div>
                  <h3>No submissions yet</h3>
                  <p style={{ marginBottom: '1rem' }}>
                    Submit your first piece of work to get feedback from peers!
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    Submit Your Work
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="tips-section">
        <h3 className="tips-title">
          <LightbulbIcon /> Review Tips
        </h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Be Constructive</h4>
            <p>
              Focus on specific improvements and provide actionable feedback
            </p>
          </div>
          <div className="tip-card">
            <h4>Be Respectful</h4>
            <p>
              Remember there's a person behind the work. Be kind and encouraging
            </p>
          </div>
          <div className="tip-card">
            <h4>Be Specific</h4>
            <p>Point out exactly what works well and what could be improved</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PeerReviewPage;
