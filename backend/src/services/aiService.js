// File: backend/src/services/aiService.js

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];


// --- FUNCTION 1: Diye gaye NOTES se questions banana ---
const generateFromContent = async (text, count) => {
    if (!process.env.GOOGLE_API_KEY) throw new Error("FATAL: GOOGLE_API_KEY is missing.");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prompt for when content is provided
    const prompt = `Based ON THE TEXT PROVIDED BELOW, generate a JSON object. The object must have "topic" (with title, description) and "questions" (an array of exactly ${count} MCQs). Each question needs: type, questionText, options (array of 4), answer, explanation. Respond ONLY with the raw JSON. Text: """${text.substring(0, 15000)}"""`;
    
    try {
        console.log(`🧠 Generating questions from CONTENT...`);
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } });
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("❌ Error in generateFromContent:", error.message);
        return null;
    }
};

// --- ✨ FUNCTION 2: Diye gaye TOPIC par questions banana (NAYA FEATURE) ---
export const generateFromTopic = async (topic, count) => {
    if (!process.env.GOOGLE_API_KEY) throw new Error("FATAL: GOOGLE_API_KEY is missing.");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prompt for when only a topic is provided
    const prompt = `You are an expert quiz generator. Generate a quiz about the following topic: "${topic}".
    The output must be a JSON object.
    This object must have a "topic" key (with a "title" and "description" about the quiz) and a "questions" key.
    The "questions" key must be an array of exactly ${count} high-quality Multiple Choice Questions (MCQs).
    Each question object must have these keys: "type" (value: "mcq"), "questionText", "options" (an array of 4 strings), "answer", and a brief "explanation".
    Respond ONLY with the raw JSON object.`;
    
    try {
        console.log(`✨ Generating questions from TOPIC: "${topic}"`);
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } });
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("❌ Error in generateFromTopic:", error.message);
        return null;
    }
};

// --- BATCH FUNCTION (for large content) ---
export const generateQuestionsInBatches = async (textChunks, totalQuestions) => {
    const questionsPerChunk = Math.ceil(totalQuestions / textChunks.length);
    console.log(`🌀 Batch Info: ${textChunks.length} chunks, aiming for ${questionsPerChunk} questions per chunk.`);
    
    const promises = textChunks.map(chunk => generateFromContent(chunk, questionsPerChunk));
    
    const settledResults = await Promise.allSettled(promises);
    return settledResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
};