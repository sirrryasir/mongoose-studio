"use client";

import useSWR from 'swr';
import { Database, Box } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Sidebar() {
    const { data: models = [], error } = useSWR('/api/models', (url) => fetcher(url).then(res => res.models));
    const { openTab, activeTabId } = useTabStore();

    if (error) return <div className="p-4 text-red-400 text-xs">Failed to load models.</div>;

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <Image src="/logo.png" alt="Mongoose Studio Logo" className="w-6 h-6 object-contain" />
                <span className="font-bold text-emerald-50 tracking-tight">Mongoose Studio</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Explorer
                </div>

                <nav className="space-y-0.5 px-2">
                    {models.map((model: string) => {
                        const isActive = activeTabId === `model-${model}`;
                        return (
                            <button
                                key={model}
                                onClick={() => openTab({ id: `model-${model}`, type: 'model', name: model })}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all group text-left",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400 font-medium"
                                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                                )}
                            >
                                <Box className={cn("w-4 h-4", isActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400")} />
                                <span className="flex-1">{model}</span>
                            </button>
                        );
                    })}

                    {models.length === 0 && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-zinc-600 text-xs">No models found.</p>
                        </div>
                    )}
                </nav>
            </div>

            <div className="p-4 border-t border-zinc-800 text-[10px] text-zinc-600 flex justify-between items-center">
                <span>v1.1.0</span>
            </div>
        </aside>
    );
}

// ThemeToggle removed

