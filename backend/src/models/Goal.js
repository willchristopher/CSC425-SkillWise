const db = require('../database/connection');

class Goal {
  static async findByUserId(userId) {
    try {
      const query = 'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding goals for user: ${error.message}`);
    }
  }

  static async findById(goalId) {
    try {
      const query = 'SELECT * FROM goals WHERE id = $1';
      const result = await db.query(query, [goalId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding goal: ${error.message}`);
    }
  }

  static async create(goalData) {
    try {
      const { title, description, user_id, target_date, type, category } = goalData;
      
      if (!user_id) {
        throw new Error('Missing user_id for creating goal');
      }

      const query = `
        INSERT INTO goals (title, description, user_id, category, target_completion_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      const result = await db.query(query, [title, description, user_id, category || null, target_date || null]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating goal: ${error.message}`);
    }
  }

  static async update(goalId, updateData) {
    try {
      const { title, description, target_date, progress, status } = updateData;
      
      // Build dynamic UPDATE query
      const updates = [];
      const values = [goalId];
      let paramCount = 1;
      
      if (title !== undefined) {
        paramCount++;
        updates.push(`title = $${paramCount}`);
        values.push(title);
      }
      
      if (description !== undefined) {
        paramCount++;
        updates.push(`description = $${paramCount}`);
        values.push(description);
      }
      
      if (target_date !== undefined) {
        paramCount++;
        updates.push(`target_completion_date = $${paramCount}`);
        values.push(target_date);
      }
      
      if (progress !== undefined) {
        paramCount++;
        updates.push(`progress_percentage = $${paramCount}`);
        values.push(progress);
      }
      
      if (status !== undefined) {
        paramCount++;
        updates.push(`is_completed = $${paramCount}`);
        values.push(status);
      }
      
      if (updates.length === 0) {
        // No updates, just return the existing goal
        const query = 'SELECT * FROM goals WHERE id = $1';
        const result = await db.query(query, [goalId]);
        return result.rows[0];
      }
      
      updates.push('updated_at = NOW()');
      
      const query = `
        UPDATE goals 
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating goal: ${error.message}`);
    }
  }

  static async delete(goalId) {
    try {
      const query = 'DELETE FROM goals WHERE id = $1 RETURNING *';
      const result = await db.query(query, [goalId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting goal: ${error.message}`);
    }
  }
}

module.exports = Goal;