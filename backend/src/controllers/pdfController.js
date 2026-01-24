// Enhanced debug version of your controller

import { extractTextFromPDF } from '../services/pdfParser.js';
import { generateQuestionsInBatches } from '../services/aiService.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import { splitTextIntoChunks } from '../utils/textChunker.js';

// --- PDF UPLOAD HANDLER (WITH DETAILED LOGGING) ---
export const handlePDFUpload = async (req, res) => {
  console.log("\n--- [START] PDF UPLOAD REQUEST ---");
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("Request file:", req.file ? 'File present' : 'No file');
  
  try {
    // Step 1: Validate file upload
    if (!req.file) {
      console.error("❌ Step 1 FAILED: No file in request.");
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file uploaded. Please select a PDF file.' 
      });
    }
    
    if (req.file.mimetype !== 'application/pdf') {
      console.error("❌ Step 1 FAILED: Invalid file type:", req.file.mimetype);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file type. Please upload a PDF file.' 
      });
    }
    
    console.log(`✅ Step 1: File received: ${req.file.originalname} (${req.file.size} bytes)`);

    const requestedCount = parseInt(req.body.questionCount) || 10;
    console.log(`📝 Requested question count: ${requestedCount}`);
    
    // Step 2: Extract text from PDF
    console.log("⏳ Step 2: Extracting text from PDF...");
    let extractedText;
    
    try {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } catch (pdfError) {
      console.error("❌ Step 2 FAILED: PDF extraction error:", pdfError.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to extract text from PDF. The file might be corrupted or password-protected.' 
      });
    }
    
    if (!extractedText || extractedText.trim() === '') {
      console.error("❌ Step 2 FAILED: No text could be extracted from the PDF.");
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract any readable text from the PDF. The PDF might be image-based or empty.' 
      });
    }
    
    console.log(`✅ Step 2: Text extracted successfully (${extractedText.length} characters).`);

    // Step 3: Process the extracted text
    const mockReq = { 
      body: { 
        text: extractedText, 
        questionCount: requestedCount 
      } 
    };
    
    return await handleTextGeneration(mockReq, res);

  } catch (error) {
    console.error("❌ CRITICAL ERROR in handlePDFUpload:", error);
    console.error("Error stack:", error.stack);
    console.log("--- [FAILED] REQUEST ENDED WITH ERROR ---");
    
    return res.status(500).json({ 
      success: false, 
      message: 'An internal server error occurred while processing the PDF.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// --- TEXT GENERATION HANDLER (ENHANCED WITH MORE DEBUG) ---
export const handleTextGeneration = async (req, res) => {
  console.log("\n🚀 [START] TEXT GENERATION REQUEST");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  const { text, questionCount } = req.body;
  
  try {
    // Step 1: Validate input
    console.log("⏳ Step 1: Validating input...");
    if (!text || text.trim() === '') {
      console.error("❌ Step 1 FAILED: No text provided");
      return res.status(400).json({ 
        success: false, 
        message: 'No text content provided for question generation.' 
      });
    }

    const requestedCount = parseInt(questionCount) || 10;
    console.log(`✅ Step 1: Input valid. Processing ${requestedCount} questions for ${text.length} characters of text`);

    // Step 2: Check if required services are available
    console.log("⏳ Step 2: Checking service availability...");
    try {
      console.log("🔍 Checking splitTextIntoChunks function...");
      if (typeof splitTextIntoChunks !== 'function') {
        throw new Error("splitTextIntoChunks is not a function");
      }
      
      console.log("🔍 Checking generateQuestionsInBatches function...");
      if (typeof generateQuestionsInBatches !== 'function') {
        throw new Error("generateQuestionsInBatches is not a function");
      }
      
      console.log("🔍 Checking Topic model...");
      if (!Topic) {
        throw new Error("Topic model is not available");
      }
      
      console.log("🔍 Checking Question model...");
      if (!Question) {
        throw new Error("Question model is not available");
      }
      
      console.log("✅ Step 2: All services are available");
    } catch (serviceError) {
      console.error("❌ Step 2 FAILED: Service check error:", serviceError.message);
      return res.status(500).json({ 
        success: false, 
        message: `Service dependency error: ${serviceError.message}` 
      });
    }

    // Step 3: Split text into chunks
    console.log("⏳ Step 3: Splitting text into chunks...");
    let textChunks;
    
    try {
      textChunks = splitTextIntoChunks(text, 15000);
    } catch (chunkError) {
      console.error("❌ Step 3 WARNING: Text chunking error:", chunkError.message);
      console.log("🔄 Step 3: Using fallback chunking method...");
      // Fallback: create single chunk
      textChunks = [text.substring(0, 15000)];
    }
    
    console.log(`✅ Step 3: Text split into ${textChunks.length} chunk(s).`);
    console.log(`📊 Chunk sizes: ${textChunks.map(chunk => chunk.length).join(', ')} characters`);

    // Step 4: Generate questions using AI
    console.log("⏳ Step 4: Calling AI service to generate questions...");
    let results;
    
    try {
      results = await generateQuestionsInBatches(textChunks, requestedCount);
      console.log("📤 AI service response type:", typeof results);
      console.log("📤 AI service response:", JSON.stringify(results, null, 2));
    } catch (aiError) {
      console.error("❌ Step 4 FAILED: AI service error:", aiError.message);
      console.error("AI Error stack:", aiError.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'AI service failed to generate questions. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? aiError.message : undefined
      });
    }
    
    console.log("✅ Step 4: AI service returned a result.");

    // Step 5: Process AI results
    console.log("⏳ Step 5: Processing AI results...");
    let combinedQuestions = [];
    
    if (!results) {
      console.error("❌ Step 5 FAILED: AI returned null/undefined results");
      return res.status(500).json({ 
        success: false, 
        message: "AI service returned no data." 
      });
    }
    
    if (Array.isArray(results)) {
      console.log(`📋 Processing ${results.length} result batches...`);
      results.forEach((result, index) => {
        console.log(`📋 Batch ${index + 1}:`, result);
        if (result && result.questions && Array.isArray(result.questions)) {
          console.log(`✅ Batch ${index + 1}: Found ${result.questions.length} questions`);
          combinedQuestions.push(...result.questions);
        } else {
          console.log(`⚠️  Batch ${index + 1}: No valid questions array found`);
        }
      });
    } else {
      console.log("📋 Single result object received:", results);
      if (results.questions && Array.isArray(results.questions)) {
        combinedQuestions = results.questions;
      }
    }

    if (combinedQuestions.length === 0) {
      console.error("❌ Step 5 FAILED: No valid questions extracted from AI response.");
      return res.status(500).json({ 
        success: false, 
        message: "AI failed to generate any questions from the provided content. The content might be too short or unclear." 
      });
    }
    
    console.log(`✅ Step 5: Successfully extracted ${combinedQuestions.length} questions from AI response.`);
    
    // Limit to requested count
    const validQuestions = combinedQuestions.slice(0, requestedCount);
    console.log(`📝 Final question count: ${validQuestions.length} (requested: ${requestedCount})`);
    
    // Step 6: Save to database
    console.log("⏳ Step 6: Saving data to database...");
    
    try {
      // Create topic
      console.log("⏳ Step 6a: Creating topic...");
      const firstTopicData = results.find && results.find(r => r && r.topic)?.topic || 
                           (results.topic ? results.topic : null) ||
                           { 
                             title: 'Generated Quiz', 
                             description: 'Quiz generated from your content' 
                           };
      
      console.log("📝 Topic data:", firstTopicData);
      const newTopic = new Topic(firstTopicData);
      await newTopic.save();
      console.log(`✅ Step 6a: Topic saved with ID: ${newTopic._id}`);
      
      // Create questions
      console.log("⏳ Step 6b: Creating questions...");
      const questionsToSave = validQuestions.map(q => ({ 
        ...q, 
        topic: newTopic._id 
      }));
      
      console.log(`📝 Questions to save: ${questionsToSave.length}`);
      console.log("📝 First question sample:", questionsToSave[0]);
      
      const savedQuestions = await Question.insertMany(questionsToSave);
      
      console.log(`✅ Step 6b: Saved ${savedQuestions.length} questions to database.`);
      console.log("🎉 --- [SUCCESS] REQUEST COMPLETE ---");

      return res.status(201).json({
        success: true,
        message: `Quiz created successfully! Generated ${savedQuestions.length} questions.`,
        data: { 
          topic: newTopic, 
          questions: savedQuestions 
        },
      });

    } catch (dbError) {
      console.error("❌ Step 6 FAILED: Database error:", dbError.message);
      console.error("Database error stack:", dbError.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save quiz to database. Please try again.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

  } catch (error) {
    console.error("❌ CRITICAL ERROR in handleTextGeneration:", error);
    console.error("Error stack:", error.stack);
    console.log("💥 --- [FAILED] REQUEST ENDED WITH ERROR ---");
    
    return res.status(500).json({ 
      success: false, 
      message: 'An internal server error occurred during text processing.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};