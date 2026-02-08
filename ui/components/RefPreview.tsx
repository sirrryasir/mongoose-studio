"use client";

import useSWR from "swr";
import { Loader2, ExternalLink } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { MongooseDoc } from "@/types";

interface RefPreviewProps {
    modelName: string;
    id: string;
    onNavigate?: (id: string) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RefPreview({ modelName, id, onNavigate }: RefPreviewProps) {
    const { data, error, isLoading } = useSWR<{ doc: MongooseDoc }>(
        `/api/models/${modelName}/${id}`,
        fetcher
    );

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Navigate on click
                        if (onNavigate) onNavigate(id);
                    }}
                    className="inline-flex items-center gap-1 cursor-pointer group bg-transparent border-0 p-0 outline-none focus:ring-0"
                >
                    <span className="truncate font-mono px-1.5 py-0.5 rounded text-[10px] transition-colors border text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20 flex items-center gap-1 max-w-[150px]">
                        {id}
                        <ExternalLink className="w-3 h-3 text-blue-400 opacity-50 group-hover:opacity-100" />
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden z-[101]" onClick={(e) => e.stopPropagation()}>
                {/* Content same as before */}
                <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">{modelName} Preview</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{id}</span>
                    </div>
                </div>

                <div className="p-3 max-h-[300px] overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4 text-zinc-500 gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Loading data...</span>
                        </div>
                    ) : error ? (
                        <div className="text-xs text-red-400 py-2">
                            Failed to load document. It may have been deleted.
                        </div>
                    ) : (
                        <pre className="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
                            {JSON.stringify(data?.doc, null, 2)}
                        </pre>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
