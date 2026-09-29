import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ExternalLink, Mail, Globe } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const DOCS_URL = "http://localhost:8080/webjars/swagger-ui/index.html";

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8 mb-16">

                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-all duration-300">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900">
                                Job<span className="text-indigo-600">Portal</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                            The intelligent platform connecting the world's most ambitious companies with elite professionals.
                        </p>
                        
                        {/* SOCIAL ICONS USING SVGS (Bypasses Lucide Errors) */}
                        <div className="flex gap-4">
                            <SocialIcon href="#">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Links: Platform */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/jobs" label="Browse Jobs" />
                            <FooterLink to="/dashboard" label="Dashboard" />
                            <FooterLink to="/notifications" label="Updates" />
                        </ul>
                    </div>

                    {/* Links: Resources */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                    API Docs <ExternalLink size={14} />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Links: Company */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Company</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/about-us" label="About Us" />
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        © {currentYear} JobPortal Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            {label}
        </Link>
    </li>
);

const SocialIcon = ({ children, href }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
    >
        {children}
    </a>
);

export default Footer;