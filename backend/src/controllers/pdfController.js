// ==========================================================
// ##                                                      ##
// ##      FINAL DYNAMIC CODE FOR PDF CONTROLLER (PROD)      ##
// ##                                                      ##
// ==========================================================

import { extractTextFromPDF } from '../services/pdfParser.js';
import { generateQuestions } from '../services/aiService.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import { splitTextIntoChunks } from '../utils/textChunker.js';

export const handlePDFUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
  }

  try {
    // User se question count lo, agar nahi diya toh default 10 le lo
    const requestedCount = parseInt(req.body.questionCount) || 10;

    const pdfBuffer = req.file.buffer;
    const extractedText = await extractTextFromPDF(pdfBuffer);
    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF.' });
    }

    const textChunks = splitTextIntoChunks(extractedText, 4000);
    const countPerChunk = requestedCount / textChunks.length;

    // Har chunk ke liye user ka bataya hua count bhejo
    const generationResults = await Promise.allSettled(
      textChunks.map(chunk => generateQuestions(chunk, countPerChunk))
    );

    let combinedQuestions = [];
    let successfulChunks = 0;

    generationResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value && result.value.questions) {
            combinedQuestions = combinedQuestions.concat(result.value.questions);
            successfulChunks++;
        } else if (result.status === 'rejected') {
            console.warn("A chunk failed to generate questions:", result.reason?.message || 'Unknown reason');
        }
    });

    if (successfulChunks === 0) {
        throw new Error("Failed to generate questions from any part of the document.");
    }

    // FINAL SAFETY FILTER: Sirf valid questions ko hi rakho
    const validQuestions = combinedQuestions.filter(q => {
        const hasAnswer = q && q.answer && typeof q.answer === 'string' && q.answer.trim() !== '';
        if (q.type === 'mcq') {
            return hasAnswer && Array.isArray(q.options) && q.options.length > 0;
        }
        return hasAnswer;
    });

    const firstSuccessfulResult = generationResults.find(r => r.status === 'fulfilled')?.value;
    const mainTopicInfo = firstSuccessfulResult?.topic || { title: 'Generated Test', description: 'Questions from PDF' };
    
    const newTopic = new Topic({
      title: mainTopicInfo.title,
      description: mainTopicInfo.description,
    });
    const savedTopic = await newTopic.save();
    const topicId = savedTopic._id;
    
    const questionsToSave = validQuestions.map(q => ({
      type: q.type,
      questionText: q.questionText,
      options: q.options || [],
      answer: q.answer,
      explanation: q.explanation || 'No explanation was provided.',
      topic: topicId,
    }));

    if (questionsToSave.length === 0) {
      return res.status(500).json({ 
          success: false, 
          message: 'The AI generated some questions, but none of them were valid (missing answer or options for MCQs).' 
      });
    }

    const savedQuestions = await Question.insertMany(questionsToSave);

    res.status(201).json({
      success: true,
      message: `Test created successfully! Saved ${savedQuestions.length} valid questions.`,
      data: {
        topic: savedTopic,
        questions: savedQuestions,
      },
    });
    
  } catch (error) {
    console.error("Critical PDF Upload & Processing Error:", error);
    res.status(500).json({
      success: false,
      message: 'A critical error occurred while processing your request.',
      error: error.message
    });
  }
};