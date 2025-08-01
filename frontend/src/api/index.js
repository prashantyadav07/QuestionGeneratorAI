import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ Make sure VITE_BACKEND_URL in .env has NO trailing slash
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// ✅ Upload PDF and generate test
export const uploadPDFAndCreateTest = (pdfFile, questionCount) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('questionCount', String(questionCount));

    const promise = api.post('/api/pdf/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return toast.promise(promise, {
        loading: 'Uploading PDF and analyzing...',
        success: (response) => response.data.message || 'Test generated successfully!',
        error: (error) => error.response?.data?.message || 'A critical error occurred. Please try again.',
    });
};

// ✅ Fetch questions for a given topic ID
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

// ✅ Submit answers and get results
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
