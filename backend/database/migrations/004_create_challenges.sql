-- Migration 004: Create challenges table for learning activities
-- Migration 004: Create challenges table

CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  estimated_time_minutes INTEGER,
  points_reward INTEGER DEFAULT 10,
  max_attempts INTEGER DEFAULT 3,
  requires_peer_review BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  tags TEXT[],
  prerequisites TEXT[],
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty_level);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_challenges_created_by ON challenges(created_by);
CREATE INDEX idx_challenges_tags ON challenges USING GIN(tags);

-- Create trigger for updated_at
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create challenge_goals junction table to link challenges to goals
CREATE TABLE IF NOT EXISTS challenge_goals (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(challenge_id, goal_id)
);

-- Create indexes for challenge_goals
CREATE INDEX idx_challenge_goals_challenge_id ON challenge_goals(challenge_id);
CREATE INDEX idx_challenge_goals_goal_id ON challenge_goals(goal_id);
CREATE INDEX idx_challenge_goals_created_by ON challenge_goals(created_by);