// File: backend/src/services/aiService.js

import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

// Initialize Groq client
let groq = null;
let initializationError = null;

const initializeGroq = () => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is missing from .env file. Please add your API key.');
        }
        if (apiKey === 'your_groq_api_key_here' || apiKey.includes('placeholder')) {
            throw new Error('GROQ_API_KEY is still a placeholder. Get your real API key from https://console.groq.com/keys');
        }
        groq = new Groq({ 
            apiKey: apiKey,
            baseURL: 'https://api.groq.com/openai/v1'
        });
        console.log('✅ Groq API client initialized successfully');
        return groq;
    } catch (error) {
        initializationError = error;
        console.error('❌ Failed to initialize Groq API:');
        console.error('   ' + error.message);
        return null;
    }
};

// Initialize on module load
initializeGroq();

/**
 * Extracts JSON from API response that may be wrapped in markdown code blocks
 * @param {string} responseText - Raw API response text
 * @returns {string} - Cleaned JSON string
 */
const extractJSON = (responseText) => {
    if (!responseText || typeof responseText !== 'string') {
        throw new Error('Invalid response text received');
    }

    let text = responseText.trim();
    
    // Try to find JSON wrapped in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        text = jsonMatch[1].trim();
    }
    
    // Try to find JSON object
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        text = objectMatch[0];
    }
    
    // Validate it's valid JSON before returning
    try {
        JSON.parse(text);
        return text;
    } catch {
        throw new Error('Could not extract valid JSON from response');
    }
};

/**
 * Validates and sanitizes AI response to ensure correct structure
 * @param {Object} data - Parsed AI response
 * @returns {Object|null} - Sanitized response or null if invalid
 */
const sanitizeAIResponse = (data) => {
    if (!data || typeof data !== 'object') {
        console.warn('⚠️ Invalid data object for sanitization');
        return null;
    }

    // Ensure topic exists and is valid
    if (!data.topic || typeof data.topic !== 'object') {
        data.topic = {
            title: "Generated Quiz",
            description: "A quiz generated from your provided content."
        };
    }

    // Ensure title is a string
    if (typeof data.topic.title !== 'string') {
        data.topic.title = "Generated Quiz";
    }

    // Ensure description is a string
    if (typeof data.topic.description !== 'string') {
        data.topic.description = data.topic.title + " - Auto-generated quiz";
    }

    // Ensure questions is an array
    if (!Array.isArray(data.questions)) {
        console.warn('⚠️ Questions is not an array');
        data.questions = [];
    }

    // Validate and transform each question
    data.questions = data.questions
        .filter(q => {
            // Validate required fields
            if (!q || typeof q !== 'object') return false;
            if (typeof q.questionText !== 'string' || !q.questionText.trim()) return false;
            if (!Array.isArray(q.options) || q.options.length < 2) return false;
            if (typeof q.answer !== 'string' || !q.answer.trim()) return false;
            
            // Verify answer is one of the options
            if (!q.options.includes(q.answer)) {
                console.warn(`⚠️ Answer "${q.answer}" not in options for: ${q.questionText.substring(0, 50)}`);
                return false;
            }
            
            return true;
        })
        .map(q => ({
            type: q.type && ['mcq', 'short', 'long'].includes(q.type) ? q.type : 'mcq',
            questionText: q.questionText.trim(),
            options: q.options.slice(0, 4).map(opt => String(opt).trim()), // Ensure max 4 options
            answer: q.answer.trim(),
            explanation: q.explanation && typeof q.explanation === 'string' 
                ? q.explanation.trim() 
                : "No explanation provided."
        }));

    return data;
};

/**
 * Retries a failed API call with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Initial delay in ms
 * @returns {Promise<any>} - Result of function
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

/**
 * Generates questions from provided text content
 * @param {string} text - Text content to generate questions from
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Object|null>} - Generated questions or null on failure
 */
