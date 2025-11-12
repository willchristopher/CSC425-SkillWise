// Test environment setup and configuration
const db = require('../src/database/connection');

// Global test setup
beforeAll(async () => {
  // Test database connection (skip if not available for unit tests)
  try {
    await db.query('SELECT 1');
    console.log('✅ Test database connected');
  } catch (err) {
    console.warn('⚠️  Test database not available, skipping integration tests:', err.message);
    // Don't throw - allow unit tests to run without database
  }
});

// Global test cleanup
afterAll(async () => {
  try {
    // Clean up test data if needed
    // await db.query('TRUNCATE TABLE users CASCADE');
    
    // Close database connections
    await db.end();
    console.log('✅ Test database cleanup completed');
  } catch (err) {
    console.error('❌ Test cleanup failed:', err.message);
  }
});

// Helper function to clear test data between tests
const clearTestData = async (tables = []) => {
  // Default tables if none provided
  const tablesToClear = tables.length > 0 ? tables : [
    'user_achievements',
    'achievements', 
    'leaderboard',
    'progress_events',
    'peer_reviews',
    'ai_feedback',
    'submissions',
    'challenges',
    'goals',
    'refresh_tokens',
    'users'
  ];

  for (const table of tablesToClear) {
    try {
      await db.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    } catch (err) {
      // Table might not exist, continue
      console.warn(`Warning: Could not truncate table ${table}:`, err.message);
    }
  }
};

// Export test utilities
module.exports = {
  testPool: db.pool, // For backwards compatibility
  clearTestData,
  db
};