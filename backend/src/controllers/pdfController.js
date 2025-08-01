// backend/src/controllers/pdfController.js

import { extractTextFromPDF } from '../services/pdfParser.js';
import { generateQuestions } from '../services/aiService.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
// Nayi utility import karo
import { splitTextIntoChunks } from '../utils/textChunker.js';

export const handlePDFUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
  }

  try {
    const requestedCount = parseInt(req.body.questionCount) || 10;
    const pdfBuffer = req.file.buffer;
    const extractedText = await extractTextFromPDF(pdfBuffer);
    
    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF.' });
    }

    // PDF text ko chhote chunks mein todo
    const textChunks = splitTextIntoChunks(extractedText, 4000);
    
    // Har chunk se kitne questions generate karne hain
    const countPerChunk = Math.ceil(requestedCount / textChunks.length);

    // Promise.allSettled se saare chunks ke liye parallel requests bhejo
    const generationPromises = textChunks.map(chunk => 
      generateQuestions(chunk, countPerChunk)
    );
    const results = await Promise.allSettled(generationPromises);

    let combinedQuestions = [];
    let successfulChunks = 0;

    // Saare successful results ke questions ko combine karo
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.questions) {
            combinedQuestions = combinedQuestions.concat(result.value.questions);
            successfulChunks++;
        } else if (result.status === 'rejected') {
            // Agar koi chunk fail hota hai, to hum console mein warning denge, lekin crash nahi honge
            console.warn("A chunk failed to generate questions:", result.reason?.message || 'Unknown reason');
        }
    });

    if (successfulChunks === 0) {
        throw new Error("Failed to generate questions from any part of the document. The PDF might be unsuitable.");
    }

    // FINAL SAFETY FILTER: Sirf valid questions ko hi rakho
    const validQuestions = combinedQuestions.filter(q => 
        q && q.type === 'mcq' && q.questionText && q.answer && Array.isArray(q.options) && q.options.length > 0
    );

    // Kisi bhi ek successful result se topic info le lo
    const firstSuccessfulResult = results.find(r => r.status === 'fulfilled')?.value;
    const mainTopicInfo = firstSuccessfulResult?.topic || { title: 'Generated Test', description: 'Questions from PDF' };
    
    const newTopic = new Topic({
      title: mainTopicInfo.title,
      description: mainTopicInfo.description,
    });
    const savedTopic = await newTopic.save();
    
    const questionsToSave = validQuestions.map(q => ({
      ...q,
      topic: savedTopic._id,
    }));

    if (questionsToSave.length === 0) {
      return res.status(500).json({ 
          success: false, 
          message: 'AI could not generate any valid questions from the provided document.' 
      });
    }

    const savedQuestions = await Question.insertMany(questionsToSave);

    res.status(201).json({
      success: true,
      message: `Test created! AI generated ${savedQuestions.length} valid questions.`,
      data: {
        topic: savedTopic,
        questions: savedQuestions,
      },
    });
    
  } catch (error) {
    console.error("Critical PDF Processing Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'A critical error occurred while processing your request.',
    });
  }
};