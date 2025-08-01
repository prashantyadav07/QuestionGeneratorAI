// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Zap } from 'lucide-react';
import Card from '../components/ui/Card';

const Home = () => {
    const { user } = useAuth();
    const ctaLink = user ? '/upload' : '/login';
    const ctaText = user ? 'Create a New Test' : 'Get Started for Free';

    return (
        <div className="container mx-auto px-6 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
                    Turn Your Notes into <span className="text-indigo-600">Tests Instantly</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload any PDF document, and our AI will generate a comprehensive test with multiple question types in seconds.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} className="mt-8">
                    <Link to={ctaLink} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg inline-flex items-center">
                        {ctaText} <ArrowRight className="ml-2" />
                    </Link>
                </motion.div>
            </motion.div>

            <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
                <Card>
                    <BookOpen className="w-12 h-12 text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Upload Your PDF</h3>
                    <p className="text-gray-600">Simply upload your study notes, textbook chapters, or any PDF document.</p>
                </Card>
                <Card>
                    <Zap className="w-12 h-12 text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">AI-Powered Generation</h3>
                    <p className="text-gray-600">Our smart AI analyzes the text and creates relevant MCQs, short, and long answer questions.</p>
                </Card>
                <Card>
                    <ArrowRight className="w-12 h-12 text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Start Your Test</h3>
                    <p className="text-gray-600">Take the generated test to challenge yourself and master the material.</p>
                </Card>
            </div>
        </div>
    );
};

export default Home;