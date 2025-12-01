// AI routes for OpenAI integration
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const aiService = require('../services/aiService');
const feedbackService = require('../services/feedbackService');
const { PrismaClient } = (() => {
  try {
    return require('@prisma/client');
  } catch {
    return {};
  }
})();
const prisma = PrismaClient ? new PrismaClient() : null;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const auth = require('../middleware/auth');

// POST /api/ai/feedback - Generate AI feedback for a submission
// Body: { submissionText, challengeContext: { title, description, requirements } }
router.post('/feedback', auth, aiController.generateFeedback);

// POST /api/ai/hints/:challengeId - Get hints for a challenge
// Body: { challenge: { title, description, difficulty } }
// Query: ?attempts=0&lastAttempt=...
router.post('/hints/:challengeId', auth, aiController.getHints);

// POST /api/ai/suggestions - Get personalized challenge suggestions
// Body: { userProfile: { skillLevel, completedCount, interests, goals, etc. } }
router.post('/suggestions', auth, aiController.suggestChallenges);

// POST /api/ai/analysis - Analyze learning progress
// Body: { userId, learningData: { completedChallenges, successRate, etc. } }
router.post('/analysis', auth, aiController.analyzeProgress);

module.exports = router;

// --- POST /ai/submitForFeedback ---
router.post('/submitForFeedback', upload.single('file'), async (req, res) => {
	try {
		const { title, description, language } = req.body;
		if (!title || !description) {
			return res.status(400).json({ message: 'Title and description are required.' });
		}

		// Save file if uploaded
		let filePath = null;
		if (req.file) {
			filePath = feedbackService.saveUploadedFile(req.file);
		}

		// Save submission to DB
		const submission = await feedbackService.prisma.submissions.create({
			data: {
				userId: req.user?.id || null, // If using auth middleware
				title,
				description,
				language: language || null,
				filePath,
				createdAt: new Date(),
			},
		});

		// Build feedback prompt
		const prompt = feedbackService.buildFeedbackPrompt({ title, description, language });
		let aiRaw = null;
		let aiParsed = null;
		try {
			aiRaw = await aiService.generateChallenge(prompt); // Reuse OpenAI call, or add generateFeedback
			aiParsed = feedbackService.parseFeedbackResponse(aiRaw);
			if (!aiParsed) throw new Error('AI response could not be parsed');
		} catch (err) {
			// Save feedback with error
			const feedback = await feedbackService.prisma.feedback.create({
				data: {
					submissionId: submission.id,
					raw: aiRaw || '',
					parsed: null,
					error: err.message,
					createdAt: new Date(),
				},
			});
			return res.status(500).json({ submissionId: submission.id, feedbackId: feedback.id, error: err.message });
		}

		// Save feedback to DB
		const feedback = await feedbackService.prisma.feedback.create({
			data: {
				submissionId: submission.id,
				raw: aiRaw,
				parsed: JSON.stringify(aiParsed),
				error: null,
				createdAt: new Date(),
			},
		});

		return res.status(200).json({
			submissionId: submission.id,
			feedbackId: feedback.id,
			ai: {
				score: aiParsed.score,
				summary: aiParsed.summary,
				strengths: aiParsed.strengths,
				improvements: aiParsed.improvements,
				suggestedResources: aiParsed.suggestedResources,
			},
		});
	} catch (err) {
		console.error('submitForFeedback error:', err);
		return res.status(500).json({ message: 'Failed to submit for feedback.' });
	}
});

// --- POST /ai/generateChallenge ---
router.post('/generateChallenge', async (req, res) => {
	const { topic = 'arrays', difficulty = 'medium' } = req.body || {};
	const validDifficulties = ['easy', 'medium', 'hard'];
	const safeDifficulty = validDifficulties.includes((difficulty || '').toLowerCase()) ? difficulty.toLowerCase() : 'medium';

	// Prompt template (see story 3.3)
	const prompt = `Generate a programming challenge for students.\nTopic: ${topic}.\nDifficulty: ${safeDifficulty}.\nRespond in JSON with fields: title, description, difficulty, hints (array of 1-3 hints).`;

	let aiRawResponse = null;
	let aiParsed = null;
	try {
		aiRawResponse = await aiService.generateChallenge(prompt);
		aiParsed = aiService.parseChallengeResponse(aiRawResponse);
		if (!aiParsed) throw new Error('AI response could not be parsed');
	} catch (err) {
		// Log error
		console.error('OpenAI error:', err);
		// Log to DB if possible
		try {
			if (prisma && prisma.aiLogs?.create) {
				await prisma.aiLogs.create({
					data: {
						prompt,
						response: typeof aiRawResponse === 'string' ? aiRawResponse : JSON.stringify(aiRawResponse),
						error: err.message,
					},
				});
			} else {
				console.log('[AI_LOG]', { prompt, response: aiRawResponse, error: err.message });
			}
		} catch (e) {
			// Table may not exist yet
			console.warn('aiLogs table missing or DB error:', e.message);
		}
		return res.status(500).json({ message: 'Failed to generate challenge. Please try again.' });
	}

	// Log prompt/response
	try {
		if (prisma && prisma.aiLogs?.create) {
			await prisma.aiLogs.create({
				data: {
					prompt,
					response: typeof aiRawResponse === 'string' ? aiRawResponse : JSON.stringify(aiRawResponse),
				},
			});
		} else {
			console.log('[AI_LOG]', { prompt, response: aiRawResponse });
		}
	} catch (e) {
		// Table may not exist yet
		console.warn('aiLogs table missing or DB error:', e.message);
	}

	return res.status(200).json(aiParsed);
});
