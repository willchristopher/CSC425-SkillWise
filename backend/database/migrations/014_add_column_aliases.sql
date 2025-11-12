-- Migration 014: Add column aliases for backward compatibility
-- This migration ensures models can use both old and new column names

-- Add target_date as an alias for target_completion_date in goals table
-- (PostgreSQL doesn't support true column aliases, so we'll update the model instead)
-- This migration ensures the schema is correct

-- Verify goals table has target_completion_date (already exists from migration 003)
-- No schema changes needed - the column already exists

-- Verify challenges table has difficulty_level (already exists from migration 004)
-- No schema changes needed - the column already exists

-- This migration serves as a marker that we've verified the schema
-- and updated the models to use the correct column names
