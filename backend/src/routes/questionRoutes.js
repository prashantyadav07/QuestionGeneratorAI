// File: backend/src/routes/questionRoutes.js

import express from 'express';
import { getQuestionsByTopic, submitTest } from '../controllers/questionController.js';
import { validateAnswersArray } from '../middleware/validators.js';

const router = express.Router();

/**
 * GET /api/questions/topic/:topicId
 * Get all questions for a specific topic (without answers)
 * Params: topicId - MongoDB ObjectId of the topic
 */
router.get('/topic/:topicId', getQuestionsByTopic);

/**
 * POST /api/questions/submit/:topicId
 * Submit test answers and get score
 * Params: topicId - MongoDB ObjectId of the topic
 * Body: { answers: Array<{ questionId: string, userAnswer: string }> }
 */
router.post('/submit/:topicId', validateAnswersArray, submitTest);

export default router;