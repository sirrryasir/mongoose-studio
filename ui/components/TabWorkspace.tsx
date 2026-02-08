"use client";

import { useTabStore } from "@/store/useTabStore";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelView } from "./ModelView";
import Image from "next/image";

export function TabWorkspace() {
    const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();

    if (tabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
                    <Image src="/logo.png" alt="Logo" width={48} height={48} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to Mongoose Studio</h1>
                <p className="text-zinc-500 max-w-md">
                    Select a model from the sidebar to inspect its schema and view its documents.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Tab Bar - Minimal & Dark */}
            <div className="flex items-center space-x-1 px-2 pt-2 bg-zinc-950 border-b border-zinc-800 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTabId === tab.id;
                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] text-xs font-medium cursor-pointer border-t-2 transition-colors select-none",
                                isActive
                                    ? "bg-zinc-900 text-emerald-400 border-emerald-500 rounded-t-sm"
                                    : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/50"
                            )}
                        >
                            <span className="truncate flex-1">{tab.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                                className={cn(
                                    "opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-zinc-800 hover:text-red-400 transition-opacity",
                                    isActive && "opacity-100"
                                )}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-zinc-900/50 relative">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={cn(
                            "absolute inset-0 w-full h-full",
                            tab.id === activeTabId ? "block" : "hidden"
                        )}
                    >
                        {tab.type === 'model' && <ModelView modelName={tab.name} previewId={tab.previewId} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
