import React, { useState } from 'react';
import { Alert, Button, Card, Input, Loading } from '../ui';
import { apiService } from '../../services/api';

const SubmissionForm = ({ challenge, onSubmissionComplete }) => {
  const [submission, setSubmission] = useState({
    type: 'code', // 'code' or 'text'
    content: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission.content.trim()) {
      setError('Please provide your submission content');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Submit for AI feedback
      const response = await apiService.ai.submitForFeedback({
        submissionText: submission.content,
        challengeContext: {
          title: challenge.title,
          description: challenge.description,
          requirements: challenge.requirements || []
        },
        notes: submission.notes
      });

      setFeedback(response.data?.feedback);
      
      if (onSubmissionComplete) {
        onSubmissionComplete(response.data);
      }

    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit for feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmission({ type: 'code', content: '', notes: '' });
    setFeedback(null);
    setError('');
  };

  return (
    <div className="submission-form">
      <Card>
        <Card.Header>
          <h3>Submit Your Work</h3>
          <p>Submit your solution to get AI-powered feedback</p>
        </Card.Header>
        
        <Card.Content>
          {error && (
            <Alert variant="error" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label>Submission Type</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="code"
                    checked={submission.type === 'code'}
                    onChange={(e) => setSubmission({...submission, type: e.target.value})}
                  />
                  Code Solution
                </label>
                <label className="radio-option">
                  <input
                    type="radio" 
                    value="text"
                    checked={submission.type === 'text'}
                    onChange={(e) => setSubmission({...submission, type: e.target.value})}
                  />
                  Text/Explanation
                </label>
              </div>
            </div>

            <div className="form-group mb-4">
              <label>
                {submission.type === 'code' ? 'Your Code Solution' : 'Your Answer/Explanation'}
              </label>
              <textarea
                value={submission.content}
                onChange={(e) => setSubmission({...submission, content: e.target.value})}
                placeholder={
                  submission.type === 'code' 
                    ? "Paste your code solution here..." 
                    : "Write your answer or explanation here..."
                }
                className="form-textarea"
                rows="8"
                required
              />
            </div>

            <div className="form-group mb-4">
              <label>Notes (Optional)</label>
              <Input
                value={submission.notes}
                onChange={(e) => setSubmission({...submission, notes: e.target.value})}
                placeholder="Any additional notes or questions..."
              />
            </div>

            <div className="form-actions">
              <Button variant="outline" type="button" onClick={handleReset}>
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !submission.content.trim()}
                loading={isSubmitting}
              >
                Submit for AI Feedback
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* AI Feedback Display */}
      {feedback && (
        <Card className="mt-4">
          <Card.Header>
            <h3>🤖 AI Feedback</h3>
          </Card.Header>
          <Card.Content>
            <div className="ai-feedback">
              <div 
                className="feedback-content"
                dangerouslySetInnerHTML={{ 
                  __html: feedback.replace(/\n/g, '<br/>') 
                }}
              />
            </div>
          </Card.Content>
        </Card>
      )}

      {isSubmitting && (
        <div className="submission-loading">
          <Loading text="Getting AI feedback on your submission..." />
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;