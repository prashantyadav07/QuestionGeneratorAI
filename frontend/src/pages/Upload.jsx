// frontend/src/pages/Upload.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDFAndCreateTest } from '../api';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Hash, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [questionCount, setQuestionCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const intervalRef = useRef(null);

    const handleFileChange = (e) => { if (e.target.files[0]) setFile(e.target.files[0]); };

    useEffect(() => {
        if (isLoading) {
            intervalRef.current = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || isLoading || !questionCount || questionCount < 1) return;
        
        const estimatedTime = 5 + Math.floor(questionCount * 0.7);
        setCountdown(estimatedTime);

        setIsLoading(true);
        try {
            const response = await uploadPDFAndCreateTest(file, questionCount);
            if (response.data.success) {
                const generatedCount = response.data.data.questions.length;
                if (generatedCount < questionCount) {
                    alert(`AI was able to generate ${generatedCount} out of ${questionCount} requested questions. Redirecting you to the test.`);
                }
                navigate(`/test/${response.data.data.topic._id}`);
            }
        } catch (error) { 
            console.error("Upload failed in component:", error);
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: "spring" }}
                className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-100">Generate a New Quiz</h1>
                    <p className="text-slate-400 mt-2">All questions will be Multiple Choice (MCQ).</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <label htmlFor="file-upload" className="block w-full p-8 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer hover:border-violet-500 hover:bg-slate-800 transition-colors">
                        <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />
                        <p className="mt-2 text-sm text-slate-300 font-semibold">{file ? 'File ready to upload:' : 'Click to upload or drag & drop'}</p>
                        {file && <p className="mt-1 text-xs text-violet-400 font-medium flex items-center justify-center gap-2"><FileText size={14} /> {file.name}</p>}
                        <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
                    </label>

                    <div className="space-y-2">
                        <label htmlFor="questionCount" className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Hash size={16} /> Number of Questions
                        </label>
                        <input
                            type="number"
                            id="questionCount"
                            value={questionCount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || Number(value) >= 1) { setQuestionCount(value); }
                            }}
                            className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="e.g., 10"
                            required
                            disabled={isLoading}
                            // === YEH ATTRIBUTES CHANGE HUE HAIN ===
                            min="1" 
                            // max="30" YAHAN SE HATA DIYA GAYA HAI
                        />
                    </div>
                    
                    {questionCount > 40 && (
                        <div className="flex items-start gap-3 p-3 text-sm text-amber-300 bg-amber-900/50 rounded-lg">
                            <AlertTriangle size={20} className="flex-shrink-0" />
                            <span>Generating more than 40 questions may take significantly longer.</span>
                        </div>
                    )}
                    
                    <Button 
                        type="submit" 
                        isLoading={isLoading}
                        countdown={countdown}
                        disabled={!file || !questionCount || questionCount < 1} 
                        className="w-full py-3 text-base !bg-violet-600 hover:!bg-violet-500"
                    >
                        Generate MCQ Test
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default Upload;