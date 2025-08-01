// src/pages/Login.jsx

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TestTube, Zap, FileText } from 'lucide-react';

// Using GSAP for powerful and reliable animations
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// NOTE: All React Three Fiber imports have been removed.

const Login = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // useGSAP hook to safely manage our animations
    useGSAP(() => {
        // Fade-in and scale-up animation for the entire login card
        gsap.from(containerRef.current, {
            duration: 0.8,
            opacity: 0,
            scale: 0.95,
            ease: 'power3.out'
        });

        // Staggered animation for the feature list items
        gsap.from('.feature-item', {
            duration: 0.6,
            opacity: 0,
            x: -30,
            stagger: 0.2,
            delay: 0.5,
            ease: 'power3.out'
        });
    }, { scope: containerRef });

    useEffect(() => {
        // If user is already logged in, redirect them
        if (user) {
            navigate('/upload');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await login();
            navigate('/upload');
        } catch (error) {
            console.error("Google Sign-In failed", error);
        }
    };

    const features = [
        { icon: FileText, text: "Upload any PDF document." },
        { icon: Zap, text: "AI generates test questions instantly." },
        { icon: TestTube, text: "Challenge yourself with interactive quizzes." },
    ];

    return (
        // Main container uses flexbox to perfectly center the form on a dark background
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0518]">
            
            {/* Main content card, perfectly centered */}
            <div ref={containerRef} className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                
                {/* Left Side - Information */}
                <div className="p-8 md:p-12 text-white flex flex-col justify-center">
                    <h2 className="text-4xl font-extrabold mb-4">
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Welcome to</span>
                        <br/>
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Notes2Test.AI</span>
                    </h2>
                    <p className="mb-8 text-gray-300">Your personal AI-powered study partner.</p>
                    <ul className="space-y-5">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-4 feature-item">
                                <feature.icon className="w-6 h-6 flex-shrink-0 text-blue-400" />
                                <span className="text-gray-200">{feature.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Side - Login Action */}
                <div className="p-8 md:p-12 flex flex-col items-center justify-center">
                    <div className="text-center w-full max-w-xs">
                        <h3 className="text-3xl font-bold text-white mb-2">Get Started</h3>
                        <p className="text-gray-400 mb-8">Sign in with your Google account to continue.</p>
                        <button
                            onClick={handleLogin}
                            className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                        >
                            {/* Inline SVG for Google Icon */}
                            <div className="bg-white rounded-full p-1 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            </div>
                            <span>Sign in with Google</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;