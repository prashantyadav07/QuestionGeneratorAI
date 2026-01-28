// File: backend/src/routes/pdfRoutes.js

import express from 'express';
import { handlePDFUpload, handleTextGeneration } from '../controllers/pdfController.js';
import upload from '../utils/multer.js';
import { validateQuestionCount, validateTextContent } from '../middleware/validators.js';

const router = express.Router();

/**
 * POST /api/pdf/upload
 * Upload a PDF file and generate questions from its content
 * Body: { pdf: File, questionCount?: number }
 */
router.post('/upload', upload.single('pdf'), validateQuestionCount, handlePDFUpload);

/**
 * POST /api/pdf/generate-from-text
 * Generate questions from provided text
 * Body: { text: string, questionCount?: number }
 */
router.post('/generate-from-text', validateTextContent, validateQuestionCount, handleTextGeneration);

export default router;