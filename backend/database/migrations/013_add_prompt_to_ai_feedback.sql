-- Migration 013: Add prompt column to ai_feedback table
-- This allows us to store both the prompt sent to AI and the response received

ALTER TABLE ai_feedback 
  ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_feedback_prompt ON ai_feedback(submission_id, created_at DESC);

-- Add comment for clarity
COMMENT ON COLUMN ai_feedback.prompt IS 'The prompt text sent to the AI model for feedback generation';
COMMENT ON COLUMN ai_feedback.feedback_text IS 'The AI-generated response/feedback text';
