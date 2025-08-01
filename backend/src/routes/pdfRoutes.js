// src/routes/pdfRoutes.js
import express from 'express';
// Corrected Import: handlePDFUpload ko curly braces {} ke andar rakha hai
import { handlePDFUpload } from '../controllers/pdfController.js';
import upload from '../utils/multer.js';

const router = express.Router();

// POST /api/pdf/upload
router.post('/upload', upload.single('pdf'), handlePDFUpload);

export default router;