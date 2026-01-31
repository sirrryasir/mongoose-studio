"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function LandingHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Image src="/logo.png" alt="Mongoose Studio Logo" width={32} height={32} className="w-5 h-5" />
                        </div>
                        <span className="text-foreground">Mongoose <span className="text-emerald-400">Studio</span></span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
                    <a href="https://github.com/sirrryasir/mongoose-studio" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                        <Github className="w-5 h-5" />
                    </a>
                    <ThemeToggle />
                    <Link href="/docs" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-full font-bold transition-colors">
                        Get Started
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button
                        className="p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background absolute w-full left-0 animate-in slide-in-from-top-5 fade-in duration-200">
                    <nav className="flex flex-col p-6 gap-4 text-sm font-medium">
                        <Link
                            href="/docs"
                            className="text-foreground hover:text-emerald-400 transition-colors py-2 border-b border-border"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Documentation
                        </Link>
                        <a
                            href="https://github.com/sirrryasir/mongoose-studio"
                            target="_blank"
                            className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2 border-b border-border"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Github className="w-5 h-5" /> GitHub
                        </a>
                        <Link
                            href="/docs"
                            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-3 rounded-xl font-bold transition-colors text-center mt-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
