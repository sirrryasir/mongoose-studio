"use client";
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MongooseDoc, FieldInfo } from '@/types';

interface DocumentFormProps {
    modelName: string;
    initialData?: MongooseDoc;
    schema?: FieldInfo[];
    onSave?: (data: MongooseDoc) => Promise<void> | void;
    onCancel: () => void;
    onSuccess?: () => void; // Legacy support if needed, but we prefer onSave
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function DocumentForm({ modelName, initialData, onSave, onCancel, schema, onSuccess }: DocumentFormProps) {
    const isEdit = !!initialData;
    // We can use the passed schema or fetch it if needed. Prioritize passed schema.
    const { data: schemaData, isLoading: schemaLoading } = useSWR(`/api/models/${modelName}`, fetcher);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<MongooseDoc>(initialData || { _id: '' } as any);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fields = schema && schema.length > 0 ? schema : (schemaData?.fields || []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (onSave) {
                await onSave(formData);
            } else {
                // Fallback legacy logic
                const url = isEdit
                    ? `/api/models/${modelName}/${initialData?._id}`
                    : `/api/models/${modelName}`;
                const method = isEdit ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to save document');

                if (onSuccess) onSuccess();
            }

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    }, [formData, isEdit, modelName, initialData, onSave, onSuccess]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSubmit]);

    const handleChange = (path: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [path]: value }));
    };

    if (schemaLoading && fields.length === 0) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-white">
                        {isEdit ? `Edit ${modelName} Document` : `New ${modelName} Document`}
                    </h2>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {fields.map((field: FieldInfo) => {
                            if (field.path === '_id' && !isEdit) return null;
                            if (field.path === '_id') {
                                return (
                                    <div key={field.path} className="space-y-1 opacity-50">
                                        <label className="text-xs font-mono text-zinc-500 uppercase">{field.path}</label>
                                        <input type="text" value={String(formData[field.path] || '')} disabled className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-500 text-sm font-mono" />
                                    </div>
                                )
                            }

                            return (
                                <div key={field.path} className="space-y-1">
                                    <label className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-2">
                                        {field.path}
                                        {field.required && <span className="text-red-400">*</span>}
                                        <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-zinc-800 rounded">{field.type}</span>
                                    </label>

                                    <FieldInput
                                        field={field}
                                        value={formData[field.path]}
                                        onChange={(val) => handleChange(field.path, val)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </form>

                <footer className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Create Document'}
                    </button>
                </footer>
            </div>
        </div>
    );
}

function FieldInput({ field, value, onChange }: { field: FieldInfo, value: unknown, onChange: (val: unknown) => void }) {
    const type = field.type;

    if (type === 'Boolean') {
        return (
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={cn(
                        "px-3 py-1.5 text-xs rounded border transition-colors",
                        value === true
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-zinc-900 border-zinc-700 text-zinc-500"
                    )}
                >
                    True
                </button>
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={cn(
                        "px-3 py-1.5 text-xs rounded border transition-colors",
                        value === false
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : "bg-zinc-900 border-zinc-700 text-zinc-500"
                    )}
                >
                    False
                </button>
            </div>
        );
    }

    if (type === 'Date') {
        const dateValue = value ? new Date(value as string).toISOString().substring(0, 16) : '';
        return (
            <input
                type="datetime-local"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={dateValue}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (type === 'Number') {
        return (
            <input
                type="number"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={value as number ?? ''}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
        );
    }

    return (
        <input
            type="text"
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-zinc-700"
            placeholder={field.defaultValue ? `Default: ${field.defaultValue}` : ''}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
