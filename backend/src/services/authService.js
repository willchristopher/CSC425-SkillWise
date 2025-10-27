// Authentication business logic
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');

const authService = {
  // User login logic
  login: async (email, password) => {
    // Find user by email
    const { rows } = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = jwt.generateToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });
    
    const refreshToken = jwt.generateRefreshToken({ 
      id: user.id 
    });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [refreshToken, user.id, expiresAt]
    );

    // Return user data without password hash
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.first_name,
        lastName: userWithoutPassword.last_name,
        role: userWithoutPassword.role
      },
      accessToken,
      refreshToken
    };
  },

  // User registration
  register: async (userData) => {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const { rows: existingUsers } = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, role`,
      [email, passwordHash, firstName, lastName, 'student']
    );

    const newUser = rows[0];

    // Generate tokens
    const accessToken = jwt.generateToken({ 
      id: newUser.id, 
      email: newUser.email,
      role: newUser.role 
    });
    
    const refreshToken = jwt.generateRefreshToken({ 
      id: newUser.id 
    });

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [refreshToken, newUser.id, expiresAt]
    );

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      },
      accessToken,
      refreshToken
    };
  },

  // Token refresh
  refreshToken: async (refreshToken) => {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database and is not revoked
    const { rows } = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND is_revoked = false AND expires_at > NOW()',
      [refreshToken, decoded.id]
    );

    if (rows.length === 0) {
      throw new Error('Refresh token not found or expired');
    }

    // Get user data
    const { rows: userRows } = await db.query(
      'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (userRows.length === 0) {
      throw new Error('User not found or inactive');
    }

    const user = userRows[0];

    // Generate new access token
    const accessToken = jwt.generateToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  },

  // Logout - revoke refresh token
  logout: async (refreshToken) => {
    if (refreshToken) {
      await db.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
        [refreshToken]
      );
    }
  },

  // Password reset (basic implementation)
  resetPassword: async (email) => {
    const { rows } = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      // Don't reveal if email exists
      return { message: 'If email exists, password reset link sent' };
    }

    // TODO: Generate reset token and send email
    // For now, just return success message
    return { message: 'If email exists, password reset link sent' };
  }
};

module.exports = authService;