import { Heart, Github, Linkedin, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // FIXED: Email URL corrected with mailto: prefix
    const socialLinks = [
        { icon: Github, href: "https://github.com/prashantyadav07", label: "GitHub" },
        { icon: Linkedin, href: "https://www.linkedin.com/in/prashant-yadav-83a94a2ab/", label: "LinkedIn" },
        { icon: Mail, href: "mailto:prashant9407@gmail.com", label: "Email" }
    ];

    return (
        // SAME THEME: Dark purple background with purple borders
        <footer className="w-full bg-[#110D22] text-white mt-20 border-t border-purple-500/20">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    
                    {/* Brand section with same gradient */}
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                            Notes2Test.AI
                        </h3>
                        <p className="text-gray-400 text-sm max-w-md">
                            Transforming notes into intelligent tests. Learn smarter, not harder.
                        </p>
                    </div>

                    {/* FIXED: Social links with glassmorphism effect */}
                    <div className="flex gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group hover:scale-110 hover:-translate-y-1 active:scale-95"
                                title={social.label}
                            >
                                <social.icon size={20} className="text-gray-300 group-hover:text-white transition-colors duration-200" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom bar with same theme colors */}
                <div className="pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-400 text-center sm:text-left">
                        <span>© {currentYear} Notes2Test.AI</span>
                        <span className="mx-2">•</span>
                        <span>Made with <Heart size={14} className="inline text-red-400" /> by 
                            <a 
                                href="https://www.linkedin.com/in/prashant-yadav-83a94a2ab/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline ml-1 transition-colors duration-200"
                            >
                                Prashant Yadav
                            </a>
                        </span>
                    </div>

                    {/* FIXED: Back to top button with same gradient theme */}
                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-200"
                    >
                        <ArrowUp size={16} />
                        Back to Top
                    </button>
                </div>
            </div>

            {/* Same decorative bottom border with theme gradient */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        </footer>
    );
};

export default Footer;