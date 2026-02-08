"use client";
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MongooseDoc } from '@/types';

import { Database, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';

import { Toolbar } from './Toolbar';
import { SmartGridLite } from './SmartGridLite';
import { VisualFilterBar } from './VisualFilterBar';
import { AggregationBuilder } from './AggregationBuilder';
import { DocumentSheet } from './DocumentSheet';
import { toast } from 'sonner';
import { useTabStore } from '@/store/useTabStore';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useModelData } from '@/hooks/useModelData';
import { useModelCRUD } from '@/hooks/useModelCRUD';

interface ModelViewProps {
    modelName: string;
    previewId?: string | null;
}

export function ModelView({ modelName, previewId }: ModelViewProps) {
    const { openTab, updateTab } = useTabStore();

    const {
        page, setPage,
        filterStr,
        debouncedFilter,
        limit,
        docs,
        meta,
        fields,
        isLoading,
        error,
        applyFilter,
        refreshData,
        sheetDoc,
        setSheetDoc,
        sort,
        setSort
    } = useModelData(modelName);

    // Effect to handle deep linking (previewId)
    useEffect(() => {
        if (previewId) {
            // Check if we already have the doc in current view
            const existing = docs.find(d => d._id === previewId);
            if (existing) {
                setSheetDoc(existing);
                // Clear the previewId so it doesn't re-trigger or stick if we close
                updateTab(`model-${modelName}`, { previewId: null });
            } else {
                // Fetch individually
                fetch(`/api/models/${modelName}/${previewId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data) {
                            setSheetDoc(data);
                        } else {
                            toast.error("Document not found");
                        }
                    })
                    .catch(() => toast.error("Failed to load preview document"))
                    .finally(() => {
                        // Clear previewId
                        updateTab(`model-${modelName}`, { previewId: null });
                    });
            }
        }
    }, [previewId, docs, modelName, setSheetDoc, updateTab]);

    const {
        deleteId, setDeleteId,
        isCreating, setIsCreating,
        handleDelete,
        handleUpdateCell,
        handleCreate,
        handleSaveSheet,
        handleDeleteAll
    } = useModelCRUD(modelName, page, limit, debouncedFilter);

    const handleNavigate = (id: string, fieldPath: string) => {
        // Find the field definition
        const field = fields.find((f) => f.path === fieldPath);

        if (field && field.ref) {
            const refModel = field.ref;
            openTab({
                id: `model-${refModel}`,
                type: 'model',
                name: refModel,
                previewId: id
            });
            toast.success(`Navigating to ${refModel}`);
        } else {
            navigator.clipboard.writeText(id);
            toast.success("ID copied (No Ref found)");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                <p className="text-sm">Loading {modelName}...</p>
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

    return (
        <div className="flex flex-col h-full relative bg-zinc-950">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight text-white">{modelName} <span className="text-xs font-normal text-zinc-500 ml-1">({meta.total} docs)</span></h1>
                    <Button onClick={() => setIsCreating(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3 text-xs font-medium shadow-lg shadow-emerald-900/20">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> New Document
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <VisualFilterBar
                        filterStr={filterStr}
                        fields={fields}
                        onApply={(q) => {
                            applyFilter(q);
                            toast.success("Filter updated");
                        }}
                    />

                    <AggregationBuilder modelName={modelName} />

                    <Toolbar
                        modelName={modelName}
                        onRefresh={refreshData}
                        onDeleteAll={handleDeleteAll}
                    />

                    <div className="w-px h-6 bg-zinc-800"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 mr-2">
                            Page {page} of {meta.pages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 w-8 border-zinc-800 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p: number) => Math.min(meta.pages, p + 1))}
                            disabled={page === meta.pages || meta.pages === 0}
                            className="h-8 w-8 border-zinc-800 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-hidden p-6 bg-zinc-950/50 flex flex-col">
                {docs.length === 0 && !isCreating ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 pb-20">
                        <Database className="w-12 h-12 mb-4 opacity-20" />
                        <p className="mb-4">No documents found.</p>
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white"
                        >
                        </Button>
                    </div>
                ) : (
                    <SmartGridLite
                        docs={docs}
                        fields={fields}
                        onUpdateCell={handleUpdateCell}
                        onEdit={(doc) => setSheetDoc(doc)}
                        onDelete={(id) => setDeleteId(id)}
                        onCreate={async (data) => {
                            await handleCreate(data);
                            setIsCreating(false);
                        }}
                        isCreating={isCreating}
                        onCancelCreate={() => setIsCreating(false)}
                        onNavigate={handleNavigate}
                        sort={sort}
                        onSort={setSort}
                    />
                )}

                {/* Side Panel Sheet */}
                {sheetDoc && (
                    <DocumentSheet
                        open={!!sheetDoc}
                        onOpenChange={(open) => {
                            if (!open) {
                                setSheetDoc(null);
                            }
                        }}
                        doc={sheetDoc}
                        modelName={modelName}
                        fields={fields} // Pass fields explicitly
                        onSave={async (data) => {
                            await handleSaveSheet({ ...sheetDoc, ...data } as MongooseDoc); // Type assertion safely
                        }}
                        onDelete={async (id) => {
                            try {
                                // Manual fetch delete as we don't have direct access to reuse handleDelete easily without passing ID, 
                                // but we can just use the internal logic if we exposed a generic delete.
                                // However, the sheet delete might need to close the sheet too.
                                const res = await fetch(`/api/models/${modelName}/${id}`, { method: 'DELETE' });
                                if (!res.ok) throw new Error("Failed");
                                refreshData(); // Simple refresh
                            } catch (e) { throw e; }
                        }}
                    />
                )}

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this document.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
