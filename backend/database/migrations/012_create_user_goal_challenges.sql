-- Migration 012: Create user_goal_challenges junction table
-- Links user goals with challenges they want to complete

CREATE TABLE IF NOT EXISTS user_goal_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_goal_challenges_user_id ON user_goal_challenges(user_id);
CREATE INDEX idx_user_goal_challenges_goal_id ON user_goal_challenges(goal_id);
CREATE INDEX idx_user_goal_challenges_challenge_id ON user_goal_challenges(challenge_id);
CREATE INDEX idx_user_goal_challenges_status ON user_goal_challenges(status);
CREATE UNIQUE INDEX idx_user_goal_challenge_unique ON user_goal_challenges(user_id, goal_id, challenge_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_goal_challenges_updated_at BEFORE UPDATE ON user_goal_challenges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
