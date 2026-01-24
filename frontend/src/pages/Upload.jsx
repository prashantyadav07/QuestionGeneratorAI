// src/pages/Upload.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDFAndCreateTest, createTestFromText } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Hash, AlertCircle, PenSquare, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Upload = () => {
    const [activeTab, setActiveTab] = useState('pdf');
    const [file, setFile] = useState(null);
    const [textInput, setTextInput] = useState('');
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
        if (isLoading || !questionCount || questionCount < 1) return;

        let toastId;
        try {
            if (activeTab === 'pdf' && !file) throw new Error("Please select a PDF file first.");
            if (activeTab === 'text' && textInput.trim() === '') throw new Error("Please enter some text or a topic.");

            const estimatedTime = 5 + Math.floor(questionCount * 1.2);
            setCountdown(estimatedTime);
            setIsLoading(true);

            toastId = toast.loading('AI is crafting your quiz...');

            const promise = activeTab === 'pdf'
                ? uploadPDFAndCreateTest(file, questionCount)
                : createTestFromText(textInput, questionCount);

            const response = await promise;

            if (response.data.success) {
                toast.success(`Success! ${response.data.data.questions.length} questions generated.`, { id: toastId });
                navigate(`/test/${response.data.data.topic._id}`);
            } else {
                throw new Error(response.data.message || 'Failed to generate the quiz.');
            }
        } catch (error) {
            toast.error(error.message || "An unknown error occurred.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = isLoading || !questionCount || (activeTab === 'pdf' && !file) || (activeTab === 'text' && textInput.trim() === '');

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#fcfdff] overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-3xl"
            >
                {/* Header Section */}
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-4"
                    >
                        <Sparkles size={14} /> AI-Powered Quiz Engine
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">learn today?</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                        Convert your study materials into interactive assessments in seconds.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-4 md:p-10 overflow-hidden">
                    
                    {/* Custom Animated Tab Switcher */}
                    <div className="relative flex bg-slate-100/50 p-1.5 rounded-2xl mb-10 w-full max-w-md mx-auto">
                        {/* Sliding Background */}
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 left-1.5 bg-white rounded-xl shadow-sm border border-slate-200"
                            animate={{ 
                                x: activeTab === 'pdf' ? '0%' : '100%',
                                width: 'calc(50% - 3px)'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button 
                            onClick={() => setActiveTab('pdf')} 
                            className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'pdf' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileText size={18} /> Upload PDF
                        </button>
                        <button 
                            onClick={() => setActiveTab('text')} 
                            className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'text' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <PenSquare size={18} /> Paste Text
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Dynamic Input Area */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'pdf' ? (
                                <motion.div
                                    key="pdf"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <label className={`group relative block w-full p-10 border-2 border-dashed rounded-[2rem] text-center transition-all duration-300 ${!isLoading ? 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer' : 'border-slate-100 opacity-50'}`}>
                                        <div className="mb-4 inline-flex w-16 h-16 bg-white shadow-xl shadow-slate-200/50 text-indigo-600 rounded-2xl items-center justify-center group-hover:scale-110 transition-transform">
                                            <UploadCloud size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                                            {file ? 'Document Loaded' : 'Select study material'}
                                        </h3>
                                        <p className="text-slate-400 text-sm mb-4">Click to browse or drag and drop PDF</p>
                                        
                                        {file && (
                                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center justify-center gap-2 text-indigo-700 bg-indigo-50 py-2.5 px-5 rounded-xl inline-flex font-bold text-sm">
                                                <FileText size={16} /> {file.name}
                                            </motion.div>
                                        )}
                                        <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
                                    </label>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <textarea
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Paste your notes or a topic like 'Deep Learning Fundamentals'..."
                                        className="w-full h-52 p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all resize-none shadow-inner"
                                        disabled={isLoading}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Settings Grid */}
                        <div className="grid md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                                    <Hash size={16} className="text-indigo-500" /> Question Count
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all pl-12"
                                        min="1" max="50" disabled={isLoading}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
                                </div>
                            </div>

                            <div className="hidden md:block pb-1">
                                {questionCount > 25 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold leading-tight">
                                        <AlertCircle size={18} className="shrink-0" />
                                        Higher question counts might take up to a minute to process.
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="relative pt-4">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                countdown={countdown}
                                disabled={isSubmitDisabled}
                                className="group w-full py-5 text-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
                            >
                                <span>{isLoading ? 'Processing Knowledge...' : 'Generate Quiz Now'}</span>
                                {!isLoading && <ChevronRight className="group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    </form>
                </div>

               
            </motion.div>
        </div>
    );
};

export default Upload;