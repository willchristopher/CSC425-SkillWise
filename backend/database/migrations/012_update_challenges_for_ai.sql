-- Migration 012: Update challenges table for AI-generated question types
-- Add questions JSONB column to store generated questions with different types

-- Add questions column to store array of question objects
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS questions JSONB;

-- Add question_types column to track what types of questions are included
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS question_types TEXT[];

-- Add custom_instructions column for AI generation parameters
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS custom_instructions TEXT;

-- Add estimated_time as string (e.g., "15 minutes") to match AI output
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS estimated_time VARCHAR(100);

-- Add goal_id column to link challenges directly to goals
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL;

-- Create index for goal_id
CREATE INDEX IF NOT EXISTS idx_challenges_goal_id ON challenges(goal_id);

-- Create index for question_types
CREATE INDEX IF NOT EXISTS idx_challenges_question_types ON challenges USING GIN(question_types);

-- Comment on the columns
COMMENT ON COLUMN challenges.questions IS 'JSONB array of question objects with various types (mcq, fill-blank, true-false, etc.)';
COMMENT ON COLUMN challenges.question_types IS 'Array of question type identifiers included in this challenge';
COMMENT ON COLUMN challenges.goal_id IS 'Optional reference to a goal this challenge contributes to';
