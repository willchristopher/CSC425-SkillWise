// Enhanced in-memory store for testing all features
const users = [];
const challenges = [];
const goals = [];
const aiInteractions = [];
const refreshTokens = [];
let nextUserId = 1;
let nextChallengeId = 1;
let nextGoalId = 1;
let nextAIId = 1;

// Sample data initialization
const sampleChallenges = [
  {
    id: 1,
    title: 'Array Manipulation Challenge',
    description: 'Write a function to find the maximum sum of contiguous elements in an array.',
    category: 'algorithms',
    difficulty: 'medium',
    tags: ['arrays', 'algorithms'],
    created_by: null,
    is_public: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    title: 'Binary Search Implementation',
    description: 'Implement binary search algorithm with O(log n) complexity.',
    category: 'algorithms',
    difficulty: 'easy',
    tags: ['search', 'algorithms'],
    created_by: null,
    is_public: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    title: 'React Component Challenge',
    description: 'Create a reusable form component with validation.',
    category: 'frontend',
    difficulty: 'hard',
    tags: ['react', 'frontend', 'forms'],
    created_by: null,
    is_public: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Initialize sample data
challenges.push(...sampleChallenges);
nextChallengeId = 4;

class MockDatabase {
  async query (sql, params = []) {
    console.log('Mock DB Query FULL:', sql);
    console.log('Mock DB Params:', params);
    
    // Handle user registration
    if (sql.includes('INSERT INTO users')) {
      const [email, hashedPassword, firstName, lastName] = params;

      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        const error = new Error('User with this email already exists');
        error.code = '23505'; // PostgreSQL unique violation code
        throw error;
      }

      const newUser = {
        id: nextUserId++,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: hashedPassword,
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      users.push(newUser);
      return { rows: [newUser] };
    }

    // Handle user login lookup (multiple patterns)
    if ((sql.includes('SELECT') && sql.includes('FROM users') && sql.includes('WHERE email')) && 
        params.length > 0 && typeof params[0] === 'string') {
      const [email] = params;
      const user = users.find(user => user.email === email);
      console.log('Found user for email', email, ':', user ? 'YES' : 'NO');
      return { rows: user ? [user] : [] };
    }

    // Handle user profile queries
    if (sql.includes('SELECT') && sql.includes('users') && sql.includes('WHERE id')) {
      const userId = params.find(p => typeof p === 'number' || !isNaN(parseInt(p))) || 1;
      let user = users.find(user => user.id === parseInt(userId));
      
      // Create a default user if none exists
      if (!user && users.length === 0) {
        user = {
          id: 1,
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo@skillwise.com',
          password_hash: 'hashed_password',
          is_active: true,
          is_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        users.push(user);
      }
      
      return { rows: user ? [user] : [] };
    }

    // Handle challenges queries
    if (sql.includes('SELECT') && sql.includes('challenges')) {
      // Return all challenges for demo with proper structure
      const enrichedChallenges = challenges.map(challenge => ({
        ...challenge,
        creator_first_name: null,
        creator_last_name: null,
        submission_count: Math.floor(Math.random() * 50),
        average_score: Math.floor(Math.random() * 40) + 60,
        is_active: true,
        difficulty_level: challenge.difficulty,
        points_reward: 10,
        max_attempts: 3,
        requires_peer_review: false,
        estimated_time_minutes: 30,
        instructions: challenge.description,
        prerequisites: [],
        learning_objectives: [],
        tags: challenge.tags || []
      }));
      return { rows: enrichedChallenges };
    }

    // Handle goals queries
    if (sql.includes('SELECT') && sql.includes('goals')) {
      // Return user's goals or create sample goals
      const userId = params.find(p => typeof p === 'number') || 1;
      let userGoals = goals.filter(goal => goal.user_id === userId);
      
      // Create sample goals if none exist
      if (userGoals.length === 0) {
        const sampleGoals = [
          {
            id: nextGoalId++,
            user_id: userId,
            title: 'Master JavaScript Algorithms',
            description: 'Complete 10 algorithm challenges to improve problem-solving skills',
            target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            is_completed: false,
            progress_percentage: 60,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: nextGoalId++,
            user_id: userId,
            title: 'Learn React Best Practices',
            description: 'Build 3 React components following modern patterns',
            target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            is_completed: false,
            progress_percentage: 25,
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
        goals.push(...sampleGoals);
        userGoals = sampleGoals;
      }
      
      return { rows: userGoals };
    }

    // Handle challenge creation
    if (sql.includes('INSERT INTO challenges')) {
      const newChallenge = {
        id: nextChallengeId++,
        title: params[0] || 'New Challenge',
        description: params[1] || 'Challenge description',
        category: params[2] || 'general',
        difficulty: params[3] || 'easy',
        tags: params[4] || [],
        created_by: params[5] || null,
        is_public: params[6] !== false,
        created_at: new Date(),
        updated_at: new Date()
      };
      challenges.push(newChallenge);
      return { rows: [newChallenge] };
    }

    // Handle goal creation
    if (sql.includes('INSERT INTO goals')) {
      const newGoal = {
        id: nextGoalId++,
        user_id: params[0] || 1,
        title: params[1] || 'New Goal',
        description: params[2] || 'Goal description',
        target_date: params[3] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      goals.push(newGoal);
      return { rows: [newGoal] };
    }

    // Handle AI feedback storage
    if (sql.includes('INSERT INTO ai_feedback')) {
      const newAIInteraction = {
        id: nextAIId++,
        user_id: params[0] || 1,
        submission_text: params[1] || '',
        ai_response: params[2] || '',
        challenge_context: params[3] || null,
        created_at: new Date()
      };
      aiInteractions.push(newAIInteraction);
      return { rows: [newAIInteraction] };
    }

    // Handle refresh token operations
    if (sql.includes('refresh_tokens')) {
      // Mock refresh token operations
      if (sql.includes('INSERT')) {
        return { rows: [{ id: 1 }] };
      }
      return { rows: [] };
    }

    // Handle progress queries
    if (sql.includes('progress') || sql.includes('activity') || sql.includes('stats')) {
      // Return mock progress data
      return { 
        rows: [{
          total_challenges: challenges.length,
          completed_challenges: Math.floor(challenges.length * 0.6),
          points_earned: 1250,
          current_streak: 7,
          rank: 'Advanced',
          activity_data: []
        }]
      };
    }

    // Handle leaderboard queries
    if (sql.includes('leaderboard') || (sql.includes('users') && sql.includes('ORDER BY'))) {
      // Return mock leaderboard data
      return {
        rows: [
          { user_id: 1, first_name: 'Demo', last_name: 'User', points: 1250, rank: 1 },
          { user_id: 2, first_name: 'Alice', last_name: 'Smith', points: 1100, rank: 2 },
          { user_id: 3, first_name: 'Bob', last_name: 'Johnson', points: 950, rank: 3 }
        ]
      };
    }

    // Handle AI conversation or session queries
    if (sql.includes('ai_sessions') || sql.includes('conversations')) {
      // Return empty for now - AI conversations are typically stored in memory
      return { rows: [] };
    }

    // Default empty response
    console.log('Mock DB: Unhandled query pattern. Current users:', users.length);
    console.log('Users list:', users.map(u => ({ id: u.id, email: u.email })));
    return { rows: [] };
  }

  async end () {
    // Mock cleanup
  }
}

module.exports = new MockDatabase();
