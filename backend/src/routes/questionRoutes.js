import express from 'express';
import { getQuestionsByTopic, submitTest } from '../controllers/questionController.js';

const router = express.Router();

// Ek particular topic ke saare questions fetch karne ke liye
// GET /api/questions/topic/:topicId
router.get('/topic/:topicId', getQuestionsByTopic);

// Test submit karke score paane ke liye
// POST /api/questions/submit/:topicId
router.post('/submit/:topicId', submitTest);

export default router;