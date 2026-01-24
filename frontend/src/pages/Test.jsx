// frontend/src/pages/Test.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTestQuestions, submitAndGetResults } from '../api';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '../components/ui/Spinner';

const Test = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});

    useEffect(() => {
        const loadTest = async () => {
            try {
                const data = await fetchTestQuestions(topicId);
                if (data.success) {
                    setTopic(data.data.topic);
                    setQuestions(data.data.questions);
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        loadTest();
    }, [topicId]);

    const handleAnswerSelect = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmitTest = async () => {
        setSubmitting(true);
        const answersArray = Object.entries(userAnswers).map(([questionId, userAnswer]) => ({ questionId, userAnswer }));
        try {
            const resultData = await submitAndGetResults(topicId, answersArray);
            if (resultData.success) {
                navigate(`/results/${topicId}`, { state: { results: resultData.data } });
            }
        } catch (error) { console.error(error); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-160px)]"><Spinner /></div>;
    if (!questions.length) return <div className="text-center p-8 text-slate-400">No questions found for this test.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4 min-h-[calc(100vh-160px)]">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 md:p-10">
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Question {currentQuestionIndex + 1} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 shadow-inner overflow-hidden">
                        <motion.div
                            className="bg-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">{topic.title}</h1>
                <hr className="mb-8 border-slate-100" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion._id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.4 }}
                        className="min-h-[250px]"
                    >
                        <p className="text-xl font-bold text-slate-800 mb-8 leading-relaxed italic border-l-4 border-indigo-500 pl-6 py-2 bg-indigo-50/30 rounded-r-xl">"{currentQuestion.questionText}"</p>

                        {/* === YEH SECTION SIMPLIFY HUA HAI === */}
                        {/* Ab sirf MCQ options dikhane hain */}
                        <div className="space-y-3">
                            {currentQuestion.options.map(option => (
                                <motion.div
                                    key={option}
                                    whileHover={{ scale: 1.01, x: 5 }}
                                    onClick={() => handleAnswerSelect(currentQuestion._id, option)}
                                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 group flex items-center gap-4 ${userAnswers[currentQuestion._id] === option ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200 text-white' : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${userAnswers[currentQuestion._id] === option ? 'bg-white border-white text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:border-indigo-300'}`}>
                                        {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                                    </div>
                                    <span className="flex-1 font-semibold">{option}</span>
                                </motion.div>
                            ))}
                        </div>
                        {/* === CHANGE ENDS HERE === */}

                    </motion.div>
                </AnimatePresence>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button onClick={handleNext} className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50">Next Question</button>
                    ) : (
                        <button onClick={handleSubmitTest} disabled={submitting} className="bg-green-600 text-white font-bold py-3 px-10 rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all active:scale-95 disabled:opacity-50">
                            {submitting ? 'Submitting Answers...' : 'Submit & See Results'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Test;