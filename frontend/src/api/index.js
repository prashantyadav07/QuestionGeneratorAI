// File: frontend/src/api/index.js
// ✅ YEH IS FILE KA POORA AUR SAHI CODE HAI

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Function to handle PDF uploads
export const uploadPDFAndCreateTest = (pdfFile, questionCount) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('questionCount', String(questionCount));
    // Path /api se shuru hoga
    return api.post('/api/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ✅ WOH FUNCTION JO MISSING THA
// Function to handle text/topic submissions
export const createTestFromText = (text, questionCount) => {
    // Path /api se shuru hoga
    return api.post('/api/pdf/generate-from-text', {
        text: text,
        questionCount: String(questionCount),
    });
};

// Function to fetch a specific test
export const fetchTestQuestions = async (topicId) => {
    try {
        const { data } = await api.get(`/api/questions/topic/${topicId}`);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to load the test.";
        toast.error(message);
        throw new Error(message);
    }
};

// Function to submit test results
export const submitAndGetResults = async (topicId, answers) => {
    try {
        const { data } = await api.post(`/api/questions/submit/${topicId}`, { answers });
        toast.success(data.message || 'Test submitted!');
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to submit the test.";
        toast.error(message);
        throw new Error(message);
    }
};