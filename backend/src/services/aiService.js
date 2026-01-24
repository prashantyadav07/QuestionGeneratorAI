// File: backend/src/services/aiService.js

import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Standardizes the AI response to ensure it always has the expected structure.
 */
const sanitizeAIResponse = (data) => {
    if (!data) return null;

    // Ensure topic exists
    if (!data.topic) {
        data.topic = {
            title: "Generated Quiz",
            description: "A quiz generated from your provided content."
        };
    }

    // Ensure questions is an array
    if (!Array.isArray(data.questions)) {
        data.questions = [];
    }

    // Validate each question
    data.questions = data.questions.filter(q =>
        q.questionText &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.answer
    ).map(q => ({
        type: q.type || 'mcq',
        questionText: q.questionText,
        options: q.options.slice(0, 4), // Ensure max 4 options
        answer: q.answer,
        explanation: q.explanation || "No explanation provided."
    }));

    return data;
};

// --- FUNCTION 1: Generate questions from provided text ---
const generateFromContent = async (text, count) => {
    if (!process.env.GOOGLE_API_KEY) throw new Error("FATAL: GOOGLE_API_KEY is missing in production environment variables.");

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are a professional educational content creator. Based ON THE TEXT PROVIDED BELOW, generate a JSON object.
    
    TEXT: """${text.substring(0, 15000)}"""
    
    STRICT REQUIREMENTS:
    1. Generate EXACTLY ${count} Multiple Choice Questions (MCQs).
    2. The response MUST be a valid JSON object with the following schema:
    {
      "topic": {
        "title": "A concise title based on the text",
        "description": "A brief summary of what this quiz covers"
      },
      "questions": [
        {
          "type": "mcq",
          "questionText": "The actual question string",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The exact string from the options array that is correct",
          "explanation": "A short explanation of why this answer is correct"
        }
      ]
    }
    3. Ensure questions are challenging, accurate, and derived directly from the text.
    4. Respond ONLY with the raw JSON object. No markdown, no pre-text.
    `;

    try {
        console.log(`🧠 AI is generating ${count} questions from content (${text.length} chars)...`);
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            safetySettings
        });

        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);
        return sanitizeAIResponse(parsedData);
    } catch (error) {
        console.error("❌ Error in generateFromContent:", error.message);
        // Fallback for parsing errors or API failures
        return null;
    }
};

// --- FUNCTION 2: Generate questions from a topic name ---
export const generateFromTopic = async (topic, count) => {
    if (!process.env.GOOGLE_API_KEY) throw new Error("FATAL: GOOGLE_API_KEY is missing.");

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Generate a professional quiz about the topic: "${topic}".
    
    STRICT REQUIREMENTS:
    1. Generate EXACTLY ${count} Multiple Choice Questions (MCQs).
    2. The response MUST be a valid JSON object with the following schema:
    {
      "topic": {
        "title": "${topic}",
        "description": "Comprehensive quiz covering ${topic} fundamentals and key concepts."
      },
      "questions": [
        {
          "type": "mcq",
          "questionText": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "Correct option string",
          "explanation": "Explanation here"
        }
      ]
    }
    3. Respond ONLY with raw JSON.
    `;

    try {
        console.log(`✨ AI is generating ${count} questions for topic: "${topic}"`);
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            safetySettings
        });

        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);
        return sanitizeAIResponse(parsedData);
    } catch (error) {
        console.error("❌ Error in generateFromTopic:", error.message);
        return null;
    }
};

// --- BATCH FUNCTION (for handling large content) ---
export const generateQuestionsInBatches = async (textChunks, totalQuestions) => {
    const questionsPerChunk = Math.ceil(totalQuestions / textChunks.length);
    console.log(`🌀 Batch Processing: ${textChunks.length} chunks, aiming for ${questionsPerChunk} questions/chunk.`);

    const promises = textChunks.map(chunk => generateFromContent(chunk, questionsPerChunk));

    const settledResults = await Promise.allSettled(promises);

    const validResults = settledResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

    if (validResults.length === 0) return null;

    // Merge results
    const merged = {
        topic: validResults[0].topic,
        questions: validResults.flatMap(r => r.questions)
    };

    return merged;
};