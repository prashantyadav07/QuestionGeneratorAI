// src/components/layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, FilePlus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10); // Activar el efecto con un desplazamiento menor
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        // CAMBIO: Fondo del header ajustado para un aspecto más integrado y vidrioso.
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
            scrolled 
                ? 'bg-[#110D22]/80 backdrop-blur-xl shadow-lg shadow-indigo-500/20' 
                : 'bg-transparent'
        }`}>
            <nav className="container mx-auto px-4 sm:px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo: Sin cambios, ya que el degradado coincide con el estilo de la página */}
                    <Link 
                        to="/" 
                        className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
                    >
                        Notes2Test.AI
                    </Link>

                    {/* Navegación de Escritorio */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* CAMBIO: Estilo del botón actualizado para que coincida con el tema. */}
                                <Link 
                                    to="/upload" 
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
                                >
                                    <FilePlus size={18} />
                                    <span className="hidden sm:inline">New Test</span>
                                </Link>
                                
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={user.photoURL} 
                                        alt={user.displayName} 
                                        title={`Logged in as ${user.displayName}`} 
                                        className="w-10 h-10 rounded-full border-2 border-indigo-400 shadow-md"
                                    />
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-semibold text-white leading-tight">{user.displayName}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleLogout} 
                                    className="p-2.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            // CAMBIO: Estilo del botón actualizado y texto a blanco para mejor contraste.
                            <Link 
                                to="/login" 
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
                            >
                                <User size={18} />
                                Login / Signup
                            </Link>
                        )}
                    </div>

                    {/* Botón de Menú Móvil */}
                    {/* CAMBIO: Botón de menú actualizado para un aspecto de cristal. */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Menú Móvil */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            // CAMBIO: Borde superior con un color del tema.
                            className="md:hidden mt-4 pt-4 border-t border-purple-500/20"
                        >
                            <div className="space-y-3">
                                {user ? (
                                    <>
                                        {/* CAMBIO: Bloque de info de usuario con fondo temático. */}
                                        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                                            <img 
                                                src={user.photoURL} 
                                                alt={user.displayName} 
                                                className="w-10 h-10 rounded-full border-2 border-indigo-400"
                                            />
                                            <div>
                                                <p className="font-semibold text-white">{user.displayName}</p>
                                                <p className="text-sm text-gray-400">{user.email}</p>
                                            </div>
                                        </div>

                                        <Link 
                                            to="/upload" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
                                        >
                                            <FilePlus size={20} />
                                            Create New Test
                                        </Link>

                                        <button 
                                            onClick={handleLogout} 
                                            className="flex items-center gap-3 w-full p-3 text-red-400 bg-red-500/20 rounded-lg font-semibold hover:bg-red-500/30 transition-colors"
                                        >
                                            <LogOut size={20} />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link 
                                        to="/login" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
                                    >
                                        <User size={20} />
                                        Login / Signup
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Header;