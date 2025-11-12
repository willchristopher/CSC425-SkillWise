-- Migration 013: Add goal_id to challenges table for direct relationship
-- This allows challenges to be directly linked to goals

ALTER TABLE challenges
ADD COLUMN goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_challenges_goal_id ON challenges(goal_id);

-- Add comment
COMMENT ON COLUMN challenges.goal_id IS 'Optional direct link to a goal. Use user_goal_challenges for many-to-many relationships.';
