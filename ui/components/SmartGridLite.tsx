/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
"use no memo"; // Opt-out of React Compiler for this component due to incompatible external library (TanStack Virtual)

import { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, X, Pencil, Trash, Calendar as CalendarIcon, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { FieldInfo, MongooseDoc } from "@/types";
import { RefPreview } from "./RefPreview";

interface SmartGridLiteProps {
    docs: MongooseDoc[];
    fields: FieldInfo[];
    onUpdateCell: (id: string, path: string, value: unknown) => Promise<void>;
    sort?: { field: string, order: number };
    onSort?: (field: string) => void;
    onEdit: (doc: MongooseDoc) => void;
    onDelete: (id: string) => void;
    onCreate?: (data: Partial<MongooseDoc>) => Promise<void>;
    isCreating?: boolean;
    onCancelCreate?: () => void;
    onNavigate?: (id: string, field: string) => void;
}

export function SmartGridLite({ docs, fields, onUpdateCell,
    onEdit,
    onDelete,
    onCreate,
    isCreating,
    onCancelCreate,
    onNavigate,
    sort,
    onSort
}: SmartGridLiteProps) {
    // Columns: Use fields if available, otherwise strict fallback to docs keys
    // We prefer 'fields' to ensure consistent column order and show fields even if empty in current docs
    const columnKeys = fields.length > 0
        ? fields.map(f => f.path).filter(p => p !== '__v')
        : (docs.length > 0 ? Object.keys(docs[0]).filter(k => k !== '__v') : []);

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: docs.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 45, // Approximation
        overscan: 5,
    });

    const [editingCell, setEditingCell] = useState<{ id: string, field: string, value: unknown } | null>(null);

    // Inline Creation State
    const [newDoc, setNewDoc] = useState<Partial<MongooseDoc>>({});

    const handleSave = async () => {
        if (!editingCell) return;
        await onUpdateCell(editingCell.id, editingCell.field, editingCell.value);
        setEditingCell(null);
    };

    const handleCreate = async () => {
        if (!onCreate) return;
        try {
            await onCreate(newDoc);
            setNewDoc({});
            // onCancelCreate will be called by parent after success if needed, 
            // but usually we might want to keep the row open or close it. 
            // Usually valid to close it. The parent `handleCreate` in ModelView will set isCreating(false).
            toast.success("Document created successfully");
        } catch (e) {
            toast.error("Failed to create document: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    // Helper to get field type
    const getFieldType = (path: string) => fields.find(f => f.path === path)?.type || 'String';

    return (
        <div ref={parentRef} className="border border-zinc-800 rounded-lg overflow-auto bg-zinc-900 shadow-sm relative h-full">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                <table className="min-w-full text-left text-sm text-zinc-400 absolute top-0 left-0 w-full" style={{ transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px)` }}>
                    <thead className="bg-zinc-800 text-zinc-200 sticky top-0 z-20 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 border-b border-zinc-700 w-[50px] bg-zinc-800">#</th>
                            <th className="px-4 py-3 border-b border-zinc-700 w-[80px] bg-zinc-800">Actions</th>
                            {columnKeys.map(col => {
                                const isSorted = sort?.field === col;
                                return (
                                    <th
                                        key={col}
                                        className={cn(
                                            "px-4 py-3 font-medium border-b border-zinc-700 whitespace-nowrap min-w-[150px] bg-zinc-800 cursor-pointer hover:bg-zinc-700/80 hover:text-white transition-colors select-none",
                                            isSorted && "text-emerald-500"
                                        )}
                                        onClick={() => onSort?.(col)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col}
                                            <span className="text-[10px] text-zinc-500 font-normal ml-auto flex items-center">
                                                {isSorted && (sort?.order === -1 ? "↓" : "↑")}
                                                <span className="ml-1">({getFieldType(col)})</span>
                                            </span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {/* Inline Creation Row */}
                        {onCreate && isCreating && (
                            <tr className="bg-emerald-950/20 hover:bg-emerald-950/30 transition-colors border-b-2 border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                                <td className="px-4 py-2 border-r border-zinc-800/30 text-emerald-500 font-mono text-xs font-bold">
                                    +
                                </td>
                                <td className="px-4 py-2 border-r border-zinc-800/30">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                            onClick={handleCreate}
                                            title="Save New Document"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-zinc-500 hover:text-zinc-400"
                                            onClick={() => {
                                                setNewDoc({});
                                                onCancelCreate?.();
                                            }}
                                            title="Cancel"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </td>
                                {columnKeys.map(col => {
                                    if (col === '_id' || col === '__v' || col === 'createdAt' || col === 'updatedAt') {
                                        return <td key={`new-${col}`} className="px-4 py-2 border-r border-zinc-800/30 text-zinc-600 italic text-xs">Auto-generated</td>;
                                    }
                                    return (
                                        <td key={`new-${col}`} className="px-4 py-1.5 border-r border-zinc-800/30 bg-zinc-900/50">
                                            <SmartInput
                                                type={getFieldType(col)}
                                                value={newDoc[col]}
                                                onChange={(val: unknown) => setNewDoc({ ...newDoc, [col]: val })}
                                                placeholder="Enter value..."
                                                autoFocus={false}
                                                onEnter={handleCreate}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        )}

                        {/* Existing Docs - Virtualized */}
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const doc = docs[virtualRow.index] as MongooseDoc;
                            const i = virtualRow.index;
                            return (
                                <tr
                                    key={doc._id || virtualRow.key}
                                    data-index={virtualRow.index}
                                    ref={rowVirtualizer.measureElement}
                                    className="hover:bg-zinc-800/50 transition-colors group h-[45px]"
                                >
                                    <td className="px-4 py-1 border-r border-zinc-800/30 text-zinc-600 font-mono text-xs">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-1 flex items-center gap-1 border-r border-zinc-800/30 h-full">
                                        <Button
                                            onClick={() => onEdit(doc)}
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10"
                                            title="Open Details (Side Panel)"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5 rotate-45" />
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(doc._id)}
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                                            title="Delete Document"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </Button>
                                    </td>

                                    {columnKeys.map(col => {
                                        const isEditing = editingCell?.id === doc._id && editingCell?.field === col;
                                        return (
                                            <td
                                                key={`${doc._id}-${col}`}
                                                onDoubleClick={() => {
                                                    if (col === '_id' || col === 'createdAt' || col === 'updatedAt') return;
                                                    setEditingCell({ id: doc._id, field: col, value: doc[col] });
                                                }}
                                                className="px-4 py-2.5 max-w-[300px] truncate border-r border-zinc-800/30 last:border-r-0 font-mono text-xs cursor-text relative"
                                            >
                                                {isEditing ? (
                                                    <div className="absolute inset-0 z-10 bg-zinc-900 border-2 border-emerald-500/50 flex items-center px-1 animate-in fade-in zoom-in-95 duration-100">
                                                        <SmartInput
                                                            type={getFieldType(col)}
                                                            value={editingCell.value}
                                                            onChange={(val) => setEditingCell({ ...editingCell, value: val })}
                                                            onEnter={handleSave}
                                                            autoFocus
                                                        />
                                                        <div className="flex ml-1 bg-zinc-900">
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-500 hover:text-emerald-400" onClick={handleSave}>
                                                                <Check className="w-3 h-3" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-400" onClick={() => setEditingCell(null)}>
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <CellRenderer
                                                        value={doc[col]}
                                                        field={col}
                                                        type={getFieldType(col)}
                                                        fieldInfo={fields.find(f => f.path === col)}
                                                        onNavigate={onNavigate}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface SmartInputProps {
    type: string;
    value: unknown;
    onChange: (value: unknown) => void;
    placeholder?: string;
    autoFocus?: boolean;
    onEnter?: () => void;
}

function SmartInput({ type, value, onChange, placeholder, autoFocus, onEnter }: SmartInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onEnter?.();
    };

    if (type === 'Boolean') {
        return (
            <Select
                value={value === undefined ? "null" : String(value)}
                onValueChange={(val: string) => {
                    if (val === "null") onChange(undefined);
                    else onChange(val === "true");
                }}
            >
                <SelectTrigger className="h-7 w-full text-xs border-zinc-700 bg-zinc-800/50 focus:ring-emerald-500/50">
                    <SelectValue placeholder="Select boolean" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="true" className="text-emerald-400">TRUE</SelectItem>
                    <SelectItem value="false" className="text-red-400">FALSE</SelectItem>
                    <SelectItem value="null" className="text-zinc-500">Null / Undefined</SelectItem>
                </SelectContent>
            </Select>
        );
    }

    if (type === 'Date') {
        const dateValue = value ? new Date(value as string | number) : undefined;
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full h-7 justify-start text-left font-normal text-xs border-zinc-700 bg-zinc-800/50",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {dateValue && !isNaN(dateValue.getTime()) ? format(dateValue, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                    <Calendar
                        mode="single"
                        selected={dateValue && !isNaN(dateValue.getTime()) ? dateValue : undefined}
                        onSelect={(date: Date | undefined) => onChange(date?.toISOString())}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Input
            autoFocus={autoFocus}
            className="h-7 text-xs bg-transparent border-transparent focus-visible:ring-0 focus-visible:border-transparent px-1 min-w-[50px] w-full"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
        />
    );
}




function CellRenderer({ value, field, type, fieldInfo, onNavigate }: { value: unknown, field: string, type: string, fieldInfo?: FieldInfo, onNavigate?: (id: string, field: string) => void }) {
    // ID & Ref Check
    const isRef = !!fieldInfo?.ref || (type === 'ObjectID' && field !== '_id');
    const isId = field === '_id';

    if (isId || (isRef && value) || type === 'ObjectID') {
        if (isRef && value && fieldInfo?.ref) {
            return <RefPreview modelName={fieldInfo.ref} id={String(value)} onNavigate={(id) => onNavigate?.(id, field)} />;
        }

        return <div className="flex items-center gap-1 group/id">
            <span
                className={cn(
                    "truncate font-mono px-1.5 py-0.5 rounded text-[10px] transition-colors border",
                    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20 cursor-copy"
                )}
                title="Click to copy"
                onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(String(value));
                    toast.success("ID copied to clipboard");
                }}
            >
                {String(value)}
            </span>
        </div>;
    }

    // Boolean Check
    if (type === 'Boolean' && typeof value === 'boolean') {
        return value ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TRUE
            </span>
        ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                FALSE
            </span>
        );
    }

    // Date Check
    if (type === 'Date' && value) {
        let validDate: Date | null = null;
        try {
            const d = new Date(value as string | number);
            if (!isNaN(d.getTime())) validDate = d;
        } catch { }

        if (validDate) {
            return <span className="text-zinc-400" title={validDate.toISOString()}>{format(validDate, "MMM d, yyyy HH:mm")}</span>;
        }
    }

    // Object/Array Check
    if (typeof value === 'object' && value !== null) {
        const isArray = Array.isArray(value);
        const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;

        // Optimization: Avoid JSON.stringify for preview on main thread 
        let preview = "";
        if (isEmpty) {
            preview = isArray ? "[]" : "{}";
        } else if (isArray) {
            preview = `[Array(${value.length})]`;
        } else {
            const keys = Object.keys(value);
            preview = `{ ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''} }`;
        }

        if (isEmpty) return <span className="text-zinc-600 italic text-[10px]">{preview}</span>;

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <span className="text-zinc-500 font-mono text-[10px] opacity-70 cursor-pointer hover:text-emerald-400 hover:opacity-100 transition-colors underline decoration-dotted underline-offset-2">
                        {preview}
                    </span>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4 bg-zinc-900 border-zinc-800 shadow-xl max-h-[400px] overflow-auto">
                    {/* Only stringify when popover is open (Radix renders conditionally if configured, but let's be safe) */}
                    {/* Actually Radix PopoverContent is conditionally rendered by default */}
                    <div className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(value, null, 2)}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    // Empty/Null
    if (value === undefined || value === null) {
        return <span className="text-zinc-700 italic text-[10px]">null</span>;
    }

    return <span className="text-zinc-300">{String(value)}</span>;
}


