
"use client";

import useSWR from 'swr';
import { Database } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ModelViewProps {
    modelName: string;
}

export function ModelView({ modelName }: ModelViewProps) {
    const { data, error, isLoading } = useSWR(`/api/models/${modelName}/data`, fetcher);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-zinc-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p>Loading documents...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-red-400">
                <p>Failed to load data for {modelName}</p>
            </div>
        );
    }

    const docs = data?.docs || [];
    const meta = data?.meta || { total: 0 };

    if (docs.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h1 className="text-xl font-bold text-white mb-1">{modelName}</h1>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                    <Database className="w-8 h-8 mb-2 opacity-50" />
                    <p>No documents found.</p>
                </div>
            </div>
        );
    }

    const columns = Object.keys(docs[0]).filter(k => k !== '__v');

    return (
        <div className="flex flex-col h-full">
            <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    {modelName} <span className="text-zinc-500 text-sm font-normal">({meta.total} docs)</span>
                </h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <div className="border border-zinc-800 rounded-lg overflow-x-auto bg-zinc-900 shadow-sm">
                    <table className="min-w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-800 text-zinc-200">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-4 py-3 font-medium border-b border-zinc-700 whitespace-nowrap min-w-[150px]">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {docs.map((doc: any, i: number) => (
                                <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                                    {columns.map(col => (
                                        <td key={`${i}-${col}`} className="px-4 py-3 max-w-[300px] truncate border-r border-zinc-800/30 last:border-r-0">
                                            {typeof doc[col] === 'object' ? JSON.stringify(doc[col]) : String(doc[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
