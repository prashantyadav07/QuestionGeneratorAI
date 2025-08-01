// src/pages/Login.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const Login = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/upload'); // Agar user pehle se login hai to upload page pe bhej do
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await login();
            navigate('/upload');
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-10 bg-white rounded-lg shadow-xl"
            >
                <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
                <p className="text-gray-600 mb-6">Sign in to continue.</p>
                <motion.button
                    onClick={handleLogin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg flex items-center mx-auto"
                >
                    <img src="/google.svg" alt="Google icon" className="w-6 h-6 mr-3" />
                    Sign in with Google
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Login;