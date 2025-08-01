// src/pages/Upload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDFAndCreateTest } from '../api';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [questionCount, setQuestionCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsLoading(true);
        try {
            const data = await uploadPDFAndCreateTest(file, questionCount);
            if (data.success) {
                navigate(`/test/${data.data.topic._id}`);
            }
        } catch (error) {
            // Toast will be shown by the api service
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Card>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Create a Test from PDF</h1>
                    <p className="text-gray-500 mt-2">Upload a file and choose how many questions you want.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">PDF File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500"
                             onClick={() => document.getElementById('file-upload').click()}>
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="text-sm text-gray-600">{file ? file.name : 'Click to select a file'}</p>
                                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">Number of Questions</label>
                        <input
                            type="number" id="questionCount" value={questionCount}
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            min="5" max="50" disabled={isLoading}
                        />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <button type="submit" disabled={!file || isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? <Spinner /> : 'Generate Test'}
                        </button>
                    </motion.div>
                </form>
            </Card>
        </div>
    );
};

export default Upload;