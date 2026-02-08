"use client";

import { useState } from 'react';
import { Download, Sprout, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ToolbarProps {
    modelName: string;
    onRefresh: () => void;
    onDeleteAll?: () => void;
}

export function Toolbar({ modelName, onRefresh, onDeleteAll }: ToolbarProps) {
    const [seeding, setSeeding] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleSeed = async () => {
        setSeeding(true);
        const promise = fetch(`/api/models/${modelName}/seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: 10 })
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to seed");
            onRefresh();
            return { count: 10 };
        });

        toast.promise(promise, {
            loading: `Seeding ${modelName}...`,
            success: (data: { count: number }) => `Successfully added ${data.count} documents to ${modelName}`,
            error: "Failed to seed data",
        });

        try {
            await promise;
        } catch {
            // Error handled by toast
        } finally {
            setSeeding(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        onRefresh();
        toast.success("Refreshed data");
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleExport = (format: 'json' | 'csv') => {
        window.open(`/api/models/${modelName}/export?format=${format}`, '_blank');
        toast.info(`Exporting ${modelName} as ${format.toUpperCase()}...`);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-md">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExport('json')}
                    className="h-7 w-auto px-2 text-zinc-400 hover:text-white text-xs space-x-1"
                    title="Export JSON"
                >
                    <Download className="w-3.5 h-3.5" /> <span className="font-medium">JSON</span>
                </Button>
                <div className="w-px h-4 bg-zinc-800"></div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExport('csv')}
                    className="h-7 w-auto px-2 text-zinc-400 hover:text-white text-xs space-x-1"
                    title="Export CSV"
                >
                    <Download className="w-3.5 h-3.5" /> <span className="font-medium">CSV</span>
                </Button>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        disabled={seeding}
                        className="h-9 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20"
                    >
                        {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sprout className="w-3.5 h-3.5 mr-1.5" />}
                        Seed Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Generate Mock Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will add 10 random documents to the <span className="font-mono text-foreground">{modelName}</span> collection.
                            Use this for testing purposes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSeed} variant="emerald">Generate Data</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="h-9 w-9 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                title="Refresh"
            >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>

            <div className="w-px h-4 bg-zinc-800"></div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-red-950/20"
                        title="Delete All Documents"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Documents?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all documents in the <span className="font-mono text-foreground">{modelName}</span> collection.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-zinc-400 mb-2">Type <span className="font-mono text-white font-bold">{modelName}</span> to confirm:</p>
                        <input
                            id="confirm-delete"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            placeholder={modelName}
                            onChange={(e) => {
                                const btn = document.getElementById('btn-confirm-delete');
                                if (btn) {
                                    (btn as HTMLButtonElement).disabled = e.target.value !== modelName;
                                }
                            }}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            id="btn-confirm-delete"
                            disabled
                            onClick={onDeleteAll}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
