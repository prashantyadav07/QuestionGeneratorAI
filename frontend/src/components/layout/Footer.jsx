import { Heart, Github, Linkedin, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Test function to check if clicks are working
    const handleLinkClick = (url, label) => {
        console.log(`Clicking ${label}: ${url}`);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const socialLinks = [
        { icon: Github, href: "https://github.com/prashantyadav07", label: "GitHub" },
        { icon: Linkedin, href: "https://www.linkedin.com/in/prashant-yadav-83a94a2ab/", label: "LinkedIn" },
        { icon: Mail, href: "mailto:prashant9407@gmail.com", label: "Email" }
    ];

    return (
        <footer className="w-full bg-[#110D22] text-white mt-20 border-t border-purple-500/20">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                            Notes2Test.AI
                        </h3>
                        <p className="text-gray-400 text-sm max-w-md">
                            Transforming notes into intelligent tests. Learn smarter, not harder.
                        </p>
                    </div>

                    {/* DEBUG: Using onClick handlers instead of href */}
                    <div className="flex gap-4">
                        {socialLinks.map((social) => (
                            <button
                                key={social.label}
                                onClick={() => handleLinkClick(social.href, social.label)}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group hover:scale-110 hover:-translate-y-1 active:scale-95 cursor-pointer"
                                title={social.label}
                            >
                                <social.icon size={20} className="text-gray-300 group-hover:text-white transition-colors duration-200" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-400 text-center sm:text-left">
                        <span>© {currentYear} Notes2Test.AI</span>
                        <span className="mx-2">•</span>
                        <span>Made with <Heart size={14} className="inline text-red-400" /> by 
                            <button 
                                onClick={() => handleLinkClick("https://www.linkedin.com/in/prashant-yadav-83a94a2ab/", "Prashant LinkedIn")}
                                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline ml-1 transition-colors duration-200 cursor-pointer"
                            >
                                Prashant Yadav
                            </button>
                        </span>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        <ArrowUp size={16} />
                        Back to Top
                    </button>
                </div>
            </div>

            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            {/* DEBUG INFO */}
            <div className="bg-red-900/20 p-4 text-sm">
                <p className="text-yellow-400">🔧 Debug Mode: Click the social icons above. Check browser console for logs.</p>
                <p className="text-gray-300 mt-2">If nothing happens, there might be a browser restriction in this environment.</p>
                
                {/* Direct test links */}
                <div className="mt-4 space-y-2">
                    <p className="text-white font-semibold">Direct Links Test:</p>
                    <div className="flex gap-4 flex-wrap">
                        <a href="https://github.com/prashantyadav07" target="_blank" rel="noopener noreferrer" 
                           className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                            GitHub Direct
                        </a>
                        <a href="https://www.linkedin.com/in/prashant-yadav-83a94a2ab/" target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                            LinkedIn Direct
                        </a>
                        <a href="mailto:prashant9407@gmail.com"
                           className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors">
                            Email Direct
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;