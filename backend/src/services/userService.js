// User service for database operations and business logic
const db = require('../database/connection');

const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    const { rows } = await db.query(
      'SELECT id, first_name, last_name, email, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    return rows[0];
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const { rows } = await db.query(
      'SELECT id, first_name, last_name, email, password, avatar_url, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return rows[0];
  },

  // Create a new user
  createUser: async (userData) => {
    const { firstName, lastName, email, password } = userData;

    const result = await db.withTransaction(async (client) => {
      // Create user
      const userResult = await client.query(
        `INSERT INTO users (first_name, last_name, email, password)
         VALUES ($1, $2, $3, $4)
         RETURNING id, first_name, last_name, email, created_at`,
        [firstName, lastName, email, password]
      );

      const user = userResult.rows[0];

      // Initialize user statistics
      await client.query(
        `INSERT INTO user_statistics (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );

      return user;
    });

    return result;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Check for first_name (allow empty string check with !== undefined)
    if (profileData.first_name !== undefined && profileData.first_name !== null) {
      fields.push(`first_name = $${paramCount}`);
      values.push(profileData.first_name);
      paramCount++;
    }

    // Check for last_name
    if (profileData.last_name !== undefined && profileData.last_name !== null) {
      fields.push(`last_name = $${paramCount}`);
      values.push(profileData.last_name);
      paramCount++;
    }

    // Bio can be empty string, so check for undefined/null only
    if (profileData.bio !== undefined && profileData.bio !== null) {
      fields.push(`bio = $${paramCount}`);
      values.push(profileData.bio);
      paramCount++;
    }

    // Profile icon (stored in profile_image column)
    if (profileData.profile_icon !== undefined && profileData.profile_icon !== null) {
      fields.push(`profile_image = $${paramCount}`);
      values.push(profileData.profile_icon);
      paramCount++;
    }

    if (fields.length === 0) {
      // If no fields to update, just return the current user data
      const { rows } = await db.query(
        `SELECT id, first_name, last_name, email, bio, profile_image, created_at, updated_at 
         FROM users WHERE id = $1`,
        [userId]
      );
      return rows[0];
    }

    values.push(userId);
    const { rows } = await db.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, first_name, last_name, email, bio, profile_image, created_at, updated_at`,
      values
    );

    return rows[0];
  },

  // Delete user account
  deleteUser: async (userId) => {
    await db.withTransaction(async (client) => {
      // Delete related data first
      await client.query('DELETE FROM user_achievements WHERE user_id = $1', [
        userId,
      ]);
      await client.query('DELETE FROM user_statistics WHERE user_id = $1', [
        userId,
      ]);
      await client.query('DELETE FROM progress_events WHERE user_id = $1', [
        userId,
      ]);
      await client.query('DELETE FROM peer_reviews WHERE reviewer_id = $1', [
        userId,
      ]);
      await client.query(
        'DELETE FROM ai_feedback WHERE submission_id IN (SELECT id FROM submissions WHERE user_id = $1)',
        [userId]
      );
      await client.query('DELETE FROM submissions WHERE user_id = $1', [
        userId,
      ]);
      await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [
        userId,
      ]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
    });
  },

  // Get user statistics
  getUserStats: async (userId) => {
    // Ensure stats exist
    await db.query(
      `INSERT INTO user_statistics (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    const { rows } = await db.query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );
    return rows[0];
  },

  // Initialize user statistics (called after registration)
  initializeUserStats: async (userId) => {
    await db.query(
      `INSERT INTO user_statistics (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
  },

  // Update user statistics
  updateUserStats: async (userId, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'total_points',
      'total_challenges_completed',
      'total_goals_completed',
      'total_peer_reviews_given',
      'total_peer_reviews_received',
      'current_streak_days',
      'longest_streak_days',
      'level',
      'experience_points',
      'last_activity_date',
      'rank_position',
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    values.push(userId);
    const { rows } = await db.query(
      `UPDATE user_statistics SET ${fields.join(
        ', '
      )}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    return rows[0];
  },

  // Increment a specific stat
  incrementStat: async (userId, statName, amount = 1) => {
    const allowedStats = [
      'total_points',
      'total_challenges_completed',
      'total_goals_completed',
      'total_peer_reviews_given',
      'total_peer_reviews_received',
      'experience_points',
    ];

    if (!allowedStats.includes(statName)) {
      throw new Error(`Invalid stat name: ${statName}`);
    }

    // Ensure stats exist
    await db.query(
      `INSERT INTO user_statistics (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    const { rows } = await db.query(
      `UPDATE user_statistics 
       SET ${statName} = ${statName} + $1, 
           last_activity_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, userId]
    );

    return rows[0];
  },

  // Get user with full profile including stats
  getFullProfile: async (userId) => {
    const { rows } = await db.query(
      `SELECT 
        u.id, u.first_name, u.last_name, u.email, u.profile_image, u.bio,
        u.location, u.website, u.created_at, u.updated_at,
        us.total_points, us.total_challenges_completed, us.total_goals_completed,
        us.total_peer_reviews_given, us.total_peer_reviews_received,
        us.current_streak_days, us.longest_streak_days,
        us.level, us.experience_points, us.rank_position,
        us.last_activity_date
       FROM users u
       LEFT JOIN user_statistics us ON u.id = us.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return rows[0];
  },

  // Get all users (for admin)
  getAllUsers: async (options = {}) => {
    const { limit = 50, offset = 0 } = options;

    const { rows } = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_image, 
              u.created_at, us.total_points, us.level
       FROM users u
       LEFT JOIN user_statistics us ON u.id = us.user_id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return rows;
  },

  // Update password
  updatePassword: async (userId, hashedPassword) => {
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );
  },

  // Check if email exists
  emailExists: async (email) => {
    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    return rows.length > 0;
  },
};

module.exports = userService;
