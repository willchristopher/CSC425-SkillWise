// Simple in-memory user store for testing
const users = [];
let nextId = 1;

class MockDatabase {
  async query(sql, params = []) {
    // Handle user registration
    if (sql.includes('INSERT INTO users')) {
      const [firstName, lastName, email, hashedPassword] = params;
      
      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const newUser = {
        id: nextId++,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      users.push(newUser);
      return { rows: [newUser] };
    }
    
    // Handle user login lookup
    if (sql.includes('SELECT * FROM users WHERE email')) {
      const [email] = params;
      const user = users.find(user => user.email === email);
      return { rows: user ? [user] : [] };
    }
    
    // Handle refresh token operations
    if (sql.includes('refresh_tokens')) {
      // Mock refresh token operations
      return { rows: [] };
    }
    
    // Default empty response
    return { rows: [] };
  }
  
  async end() {
    // Mock cleanup
  }
}

module.exports = new MockDatabase();