import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { MongooseDoc, ModelResponse } from '@/types';

export function useModelCRUD(modelName: string, page: number, limit: number, debouncedFilter: string) {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Reuse the key logic to know what to mutate
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        query: debouncedFilter,
        // sort is also part of key but we don't have it here easily without passing it.
        // For optimistic updates, we might need a more robust key matching or just global mutate.
    });
    // We'll use a loose matcher or just rely on 'refreshData' being passed, but here we can try to invalidate.
    // Actually, swr mutate can take a matcher function.

    // NOTE: This key construction is imperfect because it doesn't include 'sort'.
    // ideally useModelCRUD should accept 'refreshData' or 'key' from useModelData.
    const key = `/api/models/${modelName}/data?${queryParams.toString()}`;

    const handleDelete = async (id: string) => {
        // Optimistic update
        await mutate(
            (key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`),
            async (currentData: ModelResponse | undefined) => {
                if (!currentData) return currentData;
                return {
                    ...currentData,
                    docs: currentData.docs.filter((d) => d._id !== id),
                    meta: { ...currentData.meta, total: currentData.meta.total - 1 }
                };
            },
            { revalidate: false }
        );

        try {
            const res = await fetch(`/api/models/${modelName}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Document deleted");
            // Trigger full revalidation
            mutate((key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`));
        } catch {
            toast.error("Failed to delete document");
            mutate((key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`)); // Revert
        } finally {
            setDeleteId(null);
        }
    };

    const handleUpdateCell = async (id: string, field: string, value: unknown) => {
        // Find doc
        // Note: We don't have access to 'docs' here unless passed, so we can't easily do granular optimistic updates 
        // without complex logic. We'll rely on server response or parent passing callback.
        // But we DO know the endpoint.
        try {
            const res = await fetch(`/api/models/${modelName}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value, _id: id }) // Minimal patch? No, usually Mongoose needs the doc or $set.
                // Our API likely expects the whole doc or we need a PATCH endpoint.
                // Checking routes/models.ts... PUT /:name/:id expects body to replace?
                // Actually the API implementation does `model.findByIdAndUpdate(id, body, { new: true })`.
                // So specific fields work fine.
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success("Updated");
            mutate((key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`));
        } catch {
            toast.error("Update failed");
        }
    };

    const handleCreate = async (doc: Partial<MongooseDoc>) => {
        try {
            const res = await fetch(`/api/models/${modelName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doc)
            });
            if (!res.ok) throw new Error("Failed to create");
            toast.success("Document created");
            setIsCreating(false);
            mutate((key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`));
        } catch {
            toast.error("Failed to create document");
        }
    };

    const handleSaveSheet = async (doc: MongooseDoc) => {
        const isNew = !doc._id;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `/api/models/${modelName}` : `/api/models/${modelName}/${doc._id}`;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc)
        });

        if (!res.ok) throw new Error("Failed to save");

        await mutate(
            (key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`)
        );
        toast.success(isNew ? "Document created" : "Document updated");
    };

    const handleDeleteAll = async () => {
        const res = await fetch(`/api/models/${modelName}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed to delete all");
        await mutate(
            (key) => typeof key === 'string' && key.startsWith(`/api/models/${modelName}/data`)
        );
        toast.success("All documents deleted");
    };

    return {
        key, // exposed for debugging or parent use
        deleteId, setDeleteId,
        isCreating, setIsCreating,
        handleDelete,
        handleUpdateCell,
        handleCreate,
        handleSaveSheet,
        handleDeleteAll
    };
}
