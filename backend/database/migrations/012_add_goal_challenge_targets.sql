-- Migration 012: Add challenge targets to goals
-- This allows goals to be connected to challenges with daily/weekly targets

ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS challenges_target INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenges_period VARCHAR(20) DEFAULT 'week',
ADD COLUMN IF NOT EXISTS challenges_completed INTEGER DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN goals.challenges_target IS 'Number of challenges to complete per period';
COMMENT ON COLUMN goals.challenges_period IS 'Period for challenge target: day, week, month';
COMMENT ON COLUMN goals.challenges_completed IS 'Number of challenges completed towards this goal';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_goals_challenges_target ON goals(challenges_target) WHERE challenges_target > 0;
