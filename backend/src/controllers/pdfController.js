// Enhanced PDF and Text Generation Controller

import { extractTextFromPDF } from '../services/pdfParser.js';
import { generateQuestionsInBatches } from '../services/aiService.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import { splitTextIntoChunks } from '../utils/textChunker.js';
import {
  successResponse,
  errorResponse,
  getHttpStatus,
  getErrorDetails,
  ErrorTypes
} from '../utils/apiResponseHelper.js';

/**
 * Validates request and extracts PDF text, then generates questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handlePDFUpload = async (req, res) => {
  console.log(`\n🚀 [${new Date().toISOString()}] PDF UPLOAD REQUEST`);

  try {
    // Validate file presence and type
    if (!req.file) {
      console.error("❌ No file in request");
      const error = errorResponse(
        ErrorTypes.FILE_ERROR,
        'No PDF file uploaded.',
        null,
        ['Select a PDF file and try again']
      );
      return res.status(400).json(error);
    }

    if (req.file.mimetype !== 'application/pdf') {
      console.error(`❌ Invalid file type: ${req.file.mimetype}`);
      const error = errorResponse(
        ErrorTypes.FILE_ERROR,
        'Invalid file type. Only PDF files are supported.',
        null,
        ['Upload a PDF file', 'Convert your file to PDF format']
      );
      return res.status(400).json(error);
    }

    console.log(`✅ File received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse question count
    const questionCount = parseInt(req.body.questionCount) || 10;
    if (questionCount < 1 || questionCount > 50) {
      const error = errorResponse(
        ErrorTypes.INVALID_INPUT,
        'Question count must be between 1 and 50.',
        null,
        ['Choose a number between 1 and 50']
      );
      return res.status(400).json(error);
    }

    // Extract text from PDF
    console.log("⏳ Extracting text from PDF...");
    let extractedText;

    try {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } catch (error) {
      console.error(`❌ PDF extraction failed: ${error.message}`);
      const errorResp = errorResponse(
        ErrorTypes.FILE_ERROR,
        'Failed to extract text from PDF.',
        error.message,
        [
          'Ensure the PDF is not password-protected',
          'Try a text-based PDF (not scanned images)',
          'Try a different PDF file'
        ]
      );
      return res.status(400).json(errorResp);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      const error = errorResponse(
        ErrorTypes.FILE_ERROR,
        'No readable text found in PDF.',
        null,
        [
          'Try a text-based PDF (not scanned images)',
          'Check if the PDF contains actual text',
          'Try using OCR for scanned PDFs'
        ]
      );
      return res.status(400).json(error);
    }

    console.log(`✅ Extracted ${extractedText.length} characters from PDF`);

    // Process extracted text
    const mockReq = {
      body: {
        text: extractedText,
        questionCount: questionCount
      }
    };

    return await handleTextGeneration(mockReq, res);

  } catch (error) {
    console.error("❌ CRITICAL ERROR in handlePDFUpload:", error.message);
    const errorResp = errorResponse(
      ErrorTypes.API_ERROR,
      'An internal error occurred while processing the PDF.',
      error.message,
      ['Try again', 'Contact support if the issue persists']
    );
    return res.status(500).json(errorResp);
  }
};

/**
 * Generates questions from text or PDF content
 * @param {Object} req - Express request with text and questionCount
 * @param {Object} res - Express response object
 */
export const handleTextGeneration = async (req, res) => {
  console.log(`\n🚀 [${new Date().toISOString()}] TEXT GENERATION REQUEST`);

  const { text, questionCount } = req.body;

  try {
    // Validate input text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      const error = errorResponse(
        ErrorTypes.INVALID_INPUT,
        'No text content provided.',
        null,
        ['Provide text content', 'Upload a PDF file instead']
      );
      return res.status(400).json(error);
    }


    const requestedCount = Math.min(parseInt(questionCount) || 10, 50);
    if (requestedCount < 1) {
      const error = errorResponse(
        ErrorTypes.INVALID_INPUT,
        'Question count must be at least 1.',
        null,
        ['Choose a number between 1 and 50']
      );
      return res.status(400).json(error);
    }

    console.log(`✅ Input valid. Generating ${requestedCount} questions from ${text.length} characters`);

    // Split text into chunks for processing
    console.log("⏳ Splitting text into chunks...");
    let textChunks;

    try {
      textChunks = splitTextIntoChunks(text, 4000, 200);
    } catch (error) {
      console.error(`⚠️ Chunking error: ${error.message}`);
      // Fallback: use single chunk
      textChunks = [text.substring(0, 15000)];
    }

    if (!textChunks || textChunks.length === 0) {
      const error = errorResponse(
        ErrorTypes.INVALID_INPUT,
        'Failed to process text. Text may be too short.',
        null,
        ['Provide more text content']
      );
      return res.status(400).json(error);
    }

    console.log(`✅ Split into ${textChunks.length} chunk(s)`);

    // Generate questions using AI service
    console.log("⏳ Calling AI service to generate questions...");

    let results;
    const generationStartTime = Date.now();

    try {
      results = await generateQuestionsInBatches(textChunks, requestedCount);

      if (!results || !results.questions || results.questions.length === 0) {
        throw new Error('AI service failed to generate any questions.');
      }
    } catch (error) {
      console.error(`❌ AI service error: ${error.message}`);

      // Use error type from AI service if available
      const errorType = error.type || ErrorTypes.API_ERROR;
      const details = getErrorDetails(errorType, error.message);

      const errorResp = errorResponse(
        errorType,
        details.message,
        error.message,
        details.suggestions
      );

      return res.status(getHttpStatus(errorType)).json(errorResp);
    }

    const generationDuration = Date.now() - generationStartTime;
    console.log(`✅ Generated ${results.questions.length} questions in ${generationDuration}ms`);

    // Save to database
    console.log("⏳ Saving to database...");

    try {
      // Create topic
      const topicData = {
        title: results.topic?.title || 'Generated Quiz',
        description: results.topic?.description || 'Auto-generated quiz from content'
      };

      const newTopic = new Topic(topicData);
      await newTopic.save();
      console.log(`✅ Saved topic: ${newTopic._id}`);

      // Create questions with topic reference
      const questionsToSave = results.questions.slice(0, requestedCount).map(q => ({
        type: q.type || 'mcq',
        questionText: q.questionText,
        options: q.options || [],
        answer: q.answer,
        explanation: q.explanation,
        topic: newTopic._id
      }));

      const savedQuestions = await Question.insertMany(questionsToSave);
      console.log(`✅ Saved ${savedQuestions.length} questions`);

      const response = successResponse(
        {
          topicId: newTopic._id,
          topicTitle: newTopic.title,
          questionCount: savedQuestions.length,
          totalQuestions: savedQuestions.length
        },
        `Quiz created successfully with ${savedQuestions.length} questions.`,
        {
          generationTimeMs: generationDuration,
          chunksProcessed: textChunks.length
        }
      );

      return res.status(201).json(response);

    } catch (dbError) {
      console.error(`❌ Database error: ${dbError.message}`);
      const errorResp = errorResponse(
        ErrorTypes.DATABASE_ERROR,
        'Failed to save quiz to database.',
        dbError.message,
        ['Try again', 'Contact support if the issue persists']
      );
      return res.status(500).json(errorResp);
    }

  } catch (error) {
    console.error("❌ CRITICAL ERROR in handleTextGeneration:", error.message);
    const errorResp = errorResponse(
      ErrorTypes.API_ERROR,
      'An internal error occurred.',
      error.message,
      ['Try again', 'Contact support if the issue persists']
    );
    return res.status(500).json(errorResp);
  }
};