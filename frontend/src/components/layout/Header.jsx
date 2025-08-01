// src/components/layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, LogOut, FilePlus } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-gray-800">Notes2Test</Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link to="/upload" className="flex items-center text-gray-600 hover:text-indigo-600">
                                <FilePlus size={20} className="mr-1" /> New Test
                            </Link>
                            <span className="text-gray-700">Hi, {user.displayName.split(' ')[0]}</span>
                            <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700">
                                <LogOut size={20} className="mr-1" /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="flex items-center text-gray-600 hover:text-indigo-600">
                            <LogIn size={20} className="mr-1" /> Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;