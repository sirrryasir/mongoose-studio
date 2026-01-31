"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Terminal } from "lucide-react";
import clsx from "clsx";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

interface CodeTabsProps {
    commands: {
        npm: string;
        pnpm: string;
        yarn: string;
        bun: string;
    };
    className?: string;
}

export function CodeTabs({ commands, className }: CodeTabsProps) {
    const [activeTab, setActiveTab] = useState<PackageManager>("npm");
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(commands[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

    return (
        <div className={clsx("w-full border border-border rounded-xl bg-card overflow-hidden shadow-lg", className)}>
            {/* Tab Header */}
            <div className="flex items-center border-b border-border bg-muted/50 px-2 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "px-4 py-3 text-sm font-medium transition-all relative outline-none",
                            activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Code Area */}
            <div className="relative group bg-card p-4 min-h-[50px] flex items-center">
                <div className="absolute top-4 left-4 text-emerald-500 opacity-50 select-none">
                    <Terminal className="w-4 h-4" />
                </div>

                <div className="pl-6 pr-12 font-mono text-sm text-foreground w-full overflow-x-auto no-scrollbar whitespace-nowrap">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="text-muted-foreground mr-2 select-none">$</span>
                            {commands[activeTab]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Copy Button */}
                <button
                    onClick={onCopy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-100"
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
        </div >
    );
}
