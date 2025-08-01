// src/api/index.js
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const uploadPDFAndCreateTest = async (pdfFile, questionCount) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('questionCount', questionCount);

    try {
        const { data } = await api.post('/pdf/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(data.message);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "PDF upload failed. Please try again.";
        toast.error(message);
        throw new Error(message);
    }
};

export const fetchTestQuestions = async (topicId) => {
    try {
        const { data } = await api.get(`/questions/topic/${topicId}`);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to load test.";
        toast.error(message);
        throw new Error(message);
    }
};

export const submitAndGetResults = async (topicId, answers) => {
    try {
        const { data } = await api.post(`/questions/submit/${topicId}`, { answers });
        toast.success(data.message);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to submit test.";
        toast.error(message);
        throw new Error(message);
    }
};