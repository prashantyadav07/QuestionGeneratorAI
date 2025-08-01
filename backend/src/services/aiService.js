// backend/src/services/aiService.js

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

export const generateQuestions = async (text, count = 10) => {
  try {
    const totalCount = Math.max(1, Math.round(count));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // === NAYI, BAHUT ZYADA STRICT PROMPT ===
    const prompt = `You are a highly precise JSON data generation machine. Your absolute primary directive is to follow the user's requested question count with perfect accuracy.

    From the text below, generate a JSON object.
    
    The JSON object must have two top-level keys: "topic" and "questions".
    - "topic" should be an object with a "title" and a short "description" based on the text.
    - "questions" must be an array of question objects.

    **IT IS A MANDATORY REQUIREMENT** that the "questions" array contains **EXACTLY ${totalCount}** "mcq" question objects. Do not generate more, do not generate less. Generating a different number is a failure.

    Every single question object must have these 5 keys: 
    1. "type": The value must be the string "mcq".
    2. "questionText": The question.
    3. "options": An array of exactly 4 unique string options.
    4. "answer": The correct answer, which must exactly match one of the strings from the "options" array.
    5. "explanation": A brief explanation for why the answer is correct.

    All fields are mandatory. Your entire response must be ONLY the raw JSON object, without any markdown formatting like \`\`\`json.

    Text to analyze:
    """
    ${text}
    """`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        },
        safetySettings,
    });
    
    const response = result.response;
    const aiResponseText = response.text();

    if (!aiResponseText) {
        throw new Error("Google Gemini API returned an empty response.");
    }
    
    return JSON.parse(aiResponseText);
    
  } catch (error) {
    console.error("❌ Google Gemini API Error:", error);
    throw new Error("Failed to generate questions using Google Gemini API. The model might be unable to comply with the request.");
  }
};