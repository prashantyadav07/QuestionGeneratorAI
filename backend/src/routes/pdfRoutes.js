// File: backend/src/routes/pdfRoutes.js

import express from 'express';
// ✅ CONTROLLER SE DONO FUNCTIONS IMPORT KARNA ZAROORI HAI
import { handlePDFUpload, handleTextGeneration } from '../controllers/pdfController.js';
import upload from '../utils/multer.js';

const router = express.Router();

// --- ROUTE 1: PDF UPLOAD KE LIYE ---
// Iska poora path banega: POST /api/pdf/upload
router.post('/upload', upload.single('pdf'), handlePDFUpload);


// --- ✅ ROUTE 2: TEXT/TOPIC SE GENERATE KARNE KE LIYE (YEH LINE SHAYAD MISSING THI) ---
// Iska poora path banega: POST /api/pdf/generate-from-text
router.post('/generate-from-text', handleTextGeneration);


export default router;