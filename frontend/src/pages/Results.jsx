// src/pages/Results.jsx
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Results = () => {
    const location = useLocation();
    if (!location.state?.results) {
        return <Navigate to="/upload" replace />;
    }

    const { score, totalQuestions, results } = location.state.results;
    const correctAnswers = score;
    const wrongAnswers = totalQuestions - score;

    const data = [
        { name: 'Correct', value: correctAnswers },
        { name: 'Wrong', value: wrongAnswers },
    ];
    const COLORS = ['#22c55e', '#ef4444']; // green-500, red-500

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-slate-800">Test Analysis</h1>
                        <p className="text-2xl font-bold text-indigo-600 mt-2">
                            {score} / {totalQuestions} Correct
                        </p>
                        <Link to="/upload" className="mt-6 inline-block bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">
                            Take Another Test
                        </Link>
                    </div>
                    <div className="w-full md:w-1/2 h-52 mt-6 md:mt-0">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            <h2 className="text-3xl font-bold mb-6 text-slate-800">Detailed Review</h2>
            <div className="space-y-4">
                {results.map((item, index) => (
                    <motion.div 
                        key={item.questionId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${item.isCorrect ? 'border-green-500' : 'border-red-500'}`}
                    >
                        <p className="font-bold text-slate-800 mb-4">{index + 1}. {item.questionText}</p>
                        <div className={`flex items-start gap-3 p-3 rounded-lg ${item.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {item.isCorrect ? <CheckCircle className="flex-shrink-0 mt-1"/> : <XCircle className="flex-shrink-0 mt-1"/>}
                            <div>
                                <span className="font-semibold">Your Answer: </span>
                                <span>{item.userAnswer || 'Not Answered'}</span>
                            </div>
                        </div>
                        {!item.isCorrect && (
                            <div className="mt-3 flex items-start gap-3 p-3 rounded-lg bg-slate-100 text-slate-800">
                                <CheckCircle className="flex-shrink-0 mt-1 text-green-500"/>
                                <div>
                                    <span className="font-semibold">Correct Answer: </span>
                                    <span>{item.correctAnswer}</span>
                                </div>
                            </div>
                        )}
                         <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-sm text-slate-600"><span className="font-semibold">Explanation:</span> {item.explanation}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Results;