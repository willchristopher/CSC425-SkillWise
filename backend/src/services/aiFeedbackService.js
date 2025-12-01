// AI Feedback persistence service
const { query } = require('../database/connection');

/**
 * Store AI feedback in the database
 * @param {object} feedbackData - Feedback data to store
 * @returns {Promise<object>} Created feedback record
 */
const createAIFeedback = async (feedbackData) => {
  const {
    submissionId,
    prompt,
    response,
    feedbackType = 'general',
    confidenceScore = null,
    suggestions = [],
    strengths = [],
    improvements = [],
    aiModel = 'gemini-2.5-flash',
    processingTimeMs = null,
  } = feedbackData;

  const result = await query(
    `
    INSERT INTO ai_feedback (
      submission_id,
      prompt,
      feedback_text,
      feedback_type,
      confidence_score,
      suggestions,
      strengths,
      improvements,
      ai_model,
      processing_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,
    [
      submissionId,
      prompt,
      response,
      feedbackType,
      confidenceScore,
      suggestions,
      strengths,
      improvements,
      aiModel,
      processingTimeMs,
    ]
  );

  return result.rows[0];
};

/**
 * Get AI feedback for a specific submission
 * @param {number} submissionId - Submission ID
 * @returns {Promise<Array>} Array of feedback records
 */
const getFeedbackBySubmission = async (submissionId) => {
  const result = await query(
    `
    SELECT 
      id,
      submission_id,
      prompt,
      feedback_text as response,
      feedback_type,
      confidence_score,
      suggestions,
      strengths,
      improvements,
      ai_model,
      processing_time_ms,
      created_at,
      updated_at
    FROM ai_feedback
    WHERE submission_id = $1
    ORDER BY created_at DESC
  `,
    [submissionId]
  );

  return result.rows;
};

/**
 * Get latest AI feedback for a submission
 * @param {number} submissionId - Submission ID
 * @returns {Promise<object|null>} Latest feedback record or null
 */
const getLatestFeedback = async (submissionId) => {
  const result = await query(
    `
    SELECT 
      id,
      submission_id,
      prompt,
      feedback_text as response,
      feedback_type,
      confidence_score,
      suggestions,
      strengths,
      improvements,
      ai_model,
      processing_time_ms,
      created_at,
      updated_at
    FROM ai_feedback
    WHERE submission_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `,
    [submissionId]
  );

  return result.rows[0] || null;
};

/**
 * Get all AI feedback for a user's submissions
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of feedback records with submission details
 */
const getFeedbackByUser = async (userId) => {
  const result = await query(
    `
    SELECT 
      af.id,
      af.submission_id,
      af.prompt,
      af.feedback_text as response,
      af.feedback_type,
      af.confidence_score,
      af.suggestions,
      af.strengths,
      af.improvements,
      af.ai_model,
      af.processing_time_ms,
      af.created_at,
      af.updated_at,
      s.challenge_id,
      s.status as submission_status,
      s.score as submission_score,
      c.title as challenge_title
    FROM ai_feedback af
    JOIN submissions s ON af.submission_id = s.id
    JOIN challenges c ON s.challenge_id = c.id
    WHERE s.user_id = $1
    ORDER BY af.created_at DESC
  `,
    [userId]
  );

  return result.rows;
};

/**
 * Delete AI feedback
 * @param {number} feedbackId - Feedback ID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteFeedback = async (feedbackId) => {
  const result = await query(
    `
    DELETE FROM ai_feedback
    WHERE id = $1
    RETURNING id
  `,
    [feedbackId]
  );

  return result.rows.length > 0;
};

/**
 * Update AI feedback
 * @param {number} feedbackId - Feedback ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated feedback record
 */
const updateFeedback = async (feedbackId, updates) => {
  const allowedFields = [
    'feedback_text',
    'confidence_score',
    'suggestions',
    'strengths',
    'improvements',
  ];

  const setClause = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      setClause.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(feedbackId);

  const result = await query(
    `
    UPDATE ai_feedback
    SET ${setClause.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `,
    values
  );

  return result.rows[0];
};

module.exports = {
  createAIFeedback,
  getFeedbackBySubmission,
  getLatestFeedback,
  getFeedbackByUser,
  deleteFeedback,
  updateFeedback,
};
