// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Zap, ArrowRight, Play, Upload, CheckCircle } from 'lucide-react';

// Imports for the 3D background animation
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

// --- 3D Background Animation Component (Optimized) ---
const Background3D = () => {
    const ref = useRef();
    // Reduced particle count slightly for better performance
    const positions = new Float32Array(4000 * 3).map(() => (Math.random() - 0.5) * 8);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta / 20;
            ref.current.rotation.y += delta / 25;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#a855f7" 
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};
// --- End of 3D Background Component ---


const Home = () => {
    const { user } = useAuth();

    // Animation variants for sections that load once
    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (delay = 0) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, delay }
        })
    };

    return (
        // The main wrapper with a solid dark background
        <div className="relative w-full overflow-x-hidden bg-[#0a0518] text-white">
            
            {/* 3D background is fixed to cover the entire page and runs smoothly */}
            <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
                 <Canvas camera={{ position: [0, 0, 1.5] }}>
                    <Background3D />
                </Canvas>
            </div>

            {/* All page content is in a `main` tag, on top of the animation */}
            <main className="relative z-10">

                {/* Hero Section */}
                <section className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
                    <div className="text-center max-w-5xl mx-auto">
                        
                        <motion.h1
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-5xl md:text-7xl font-bold mb-6"
                        >
                            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                Quiz Master
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={sectionVariants}
                            initial="hidden"
                            animate={sectionVariants.visible(0.2)}
                            className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
                        >
                            Transform your PDF documents into intelligent quizzes. 
                            <br className="hidden md:block" />
                            Learn smarter, test better, achieve more.
                        </motion.p>

                        <motion.div
                             variants={sectionVariants}
                             initial="hidden"
                             animate={sectionVariants.visible(0.4)}
                            className="flex flex-col md:flex-row gap-6 mb-12 max-w-4xl mx-auto"
                        >
                            {[
                                { icon: Upload, title: "Upload PDF", desc: "Drag & drop your documents", color: "from-violet-500 to-purple-500" },
                                { icon: Brain, title: "AI Processing", desc: "Smart content analysis", color: "from-blue-500 to-cyan-500" },
                                { icon: CheckCircle, title: "Take Quiz", desc: "Test your knowledge", color: "from-green-500 to-emerald-500" }
                            ].map((feature) => (
                                <motion.div
                                    key={feature.title}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="flex-1 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                             variants={sectionVariants}
                             initial="hidden"
                             animate={sectionVariants.visible(0.6)}
                        >
                            <Link
                                to={user ? '/upload' : '/login'}
                                className="group inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-lg py-4 px-8 rounded-full shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-105"
                            >
                                <Play className="w-5 h-5" />
                                <span>Start Creating Quizzes</span>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* All remaining content is grouped together with proper spacing */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto space-y-24">
                        {/* How It Works Section */}
                        <motion.div
                            variants={sectionVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} // Runs only once when it enters view
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">How It Works</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { step: "01", title: "Upload Your PDF", description: "Simply upload your PDF document and let our AI analyze the content." },
                                    { step: "02", title: "AI Creates Questions", description: "Our intelligent system generates relevant questions based on your content." },
                                    { step: "03", title: "Take the Quiz", description: "Test your knowledge and get instant feedback on your performance." }
                                ].map((step, index) => (
                                    <motion.div
                                        key={step.step}
                                        custom={index * 0.2} // Pass delay to variants
                                        variants={sectionVariants}
                                        className="relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                                    >
                                        <div className="text-4xl font-bold text-violet-500/30 mb-4">{step.step}</div>
                                        <h3 className="text-xl font-semibold mb-4 text-white">{step.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{step.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Final CTA Section - No border or extra space */}
                        <motion.div
                             variants={sectionVariants}
                             initial="hidden"
                             whileInView="visible"
                             viewport={{ once: true, amount: 0.5 }}
                             className="text-center"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
                            <p className="text-slate-400 mb-8 text-lg max-w-2xl mx-auto">Transform your learning experience with AI-powered quizzes today.</p>
                            <Link
                                to={user ? '/upload' : '/login'}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                Get Started Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Home;