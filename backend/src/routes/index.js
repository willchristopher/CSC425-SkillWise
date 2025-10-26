/**
 * API Routes Index
 * Mounts all API endpoints under /api/* following RESTful conventions
 * 
 * Route Structure:
 * - /api/auth/*          - Authentication (login, register, logout, refresh)
 * - /api/users/*         - User management (profile, settings, statistics)
 * - /api/goals/*         - Learning goals CRUD and progress tracking
 * - /api/challenges/*    - Challenge management and submissions
 * - /api/progress/*      - Progress tracking and analytics
 * - /api/submissions/*   - Work submissions and evaluations
 * - /api/ai/*           - AI feedback and assistance
 * - /api/reviews/*       - Peer review system
 * - /api/leaderboard/*   - Rankings and achievements
 */

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const goalRoutes = require('./goals');
const challengeRoutes = require('./challenges');
const progressRoutes = require('./progress');
const submissionRoutes = require('./submissions');
const aiRoutes = require('./ai');
const reviewRoutes = require('./reviews');
const leaderboardRoutes = require('./leaderboard');

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'SkillWise API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'AI-powered learning platform API',
    endpoints: {
      auth: '/auth - Authentication and authorization',
      users: '/users - User management and profiles',
      goals: '/goals - Learning goals and tracking',
      challenges: '/challenges - Learning challenges',
      progress: '/progress - Progress analytics',
      submissions: '/submissions - Work submissions',
      ai: '/ai - AI assistance and feedback',
      reviews: '/reviews - Peer review system',
      leaderboard: '/leaderboard - Rankings'
    },
    docs: 'https://github.com/willchristopher/CSC425-SkillWise/blob/main/docs/api/API_ENDPOINTS.md',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/goals', goalRoutes);
router.use('/challenges', challengeRoutes);
router.use('/progress', progressRoutes);
router.use('/submissions', submissionRoutes);
router.use('/ai', aiRoutes);
router.use('/reviews', reviewRoutes);
router.use('/leaderboard', leaderboardRoutes);

// API Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SkillWise API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    routes: {
      total: router.stack.length,
      mounted: [
        'auth', 'users', 'goals', 'challenges', 
        'progress', 'submissions', 'ai', 'reviews', 'leaderboard'
      ]
    }
  });
});

module.exports = router;