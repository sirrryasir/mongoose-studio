
"use client";

import Link from 'next/link';
import { Database, Box } from 'lucide-react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Sidebar() {
    const { data: models = [], error } = useSWR('/api/models', (url) => fetcher(url).then(res => res.models));
    const searchParams = useSearchParams();
    const currentModel = searchParams.get('model');

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <Image src="/logo.png" alt="Mongoose Studio Logo" className="w-6 h-6 object-contain" />
                <span className="font-bold text-emerald-50 tracking-tight">Mongoose Studio</span>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto flex-1">
                <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Models
                </div>

                {models.map((model: string) => (
                    <Link
                        key={model}
                        href={`/?model=${model}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${currentModel === model
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'hover:bg-zinc-800 hover:text-white'
                            }`}
                    >
                        <Box className="w-4 h-4 opacity-70" />
                        {model}
                    </Link>
                ))}

                {models.length === 0 && !error && (
                    <div className="px-3 py-2 text-sm text-zinc-600 italic">No models found</div>
                )}
                {error && (
                    <div className="px-3 py-2 text-sm text-red-500 italic">Failed to load models</div>
                )}
            </div>
        </aside>
    );
}
