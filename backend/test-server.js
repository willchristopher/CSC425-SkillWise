// Simple test server for authentication
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Simple in-memory user storage for testing
const users = [
  {
    id: 1,
    firstName: 'Emma',
    lastName: 'Student',
    email: 'test@skillwise.com',
    password: 'password123', // In real app, this would be hashed
  },
];

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'OK', message: 'SkillWise API is running' });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if user exists
  if (users.find(user => user.email === email)) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    firstName,
    lastName,
    email,
    password, // In real app, hash this
  };

  users.push(newUser);

  res.json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    },
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Return success with mock token
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken: 'mock-jwt-token-' + Date.now(),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillWise Test API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
  console.log(`🌐 API endpoints: http://localhost:${PORT}/api`);
  console.log('\n🧪 TEST CREDENTIALS:');
  console.log('   Email: test@skillwise.com');
  console.log('   Password: password123');
  console.log('\n✅ You can also create new accounts via signup!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down server...');
  process.exit(0);
});
