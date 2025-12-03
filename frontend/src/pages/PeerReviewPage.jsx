import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import '../styles/peerreview.css';

// SVG Icons
const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PeerReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [receivedFeedback, setReceivedFeedback] = useState({ reviews: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('review-others');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: '', strengths: '', improvements: '' });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', description: '', content: '', category: 'General', difficulty: 'Intermediate' });
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', content: '', category: 'General', difficulty: 'Intermediate' });
  const [deletingSubmission, setDeletingSubmission] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : (name[0] || '?').toUpperCase();
  };

  const getAuthorName = (item) => {
    if (item.user_name) return item.user_name;
    const firstName = item.submitter_first_name || '';
    const lastName = item.submitter_last_name || '';
    const fullName = (firstName + ' ' + lastName).trim();
    return fullName || 'Anonymous';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [queueRes, submissionsRes, feedbackRes] = await Promise.all([
        apiService.peerReview.getReviewQueue(),
        apiService.peerReview.getMySubmissions(),
        apiService.peerReview.getReceivedFeedback(),
      ]).catch(() => [null, null, null]);

      if (queueRes?.data?.success) {
        const queue = queueRes.data.data || [];
        setReviews(queue.map((item) => ({
          id: item.id,
          submissionId: item.id,
          title: item.challenge_title || 'Untitled Submission',
          author: getAuthorName(item),
          authorInitials: getInitials(getAuthorName(item)),
          category: item.category || item.challenge_category || 'General',
          difficulty: item.difficulty_level || 'Intermediate',
          submittedAt: item.created_at || item.submitted_at,
          description: item.notes || item.challenge_description || 'No description provided',
          workSnippet: item.submission_text?.substring(0, 200) || 'View full submission...',
          fullContent: item.submission_text,
          needsReview: true,
          reviewsCount: parseInt(item.review_count) || parseInt(item.completed_reviews) || 0,
          maxReviews: 3,
        })));
      }

      if (submissionsRes?.data?.success) {
        const submissions = submissionsRes.data.data || [];
        setMySubmissions(submissions.map((sub) => ({
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
        })));
      }

      if (feedbackRes?.data?.success) {
        setReceivedFeedback(feedbackRes.data.data || { reviews: [], unreadCount: 0 });
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load peer review data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return diffInHours + 'h ago';
    return Math.floor(diffInHours / 24) + 'd ago';
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getReviewerName = (review) => {
    if (review.is_anonymous) return 'Anonymous Reviewer';
    const firstName = review.reviewer_first_name || '';
    const lastName = review.reviewer_last_name || '';
    const fullName = (firstName + ' ' + lastName).trim();
    return fullName || 'Reviewer';
  };

  // Handlers
  const handleStartReview = (submission) => {
    setReviewingSubmission(submission);
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
      const response = await apiService.peerReview.submitReview(reviewingSubmission.submissionId, {
        submissionId: reviewingSubmission.submissionId,
        rating: reviewForm.rating,
        feedback: reviewForm.feedback,
        strengths: reviewForm.strengths,
        improvements: reviewForm.improvements,
      });
      if (response.data.success) {
        alert('Review submitted successfully! You earned 5 points for helping a peer.');
        setReviews((prev) => prev.filter((r) => r.id !== reviewingSubmission.id));
        setReviewingSubmission(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review. Please try again.');
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
      const response = await apiService.peerReview.submitWorkForReview(submitForm);
      if (response.data.success) {
        alert('Work submitted successfully! Other users can now review it.');
        setShowSubmitModal(false);
        setSubmitForm({ title: '', description: '', content: '', category: 'General', difficulty: 'Intermediate' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      const response = await apiService.peerReview.updateSubmission(editingSubmission.submissionId, editForm);
      if (response.data.success) {
        alert('Submission updated successfully!');
        setEditingSubmission(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!deletingSubmission) return;
    setSubmitting(true);
    try {
      const response = await apiService.peerReview.deleteSubmission(deletingSubmission.submissionId);
      if (response.data.success) {
        alert('Submission deleted successfully!');
        setDeletingSubmission(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFeedback = async (submission) => {
    setViewingFeedback(submission);
    if (submission.reviews?.length > 0) {
      for (const review of submission.reviews) {
        if (!review.read_by_reviewee) {
          try { await apiService.peerReview.markFeedbackRead(review.id); } catch {}
        }
      }
      setReceivedFeedback((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - submission.reviews.filter((r) => !r.read_by_reviewee).length),
      }));
    }
  };

  const filteredReviews = reviews.filter(
    (review) => selectedCategory === 'all' || review.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const getDifficultyClass = (difficulty) => {
    const classes = { Beginner: 'beginner', Intermediate: 'intermediate', Advanced: 'advanced' };
    return classes[difficulty] || '';
  };

  return (
    <AppLayout title="Peer Review" subtitle="Collaborate with fellow learners and improve together">
      {/* Review Modal */}
      {reviewingSubmission && (
        <div className="pr-modal-overlay">
          <div className="pr-modal">
            <div className="pr-modal-header">
              <div>
                <h2>Review: {reviewingSubmission.title}</h2>
                <p>By {reviewingSubmission.author} • {reviewingSubmission.category}</p>
              </div>
              <button className="pr-modal-close" onClick={() => setReviewingSubmission(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="pr-modal-body">
              <div className="pr-submission-preview">
                <pre>{reviewingSubmission.fullContent || reviewingSubmission.workSnippet}</pre>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="pr-form-group">
                  <label className="pr-form-label">Rating</label>
                  <div className="pr-star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={'pr-star ' + (star <= reviewForm.rating ? 'active' : '')}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">What did they do well?</label>
                  <textarea
                    className="pr-form-textarea"
                    value={reviewForm.strengths}
                    onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                    placeholder="Describe what the submitter did well..."
                  />
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Areas for Improvement</label>
                  <textarea
                    className="pr-form-textarea"
                    value={reviewForm.improvements}
                    onChange={(e) => setReviewForm({ ...reviewForm, improvements: e.target.value })}
                    placeholder="Suggest areas where they could improve..."
                  />
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Overall Feedback *</label>
                  <textarea
                    className="pr-form-textarea"
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                    placeholder="Provide your overall feedback and suggestions..."
                    required
                    style={{ minHeight: '120px' }}
                  />
                </div>
              </form>
            </div>
            <div className="pr-modal-footer">
              <button className="pr-btn-cancel" onClick={() => setReviewingSubmission(null)} disabled={submitting}>Cancel</button>
              <button className="pr-action-btn primary" onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="pr-modal-overlay">
          <div className="pr-modal">
            <div className="pr-modal-header">
              <div>
                <h2>Submit Work for Review</h2>
                <p>Share your work for feedback from peers</p>
              </div>
              <button className="pr-modal-close" onClick={() => setShowSubmitModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="pr-modal-body">
              <form onSubmit={handleSubmitWork}>
                <div className="pr-form-group">
                  <label className="pr-form-label">Title *</label>
                  <input
                    type="text"
                    className="pr-form-input"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    placeholder="E.g., Python Sorting Function, Essay on Climate Change..."
                    required
                  />
                </div>
                <div className="pr-form-row">
                  <div className="pr-form-group">
                    <label className="pr-form-label">Category</label>
                    <select className="pr-form-select" value={submitForm.category} onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}>
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
                  <div className="pr-form-group">
                    <label className="pr-form-label">Difficulty</label>
                    <select className="pr-form-select" value={submitForm.difficulty} onChange={(e) => setSubmitForm({ ...submitForm, difficulty: e.target.value })}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Description (optional)</label>
                  <textarea
                    className="pr-form-textarea"
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    placeholder="What kind of feedback are you looking for?"
                  />
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Your Work *</label>
                  <textarea
                    className="pr-form-textarea code"
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                    placeholder="Paste your code, essay, or work here..."
                    required
                  />
                </div>
              </form>
            </div>
            <div className="pr-modal-footer">
              <button className="pr-btn-cancel" onClick={() => setShowSubmitModal(false)} disabled={submitting}>Cancel</button>
              <button className="pr-action-btn primary" onClick={handleSubmitWork} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSubmission && (
        <div className="pr-modal-overlay">
          <div className="pr-modal">
            <div className="pr-modal-header">
              <div>
                <h2>Edit Submission</h2>
                <p>Update your submission details</p>
              </div>
              <button className="pr-modal-close" onClick={() => setEditingSubmission(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="pr-modal-body">
              <form onSubmit={handleSaveEdit}>
                <div className="pr-form-group">
                  <label className="pr-form-label">Title *</label>
                  <input
                    type="text"
                    className="pr-form-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="pr-form-row">
                  <div className="pr-form-group">
                    <label className="pr-form-label">Category</label>
                    <select className="pr-form-select" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
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
                  <div className="pr-form-group">
                    <label className="pr-form-label">Difficulty</label>
                    <select className="pr-form-select" value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Description</label>
                  <textarea className="pr-form-textarea" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="pr-form-group">
                  <label className="pr-form-label">Your Work</label>
                  <textarea className="pr-form-textarea code" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="pr-modal-footer">
              <button className="pr-btn-cancel" onClick={() => setEditingSubmission(null)} disabled={submitting}>Cancel</button>
              <button className="pr-action-btn primary" onClick={handleSaveEdit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <div className="pr-modal-overlay">
          <div className="pr-modal">
            <div className="pr-modal-header">
              <div>
                <h2>Feedback: {viewingFeedback.title}</h2>
                <p>{viewingFeedback.reviewsReceived} reviews • Avg: {viewingFeedback.averageRating ? viewingFeedback.averageRating.toFixed(1) : 'N/A'}</p>
              </div>
              <button className="pr-modal-close" onClick={() => setViewingFeedback(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="pr-modal-body">
              {viewingFeedback.reviews?.length > 0 ? (
                <div className="pr-feedback-list">
                  {viewingFeedback.reviews.map((review, idx) => (
                    <div key={review.id || idx} className={'pr-feedback-item ' + (!review.read_by_reviewee ? 'unread' : '')}>
                      <div className="pr-feedback-item-header">
                        <span className="pr-reviewer-name">{getReviewerName(review)}</span>
                        <span className="pr-stars">{renderStars(review.rating || 0)}</span>
                      </div>
                      <p className="pr-feedback-item-text">{review.review_text}</p>
                      <div className="pr-feedback-item-meta">
                        <span>{formatTimeAgo(review.completed_at)}</span>
                        {!review.read_by_reviewee && <span className="pr-new-tag">New</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pr-empty" style={{ border: 'none', padding: '2rem' }}>
                  <p style={{ margin: 0 }}>No feedback received yet. Check back later!</p>
                </div>
              )}
            </div>
            <div className="pr-modal-footer">
              <button className="pr-action-btn primary" onClick={() => setViewingFeedback(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubmission && (
        <div className="pr-modal-overlay">
          <div className="pr-modal pr-delete-modal">
            <div className="pr-modal-body">
              <div className="pr-delete-icon">⚠️</div>
              <h2>Delete Submission?</h2>
              <p>Are you sure you want to delete "<strong>{deletingSubmission.title}</strong>"? This will also delete all reviews. This cannot be undone.</p>
              <div className="pr-delete-actions">
                <button className="pr-btn-cancel" onClick={() => setDeletingSubmission(null)} disabled={submitting}>Cancel</button>
                <button className="pr-btn-delete" onClick={handleDeleteSubmission} disabled={submitting}>
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pr-container">
        {/* Notification Banner */}
        {receivedFeedback.unreadCount > 0 && (
          <div className="pr-notification">
            <BellIcon />
            <span className="pr-notification-text">
              You have <strong>{receivedFeedback.unreadCount}</strong> new feedback on your submissions!
            </span>
            <button className="pr-notification-btn" onClick={() => setActiveTab('my-submissions')}>
              View Feedback
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="pr-tabs">
          <button className={'pr-tab ' + (activeTab === 'review-others' ? 'active' : '')} onClick={() => setActiveTab('review-others')}>
            <UsersIcon />
            <span>Review Others</span>
            <span className="pr-tab-badge">{reviews.filter((r) => r.needsReview).length}</span>
          </button>
          <button className={'pr-tab ' + (activeTab === 'my-submissions' ? 'active' : '')} onClick={() => setActiveTab('my-submissions')}>
            <FolderIcon />
            <span>My Submissions</span>
            {receivedFeedback.unreadCount > 0 ? (
              <span className="pr-tab-badge alert">{receivedFeedback.unreadCount}</span>
            ) : (
              <span className="pr-tab-badge">{mySubmissions.length}</span>
            )}
          </button>
        </div>

        {/* Review Others Tab */}
        {activeTab === 'review-others' && (
          <>
            <div className="pr-section-header">
              <h2 className="pr-section-title">
                <DocumentIcon />
                Help Others Improve
              </h2>
              <select className="pr-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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
              <LoadingSpinner message="Loading submissions..." />
            ) : error ? (
              <div className="pr-empty">
                <p>{error}</p>
                <button className="pr-action-btn primary" onClick={fetchData}>Retry</button>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="pr-empty">
                <div className="pr-empty-icon"><DocumentIcon /></div>
                <h3>No submissions available</h3>
                <p>Check back later for new submissions to review, or submit your own work!</p>
              </div>
            ) : (
              <div className="pr-grid">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="pr-card">
                    <div className="pr-card-header">
                      <div className="pr-card-avatar">{review.authorInitials}</div>
                      <div className="pr-card-info">
                        <h3 className="pr-card-title">{review.title}</h3>
                        <p className="pr-card-author">by {review.author}</p>
                        <div className="pr-card-tags">
                          <span className="pr-tag pr-tag-category">{review.category}</span>
                          <span className={'pr-tag pr-tag-difficulty ' + getDifficultyClass(review.difficulty)}>{review.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pr-card-body">
                      <p className="pr-card-description">{review.description}</p>
                      <div className="pr-code-preview">
                        <code>{review.workSnippet}</code>
                      </div>
                    </div>
                    <div className="pr-card-footer">
                      <div className="pr-card-meta">
                        <span><ClockIcon /> {formatTimeAgo(review.submittedAt)}</span>
                        <span><MessageIcon /> {review.reviewsCount}/{review.maxReviews}</span>
                      </div>
                      <button
                        className="pr-review-btn"
                        onClick={() => handleStartReview(review)}
                        disabled={!review.needsReview || review.reviewsCount >= review.maxReviews}
                      >
                        {review.reviewsCount >= review.maxReviews ? 'Complete' : 'Review'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Submissions Tab */}
        {activeTab === 'my-submissions' && (
          <>
            <div className="pr-section-header">
              <h2 className="pr-section-title">
                <FolderIcon />
                Your Submissions
              </h2>
              <button className="pr-action-btn primary" onClick={() => setShowSubmitModal(true)}>
                <UploadIcon /> Submit Work
              </button>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading your submissions..." />
            ) : mySubmissions.length === 0 ? (
              <div className="pr-empty">
                <div className="pr-empty-icon"><UploadIcon /></div>
                <h3>No submissions yet</h3>
                <p>Submit your first piece of work to get feedback from peers!</p>
                <button className="pr-action-btn primary" onClick={() => setShowSubmitModal(true)}>Submit Your Work</button>
              </div>
            ) : (
              <div className="pr-submissions-list">
                {mySubmissions.map((submission) => (
                  <div key={submission.id} className="pr-submission-card">
                    <div className="pr-submission-header">
                      <div className="pr-submission-info">
                        <h3 className="pr-submission-title">{submission.title}</h3>
                        <div className="pr-submission-tags">
                          <span className="pr-tag pr-tag-category">{submission.category}</span>
                          <span className={'pr-tag pr-tag-difficulty ' + getDifficultyClass(submission.difficulty)}>{submission.difficulty}</span>
                          <span className={'pr-status-badge ' + submission.status}>
                            {submission.status === 'under-review' ? 'Under Review' : submission.status === 'completed' ? 'Completed' : submission.status}
                          </span>
                        </div>
                      </div>
                      <div className="pr-submission-actions">
                        <button className="pr-action-btn" onClick={() => handleEditSubmission(submission)}>✏️ Edit</button>
                        <button className="pr-action-btn danger" onClick={() => setDeletingSubmission(submission)}>🗑️ Delete</button>
                        <button className="pr-action-btn primary" onClick={() => handleViewFeedback(submission)}>
                          View Feedback
                          {submission.reviews?.some((r) => !r.read_by_reviewee) && <span className="new-badge">New</span>}
                        </button>
                      </div>
                    </div>
                    <div className="pr-submission-stats">
                      <div className="pr-stat">
                        <div className="pr-stat-value">{submission.reviewsReceived}</div>
                        <div className="pr-stat-label">Reviews</div>
                      </div>
                      <div className="pr-stat">
                        <div className="pr-stat-value">{submission.averageRating ? submission.averageRating.toFixed(1) : '—'}</div>
                        <div className="pr-stat-label">Avg Rating</div>
                      </div>
                      <div className="pr-stat">
                        <div className="pr-stat-value">{formatTimeAgo(submission.submittedAt)}</div>
                        <div className="pr-stat-label">Submitted</div>
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="pr-feedback-preview">
                        <div className="pr-feedback-label">Latest Feedback</div>
                        <p className="pr-feedback-text">
                          "{submission.feedback.substring(0, 150)}{submission.feedback.length > 150 ? '...' : ''}"
                        </p>
                      </div>
                    )}
                    <div className="pr-progress-section">
                      <div className="pr-progress-header">
                        <span className="pr-progress-label">Review Progress</span>
                        <span className="pr-progress-count">{submission.reviewsReceived}/{submission.maxReviews}</span>
                      </div>
                      <div className="pr-progress-bar">
                        <div className="pr-progress-fill" style={{ width: ((submission.reviewsReceived / submission.maxReviews) * 100) + '%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tips Section */}
        <div className="pr-tips">
          <div className="pr-tips-header">
            <LightbulbIcon />
            <h3>Review Tips</h3>
          </div>
          <div className="pr-tips-grid">
            <div className="pr-tip">
              <h4>Be Constructive</h4>
              <p>Focus on specific improvements and provide actionable feedback</p>
            </div>
            <div className="pr-tip">
              <h4>Be Respectful</h4>
              <p>Remember there's a person behind the work. Be kind and encouraging</p>
            </div>
            <div className="pr-tip">
              <h4>Be Specific</h4>
              <p>Point out exactly what works well and what could be improved</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PeerReviewPage;
