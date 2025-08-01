// ==========================================================
// ##                                                      ##
// ##        FINAL DYNAMIC CODE FOR AI SERVICE (PROD)        ##
// ##                                                      ##
// ==========================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from "groq-sdk";

// Current file ka exact location pata karo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env file ka exact path - services folder se 2 level upar
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Groq client initialize karo
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * PDF se nikale gaye text se Groq API ka use karke questions generate karo.
 * @param {string} text - PDF se nikala gaya raw text
 * @param {number} count - Kitne questions generate karne hain
 * @returns {Promise<object>} - AI se generate hue questions ek JavaScript object ke roop mein
 */
export const generateQuestions = async (text, count = 10) => {
  try {
    // Question types ko count ke hisaab se distribute karo
    const totalCount = Math.max(1, Math.round(count)); // Ensure count is at least 1
    const mcqCount = Math.ceil(totalCount * 0.5); // 50% MCQs
    const shortCount = Math.floor(totalCount * 0.3); // 30% Short
    const longCount = totalCount - mcqCount - shortCount; // Baaki Long

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are an expert test paper generator. You must respond with a perfect, valid JSON object and nothing else. Do not add any text, comments, or markdown like \`\`\`json outside of the final JSON object. The JSON output must follow all rules provided by the user.`
            },
            {
                role: 'user',
                // Prompt ab user ke diye gaye count ke hisaab se dynamic ho gaya hai
                content: `Based on the text provided below, generate a JSON object.
                The JSON object must have two top-level keys: "topic" and "questions".
                - The "topic" key's value should be an object with a "title" and a short "description".
                - The "questions" key's value should be an array of question objects.
                
                Each question object must have these exact keys: "type", "questionText", "answer", and "explanation".
                - The "answer" and "explanation" fields are mandatory and MUST NOT be empty strings.

                RULES FOR 'options' KEY:
                - For "mcq" type questions, you MUST ALSO include an "options" key, which must be an array of exactly 4 unique string options.
                - For "short" and "long" question types, you MUST NOT include the "options" key at all.

                Generate a total of approximately ${totalCount} questions. Distribute the questions as follows:
                - ${mcqCount} questions of type "mcq".
                - ${shortCount} questions of type "short".
                - ${longCount > 0 ? longCount : 0} questions of type "long".
                
                Here is the text to analyze:
                """
                ${text}
                """
                `
            }
        ],
        model: 'llama3-8b-8192',
        response_format: { type: "json_object" }
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) { throw new Error("Groq API returned an empty response."); }
    
    return JSON.parse(aiResponse);
    
  } catch (error) {
    console.error("❌ Groq API Error:", error);
    throw new Error("Failed to generate questions using Groq API. Original error: " + error.message);
  }
};