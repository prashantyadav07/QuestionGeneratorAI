// File: frontend/src/components/layout/Footer.jsx
import React from 'react';
import { Github, Linkedin, Mail, Heart, Sparkle } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <Github size={18} />, href: "https://github.com/prashantyadav07", label: "GitHub" },
        { icon: <Linkedin size={18} />, href: "https://www.linkedin.com/in/prashant-yadav-83a94a2ab/", label: "LinkedIn" },
        { icon: <Mail size={18} />, href: "mailto:prashantyadav9407@gmail.com", label: "Email" }
    ];

    return (
        <footer className="relative w-full bg-white pt-10 pb-24 overflow-hidden">
            
            {/* 1. Main Content Box - Iski width kam (max-w-5xl) rakhi hai aur shadow heavy hai */}
            <div className="container mx-auto px-6 relative z-10 flex justify-center">
                <div className="w-full max-w-5xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] p-8 md:p-10 mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        
                        {/* Branding */}
                        <div className="space-y-2 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Sparkle className="text-amber-500 fill-amber-500" size={20} />
                                <span className="text-xl font-black tracking-tight text-slate-900">
                                    Notes2Test<span className="text-amber-600">.AI</span>
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                                Smart Learning. Simplified.
                            </p>
                        </div>

                        {/* Social Links - Compact Style */}
                        <div className="flex gap-3">
                            {socialLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-sm"
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>

                        {/* Copyright & Credit */}
                        <div className="text-center md:text-right">
                            <p className="text-sm text-slate-500 font-medium">
                                © {currentYear} All rights reserved
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Handcrafted by <a href="https://www.linkedin.com/in/prashant-yadav-83a94a2ab/" className="text-slate-900 font-bold hover:text-amber-600 transition-colors">Prashant Yadav</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Golden Watermark Section */}
            {/* Isko position bottom-4 diya hai taaki ye box ke niche 75% part dikhaye */}
            <div className="absolute bottom-4 left-0 w-full pointer-events-none select-none overflow-hidden whitespace-nowrap z-0">
                <h2 className="text-[12vw] font-black leading-none tracking-tighter text-center
                    bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent opacity-20 uppercase">
                    NOTES2TEST AI
                </h2>
            </div>

            {/* Extra Decorative Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-30"></div>
        </footer>
    );
};

export default Footer;