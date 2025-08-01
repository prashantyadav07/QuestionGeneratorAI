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
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2 text-sm text-slate-400">
                        <span>Progress</span>
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <motion.div 
                            className="bg-violet-600 h-2.5 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-100 mb-2">{topic.title}</h1>
                <hr className="mb-6 border-slate-700" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion._id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.4 }}
                        className="min-h-[250px]"
                    >
                        <p className="text-lg font-semibold text-slate-200 mb-6">{currentQuestion.questionText}</p>
                        
                        {/* === YEH SECTION SIMPLIFY HUA HAI === */}
                        {/* Ab sirf MCQ options dikhane hain */}
                        <div className="space-y-3">
                            {currentQuestion.options.map(option => (
                                <motion.div 
                                    key={option}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleAnswerSelect(currentQuestion._id, option)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${userAnswers[currentQuestion._id] === option ? 'bg-violet-900/50 border-violet-500 shadow-md text-white' : 'border-slate-700 hover:border-violet-600 text-slate-300'}`}
                                >
                                    {option}
                                </motion.div>
                            ))}
                        </div>
                        {/* === CHANGE ENDS HERE === */}

                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button onClick={handleNext} className="bg-violet-600 text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-violet-700 transition-colors">Next</button>
                    ) : (
                        <button onClick={handleSubmitTest} disabled={submitting} className="bg-green-600 text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-slate-600 transition-colors">
                            {submitting ? 'Submitting...' : 'Submit & See Results'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Test;