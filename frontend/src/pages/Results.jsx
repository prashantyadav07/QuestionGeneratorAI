// src/pages/Results.jsx
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { CheckCircle2, XCircle, ChevronLeft, Award, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Results = () => {
    const location = useLocation();

    // Safety Check
    if (!location.state?.results) {
        return <Navigate to="/upload" replace />;
    }

    const { score, totalQuestions, results } = location.state.results;
    const accuracy = Math.round((score / totalQuestions) * 100);
    const wrongAnswers = totalQuestions - score;

    const data = [
        { name: 'Correct', value: score },
        { name: 'Wrong', value: wrongAnswers },
    ];

    const COLORS = ['#10b981', '#f43f5e']; // Emerald-500, Rose-500

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/upload" className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors font-medium gap-2">
                        <ChevronLeft size={20} />
                        <span>Back to Dashboard</span>
                    </Link>
                    <div className="font-bold text-xl text-slate-900 tracking-tight">
                        Quiz<span className="text-indigo-600">Analytics</span>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 pt-8">
                {/* Hero Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* Main Score Card */}
                    <div className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />

                        <div className="relative z-10 text-center md:text-left">
                            <h2 className="text-slate-500 font-semibold uppercase tracking-wider text-xs mb-2">Overall Performance</h2>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                                {accuracy >= 80 ? 'Outstanding!' : accuracy >= 50 ? 'Good Job!' : 'Keep Learning!'}
                            </h1>
                            <p className="text-slate-600 text-lg mb-6 max-w-sm">
                                You've completed the assessment with <span className="text-indigo-600 font-bold">{accuracy}% accuracy</span>.
                                Review your answers below to improve.
                            </p>
                            <Link to="/upload" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95">
                                Try Another Quiz
                            </Link>
                        </div>

                        {/* Donut Chart */}
                        <div className="w-48 h-48 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index]} cornerRadius={10} />
                                        ))}
                                        <Label
                                            value={`${accuracy}%`}
                                            position="center"
                                            fill="#1e293b"
                                            style={{ fontSize: '24px', fontWeight: '800' }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-rows-2 gap-6">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-5">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-600">
                                <Target size={28} />
                            </div>
                            <div>
                                <p className="text-emerald-900/60 font-bold text-sm uppercase">Score</p>
                                <p className="text-2xl font-black text-emerald-900">{score} / {totalQuestions}</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-center gap-5">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-amber-600">
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <p className="text-amber-900/60 font-bold text-sm uppercase">Total Questions</p>
                                <p className="text-2xl font-black text-amber-900">{totalQuestions} Units</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Detailed Review Section */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        Detailed Review
                        <span className="text-sm font-medium bg-slate-200 text-slate-600 px-3 py-1 rounded-full">{results.length}</span>
                    </h3>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {results.map((item, index) => (
                        <motion.div
                            key={item.questionId || index}
                            variants={itemVariants}
                            className="group bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Question Number Badge */}
                                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${item.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-slate-800 mb-6 leading-snug italic">
                                        "{item.questionText}"
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        {/* User Answer */}
                                        <div className={`p-4 rounded-2xl border ${item.isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Your Choice</p>
                                            <div className="flex items-center gap-2 font-bold text-slate-700">
                                                {item.isCorrect ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-500" />}
                                                {item.userAnswer || 'Skipped'}
                                            </div>
                                        </div>

                                        {/* Correct Answer - Always Show */}
                                        <div className="p-4 rounded-2xl border bg-indigo-50/50 border-indigo-100">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mb-1">Correct Answer</p>
                                            <div className="flex items-center gap-2 font-bold text-indigo-700">
                                                <CheckCircle2 size={18} />
                                                {item.correctAnswer}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explanation Box */}
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <div className="flex items-start gap-3">
                                            <Award className="text-indigo-500 mt-1 shrink-0" size={18} />
                                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                                <span className="font-bold text-slate-900 mr-1">Insights:</span>
                                                {item.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default Results;