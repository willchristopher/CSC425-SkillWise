const pool = require('../database/connection');

const submissionService = {
  /**
   * Submit a challenge solution or mark complete
   */
  submitSolution: async (submissionData, userId) => {
    try {
      const {
        challenge_id,
        submission_text = '',
        status = 'submitted',
        score = null,
        time_spent_minutes = null
      } = submissionData;

      // If marking as completed, update existing in_progress submission
      if (status === 'completed') {
        const updateQuery = `
          UPDATE submissions
          SET status = 'completed',
              submission_text = $1,
              submitted_at = NOW()
          WHERE challenge_id = $2 AND user_id = $3 AND status = 'in_progress'
          RETURNING id, challenge_id as "challengeId", status
        `;
        
        const result = await pool.query(updateQuery, [
          submission_text || 'Challenge completed',
          challenge_id,
          userId
        ]);

        if (result.rows.length > 0) {
          return result.rows[0];
        }
      }

      // Create new submission
      const query = `
        INSERT INTO submissions (
          user_id,
          challenge_id,
          submission_text,
          status,
          score,
          time_spent_minutes,
          submitted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id, user_id as "userId", challenge_id as "challengeId", status, score
      `;
      
      const result = await pool.query(query, [
        userId,
        challenge_id,
        submission_text,
        status,
        score,
        time_spent_minutes
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  /**
   * Get submission by ID
   */
  getSubmissionById: async (submissionId, userId) => {
    try {
      const query = `
        SELECT 
          s.*,
          c.title as "challengeTitle"
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.id = $1 AND s.user_id = $2
      `;
      
      const result = await pool.query(query, [submissionId, userId]);
      
      if (result.rows.length === 0) {
        const error = new Error('Submission not found');
        error.statusCode = 404;
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },

  /**
   * Get all submissions for a user
   */
  getUserSubmissions: async (userId) => {
    try {
      const query = `
        SELECT 
          s.id,
          s.user_id as "userId",
          s.challenge_id as "challengeId",
          s.challenge_id as "challenge_id",
          s.submission_text as "submissionText",
          s.status,
          s.score,
          s.attempt_number as "attemptNumber",
          s.time_spent_minutes as "timeSpent",
          s.submitted_at as "submittedAt",
          s.feedback,
          c.title as "challengeTitle",
          c.points_reward as "challengePoints"
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1
        ORDER BY s.submitted_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      throw error;
    }
  },

  /**
   * Get all submissions for a challenge
   */
  getChallengeSubmissions: async (challengeId) => {
    try {
      const query = `
        SELECT 
          s.*,
          u.first_name as "userFirstName",
          u.last_name as "userLastName"
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        WHERE s.challenge_id = $1
        ORDER BY s.submitted_at DESC
      `;
      
      const result = await pool.query(query, [challengeId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching challenge submissions:', error);
      throw error;
    }
  },

  /**
   * Grade a submission
   */
  gradeSubmission: async (submissionId, gradeData) => {
    try {
      const { score, feedback, graded_by } = gradeData;

      const query = `
        UPDATE submissions
        SET score = $1,
            feedback = $2,
            graded_by = $3,
            graded_at = NOW()
        WHERE id = $4
        RETURNING *
      `;

      const result = await pool.query(query, [score, feedback, graded_by, submissionId]);

      if (result.rows.length === 0) {
        const error = new Error('Submission not found');
        error.statusCode = 404;
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  },

  /**
   * Update submission status
   */
  updateSubmissionStatus: async (submissionId, status, userId = null) => {
    try {
      const whereClause = userId ? 'WHERE id = $1 AND user_id = $3' : 'WHERE id = $1';
      const params = userId ? [submissionId, status, userId] : [submissionId, status];

      const query = `
        UPDATE submissions
        SET status = $2, updated_at = NOW()
        ${whereClause}
        RETURNING *
      `;

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        const error = new Error('Submission not found');
        error.statusCode = 404;
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  }
};

module.exports = submissionService;