-- Migration 012: Create AI interaction logs table
-- This table stores all AI API calls for auditing and analysis

CREATE TABLE IF NOT EXISTS ai_interaction_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  endpoint VARCHAR(100) NOT NULL, -- e.g., 'generateChallenge', 'feedback', 'hints'
  prompt_text TEXT NOT NULL,
  system_prompt TEXT,
  response_text TEXT,
  model VARCHAR(50), -- e.g., 'gemini-2.5-flash'
  temperature DECIMAL(3,2),
  max_tokens INTEGER,
  tokens_used INTEGER,
  response_time_ms INTEGER, -- Response time in milliseconds
  status VARCHAR(20) DEFAULT 'success', -- success, error, blocked
  error_message TEXT,
  metadata JSONB, -- Additional context (category, difficulty, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for querying
CREATE INDEX idx_ai_logs_user_id ON ai_interaction_logs(user_id);
CREATE INDEX idx_ai_logs_endpoint ON ai_interaction_logs(endpoint);
CREATE INDEX idx_ai_logs_created_at ON ai_interaction_logs(created_at);
CREATE INDEX idx_ai_logs_status ON ai_interaction_logs(status);

-- Add comment
COMMENT ON TABLE ai_interaction_logs IS 'Logs all AI API interactions for auditing, debugging, and analytics';