const generateFromContent = async (text, count) => {
    // Check if Groq is initialized
    if (!groq) {
        const errorMsg = initializationError 
            ? `Groq API not initialized: ${initializationError.message}`
            : 'Groq API client is not available. Check your GROQ_API_KEY in .env file.';
        throw new Error(errorMsg);
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
        throw new Error("Text content is empty or invalid");
    }

    // Limit text length to prevent API issues
    const textContent = text.substring(0, 15000).trim();
    if (!textContent) {
        throw new Error("Text is too short or empty");
    }

    const prompt = `You are a professional educational content creator. Generate a JSON object based on the text.

TEXT: """${textContent}"""

REQUIREMENTS:
1. Generate EXACTLY ${count} Multiple Choice Questions (MCQs).
2. Response MUST be valid JSON matching this schema:
{
  "topic": {
    "title": "Concise title based on text",
    "description": "Brief summary of quiz content"
  },
  "questions": [
    {
      "type": "mcq",
      "questionText": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exact string from options that is correct",
      "explanation": "Why this answer is correct"
    }
  ]
}
3. Questions must be derived directly from the text.
4. Respond ONLY with raw JSON, no markdown or pre-text.`;

    try {
        console.log(`🧠 Generating ${count} questions from ${textContent.length} characters...`);
        console.log(`   Using model: mixtral-8x7b-32768`);
        
        const message = await groq.messages.create({
            model: "mixtral-8x7b-32768",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        if (!message.content || !message.content[0] || message.content[0].type !== 'text') {
            throw new Error("Unexpected response format from AI service");
        }

        const responseText = message.content[0].text;
        const cleanJSON = extractJSON(responseText);
        const parsedData = JSON.parse(cleanJSON);
        
        return sanitizeAIResponse(parsedData);
    } catch (error) {
        console.error("❌ Error in generateFromContent:");
        console.error("   Error Message:", error.message);
        console.error("   Error Type:", error.name);
        console.error("   Stack:", error.stack?.split('\n').slice(0, 3).join('\n'));
        if (error.response) {
            console.error("   HTTP Status:", error.response.status);
            console.error("   Response:", error.response.data);
        }
        if (error.status) {
            console.error("   Status Code:", error.status);
        }
        return null;
    }
};

/**
 * Generates questions from a topic name
 * @param {string} topic - Topic name
 * @param {number} count - Number of questions
 * @returns {Promise<Object|null>} - Generated questions or null
 */
export const generateFromTopic = async (topic, count) => {
    // Check if Groq is initialized
    if (!groq) {
        const errorMsg = initializationError 
            ? `Groq API not initialized: ${initializationError.message}`
            : 'Groq API client is not available. Check your GROQ_API_KEY in .env file.';
        throw new Error(errorMsg);
    }

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
        throw new Error("Invalid topic provided");
    }

    const prompt = `Generate a professional quiz about: "${topic}"

REQUIREMENTS:
1. Generate EXACTLY ${count} Multiple Choice Questions (MCQs).
2. Response MUST be valid JSON:
{
  "topic": {
    "title": "${topic}",
    "description": "Comprehensive quiz covering key concepts"
  },
  "questions": [
    {
      "type": "mcq",
      "questionText": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Correct option",
      "explanation": "Explanation"
    }
  ]
}
3. Respond ONLY with raw JSON.`;

    try {
        console.log(`✨ Generating ${count} questions for topic: "${topic}"`);
        console.log(`   Using model: mixtral-8x7b-32768`);
        
        const message = await groq.messages.create({
            model: "mixtral-8x7b-32768",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        if (!message.content || !message.content[0] || message.content[0].type !== 'text') {
            throw new Error("Unexpected response format");
        }

        const responseText = message.content[0].text;
        const cleanJSON = extractJSON(responseText);
        const parsedData = JSON.parse(cleanJSON);
        
        return sanitizeAIResponse(parsedData);
    } catch (error) {
        console.error("❌ Error in generateFromTopic:");
        console.error("   Error Message:", error.message);
        console.error("   Error Type:", error.name);
        console.error("   Stack:", error.stack?.split('\n').slice(0, 3).join('\n'));
        if (error.response) {
            console.error("   HTTP Status:", error.response.status);
            console.error("   Response:", error.response.data);
        }
        if (error.status) {
            console.error("   Status Code:", error.status);
        }
        return null;
    }
};

/**
 * Generates questions in batches from multiple text chunks
 * @param {string[]} textChunks - Array of text chunks
 * @param {number} totalQuestions - Total questions needed
 * @returns {Promise<Object|null>} - Merged results or null
 */
export const generateQuestionsInBatches = async (textChunks, totalQuestions) => {
    if (!Array.isArray(textChunks) || textChunks.length === 0) {
        throw new Error("Invalid or empty text chunks");
    }

    if (totalQuestions < 1) {
        throw new Error("Total questions must be at least 1");
    }

    const questionsPerChunk = Math.ceil(totalQuestions / textChunks.length);
    console.log(`🌀 Batch Processing: ${textChunks.length} chunks, ${questionsPerChunk} questions/chunk`);

    // Generate questions for all chunks in parallel
    const promises = textChunks.map((chunk, index) => {
        console.log(`  📄 Processing chunk ${index + 1}/${textChunks.length}`);
        return generateFromContent(chunk, questionsPerChunk);
    });

    const settledResults = await Promise.allSettled(promises);

    // Filter successful results and log detailed info
    const validResults = settledResults
        .map((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                console.log(`  ✅ Chunk ${index + 1} succeeded (${result.value.questions?.length || 0} questions)`);
                return result.value;
            } else {
                if (result.status === 'rejected') {
                    console.warn(`  ⚠️ Chunk ${index + 1} failed: ${result.reason?.message || result.reason}`);
                } else {
                    console.warn(`  ⚠️ Chunk ${index + 1} returned no data`);
                }
                return null;
            }
        })
        .filter(result => result !== null);

    if (validResults.length === 0) {
        console.error("❌ All batch generation attempts failed");
        return null;
    }

    console.log(`📊 Successfully processed ${validResults.length}/${textChunks.length} chunks`);

    // Merge all results
    const merged = {
        topic: validResults[0].topic,
        questions: validResults.flatMap(r => r.questions || [])
    };

    console.log(`📈 Total questions generated: ${merged.questions.length}`);
    return merged;
};