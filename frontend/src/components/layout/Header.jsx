import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) { 
                    setIsVisible(false);
                } else { 
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };
        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header 
            className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
            }`}
        >
            {/* Width kam karne ke liye max-w-4xl use kiya hai */}
            <nav className="max-w-4xl mx-auto px-4">
                <div className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-5 py-2 flex justify-between items-center min-h-[60px]">
                    
                    {/* Logo */}
                    <Link to="/" className="flex items-center ml-2">
                        <span className="text-lg sm:text-xl font-black tracking-tighter text-[#D4AF37]">
                            NOTES2TEST AI
                        </span>
                    </Link>

                    {/* Auth Section */}
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-bold text-slate-800 leading-none">{user.displayName}</p>
                                    <p className="text-[10px] font-medium text-[#D4AF37] uppercase tracking-wider mt-1">User</p>
                                </div>
                                <img
                                    src={user.photoURL || 'https://via.placeholder.com/40'}
                                    alt="profile"
                                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
                                />
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            /* Google Sign In Button */
                            <Link
                                to="/login"
                                className="flex items-center gap-2.5 bg-[#0F172A] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-black transition-all shadow-md active:scale-95"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span className="hidden xs:block">Sign in with Google</span>
                                <span className="xs:hidden">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;