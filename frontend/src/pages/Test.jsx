// src/pages/Test.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTestQuestions, submitAndGetResults } from '../api';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';

const Test = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // Format: { questionId: userAnswer }

    useEffect(() => {
        const loadTest = async () => {
            try {
                const data = await fetchTestQuestions(topicId);
                if (data.success) {
                    setTopic(data.data.topic);
                    setQuestions(data.data.questions);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
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
        setLoading(true);
        const answersArray = Object.entries(userAnswers).map(([questionId, userAnswer]) => ({
            questionId,
            userAnswer,
        }));

        try {
            const resultData = await submitAndGetResults(topicId, answersArray);
            if (resultData.success) {
                // Pass results data to the results page to avoid another API call
                navigate(`/results/${topicId}`, { state: { results: resultData.data } });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && !topic) return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><Spinner /></div>;
    if (!questions.length) return <Card className="text-center">No questions found for this test.</Card>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <Card>
                <h1 className="text-2xl font-bold">{topic.title}</h1>
                <p className="text-gray-500 mb-6">{topic.description}</p>
                
                <div className="mb-4 text-sm font-semibold text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion._id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-lg font-medium mb-4">{currentQuestion.questionText}</p>
                        {currentQuestion.type === 'mcq' ? (
                            <div className="space-y-2">
                                {currentQuestion.options.map(option => (
                                    <div key={option} 
                                         onClick={() => handleAnswerSelect(currentQuestion._id, option)}
                                         className={`p-3 border rounded-lg cursor-pointer transition-colors ${userAnswers[currentQuestion._id] === option ? 'bg-indigo-100 border-indigo-500' : 'border-gray-300'}`}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        ) : (
                           <textarea
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows="4"
                                placeholder="Write your answer here..."
                                onChange={(e) => handleAnswerSelect(currentQuestion._id, e.target.value)}
                                value={userAnswers[currentQuestion._id] || ''}
                           />
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex justify-between items-center">
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button onClick={handleNext} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md">Next</button>
                    ) : (
                        <button onClick={handleSubmitTest} disabled={loading} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-400">
                            {loading ? 'Submitting...' : 'Submit Test'}
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Test;