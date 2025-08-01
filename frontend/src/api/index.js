
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const uploadPDFAndCreateTest = (pdfFile, questionCount) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    // Ensure questionCount is always a string, as FormData often expects strings.
    formData.append('questionCount', String(questionCount));

    // Use toast.promise for a better UX
    const promise = api.post('/pdf/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return toast.promise(promise, {
        loading: 'Uploading PDF and analyzing...',
        success: (response) => {
            // Backend se aaye success message ko dikhao
            return response.data.message || 'Test generated successfully!';
        },
        error: (error) => {
            // Backend se aaye error message ko dikhao, ya ek default message do
            return error.response?.data?.message || 'A critical error occurred. Please try again.';
        },
    });
};


// In functions mein koi change ki zaroorat nahi hai
export const fetchTestQuestions = async (topicId) => {
    try {
        const { data } = await api.get(`/questions/topic/${topicId}`);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to load the test.";
        toast.error(message);
        throw new Error(message);
    }
};

export const submitAndGetResults = async (topicId, answers) => {
    try {
        const { data } = await api.post(`/questions/submit/${topicId}`, { answers });
        toast.success(data.message || 'Test submitted!');
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to submit the test.";
        toast.error(message);
        throw new Error(message);
    }
};