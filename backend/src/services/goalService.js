// Implement goal business logic and calculations
const Goal = require('../models/Goal');
const db = require('../database/connection');

const goalService = {
  // Get user goals with progress
  getUserGoals: async (userId) => {
    try {
      const goals = await Goal.findByUserId(userId);
      
      // Return goals as-is with their stored progress_percentage
      // The progress_percentage can be manually updated or automatically calculated
      return goals;
    } catch (error) {
      throw new Error(`Error getting user goals: ${error.message}`);
    }
  },

  // Create new goal with validation
  createGoal: async (goalData, userId) => {
    try {
      // Validate required fields
      if (!goalData.title) {
        throw new Error('Goal title is required');
      }

      // Set defaults
      const goal = {
        ...goalData,
        user_id: userId,
        progress_percentage: 0,
        is_completed: false
      };

      const newGoal = await Goal.create(goal);
      return newGoal;
    } catch (error) {
      throw new Error(`Error creating goal: ${error.message}`);
    }
  },

  // Update goal progress
  updateProgress: async (goalId, progress) => {
    try {
      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const updateData = {
        progress_percentage: progress,
        is_completed: progress >= 100
      };

      if (progress >= 100) {
        updateData.completion_date = new Date();
      }

      const updatedGoal = await Goal.update(goalId, updateData);
      return updatedGoal;
    } catch (error) {
      throw new Error(`Error updating progress: ${error.message}`);
    }
  },

  // Calculate goal completion percentage based on challenges
  calculateCompletion: async (goalId) => {
    try {
      // Get all challenges linked to this goal
      const query = `
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM user_goal_challenges
        WHERE goal_id = $1
      `;
      const result = await db.query(query, [goalId]);
      
      // Handle case when result is undefined or empty
      if (!result || !result.rows || result.rows.length === 0) {
        return 0;
      }
      
      const { total, completed } = result.rows[0];
      
      // Convert to numbers since PostgreSQL returns strings
      const totalNum = parseInt(total, 10) || 0;
      const completedNum = parseInt(completed, 10) || 0;
      
      if (totalNum === 0) return 0;
      
      return Math.round((completedNum / totalNum) * 100);
    } catch (error) {
      console.error('Error calculating completion:', error);
      return 0;
    }
  }
};

module.exports = goalService;