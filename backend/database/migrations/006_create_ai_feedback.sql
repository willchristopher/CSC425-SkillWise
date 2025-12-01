-- Migration 006: Create AI feedback table
-- Story 3.6: Table created with submission_id, model, prompt, response, score, rubric

CREATE TABLE IF NOT EXISTS ai_feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  model VARCHAR(50),                       -- Story 3.6: The AI model used
  prompt TEXT,                             -- Story 3.6: The prompt sent to AI
  response TEXT,                           -- Story 3.6: The AI response
  score NUMERIC(5,2),                      -- Story 3.6: Score from AI evaluation
  rubric JSONB,                            -- Story 3.6: Rubric criteria used
  feedback_text TEXT,                      -- Parsed feedback summary
  feedback_type VARCHAR(50) DEFAULT 'general',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  suggestions TEXT[],
  strengths TEXT[],
  improvements TEXT[],
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_ai_feedback_submission_id ON ai_feedback(submission_id);
CREATE INDEX idx_ai_feedback_type ON ai_feedback(feedback_type);
CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_feedback_updated_at BEFORE UPDATE ON ai_feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();