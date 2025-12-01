// Simple in-memory user store for testing
const users = [];
const refreshTokens = [];
let nextUserId = 1;
let nextTokenId = 1;

class MockDatabase {
  async query(sql, params = []) {
    console.log(
      '[MockDB] Query:',
      sql.substring(0, 80),
      'Params:',
      params.length
    );

    // Handle user registration - INSERT INTO users (email, password_hash, first_name, last_name)
    if (sql.includes('INSERT INTO users') && sql.includes('password_hash')) {
      const [email, passwordHash, firstName, lastName] = params;

      const newUser = {
        id: nextUserId++,
        email: email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      users.push(newUser);
      console.log('[MockDB] Created user:', email);
      return { rows: [newUser] };
    }

    // Handle check if user exists by email (for registration)
    if (sql.includes('SELECT id FROM users WHERE email')) {
      const [email] = params;
      const user = users.find((u) => u.email === email.toLowerCase());
      return { rows: user ? [{ id: user.id }] : [] };
    }

    // Handle user login lookup - SELECT ... FROM users WHERE email = $1
    if (sql.includes('SELECT') && sql.includes('FROM users WHERE email')) {
      const [email] = params;
      const user = users.find((u) => u.email === email.toLowerCase());
      console.log('[MockDB] Login lookup for:', email, 'Found:', !!user);
      return { rows: user ? [user] : [] };
    }

    // Handle UPDATE users SET last_login
    if (sql.includes('UPDATE users SET last_login')) {
      return { rows: [], rowCount: 1 };
    }

    // Handle INSERT refresh token
    if (sql.includes('INSERT INTO refresh_tokens')) {
      const [token, userId, expiresAt] = params;
      const newToken = {
        id: nextTokenId++,
        token: token,
        user_id: userId,
        expires_at: expiresAt,
        is_revoked: false,
        created_at: new Date(),
      };
      refreshTokens.push(newToken);
      return { rows: [newToken] };
    }

    // Handle SELECT refresh token with user join
    if (
      sql.includes('SELECT') &&
      sql.includes('refresh_tokens') &&
      sql.includes('JOIN')
    ) {
      const [token] = params;
      const storedToken = refreshTokens.find(
        (t) => t.token === token && !t.is_revoked
      );
      if (storedToken) {
        const user = users.find((u) => u.id === storedToken.user_id);
        if (user) {
          return {
            rows: [
              {
                id: storedToken.id,
                user_id: user.id,
                expires_at: storedToken.expires_at,
                is_revoked: storedToken.is_revoked,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_active: user.is_active,
              },
            ],
          };
        }
      }
      return { rows: [] };
    }

    // Handle DELETE/UPDATE refresh tokens (logout, revoke)
    if (
      sql.includes('UPDATE refresh_tokens') ||
      sql.includes('DELETE FROM refresh_tokens')
    ) {
      const [token] = params;
      const idx = refreshTokens.findIndex((t) => t.token === token);
      if (idx !== -1) {
        refreshTokens[idx].is_revoked = true;
      }
      return { rows: [], rowCount: 1 };
    }

    // Handle user profile lookup
    if (sql.includes('SELECT') && sql.includes('FROM users WHERE id')) {
      const [userId] = params;
      const user = users.find((u) => u.id === userId);
      return { rows: user ? [user] : [] };
    }

    // Default empty response
    console.log('[MockDB] Unhandled query:', sql.substring(0, 60));
    return { rows: [] };
  }

  async end() {
    // Mock cleanup
  }
}

module.exports = new MockDatabase();
