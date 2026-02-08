"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Code, Filter, AlertCircle } from "lucide-react";
import { QueryBuilder } from "./QueryBuilder";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VisualFilterBarProps {
    filterStr: string;
    onApply: (query: string) => void;
    fields: { path: string, type: string }[];
}

type Mode = 'visual' | 'raw';

// Helper types for parsing
type Operator = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$regex' | '$in';
interface Condition {
    id: string;
    field: string;
    operator: Operator;
    value: string;
}

const parseQuery = (json: string): Condition[] | null => {
    if (!json || json === '{}') return [];
    try {
        const obj = JSON.parse(json);
        const conditions: Condition[] = [];

        // We only support a specific subset of queries for Visual Mode:
        // 1. Top-level keys are fields (implicit AND)
        // 2. Values are either primitives (implicit $eq) or objects with simple operators
        // 3. No top-level $or, $and, etc.

        for (const [key, val] of Object.entries(obj)) {
            if (key.startsWith('$')) return null; // Top level operators not supported in simple view

            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                // Check operators
                const keys = Object.keys(val);
                for (const op of keys) {
                    if (!['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$regex', '$in'].includes(op)) {
                        return null; // Unsupported operator
                    }
                    conditions.push({
                        id: Math.random().toString(36).substr(2, 9),
                        field: key,
                        operator: op as Operator,
                        value: op === '$in' && Array.isArray((val as Record<string, unknown>)[op])
                            ? ((val as Record<string, unknown>)[op] as unknown[]).join(', ')
                            : String((val as Record<string, unknown>)[op])
                    });
                }
            } else {
                // Implicit $eq
                conditions.push({
                    id: Math.random().toString(36).substr(2, 9),
                    field: key,
                    operator: '$eq',
                    value: String(val)
                });
            }
        }
        return conditions;

    } catch {
        return null; // Invalid JSON
    }
};

export function VisualFilterBar({ filterStr, onApply, fields }: VisualFilterBarProps) {
    const [mode, setMode] = useState<Mode>('visual');
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [rawInput, setRawInput] = useState(filterStr);
    const [isValidJson, setIsValidJson] = useState(true);

    // Sync from props
    // Sync from props (Derived State Pattern)
    const [prevFilter, setPrevFilter] = useState(filterStr);
    if (filterStr !== prevFilter) {
        setPrevFilter(filterStr);
        setRawInput(filterStr);
        const parsed = parseQuery(filterStr);
        if (parsed !== null) {
            setConditions(parsed);
        } else {
            if (filterStr && filterStr !== '{}') {
                setMode('raw');
            } else {
                setConditions([]);
            }
        }
    }

    const handleRemoveCondition = (id: string) => {
        const newConditions = conditions.filter(c => c.id !== id);
        setConditions(newConditions);
        // Re-construct query
        applyConditions(newConditions);
    };

    const applyConditions = (conds: Condition[]) => {
        if (conds.length === 0) {
            onApply("");
            return;
        }

        const queryObj: Record<string, unknown> = {};
        conds.forEach(c => {
            let val: unknown = c.value;
            // Basic Type conversion
            const fieldDef = fields.find(f => f.path === c.field);
            if (fieldDef?.type === 'Number') {
                const num = Number(c.value);
                if (!isNaN(num)) val = num;
            } else if (fieldDef?.type === 'Boolean') {
                if (c.value === 'true') val = true;
                if (c.value === 'false') val = false;
            }

            if (c.operator === '$in') {
                val = c.value.split(',').map(s => s.trim());
                if (fieldDef?.type === 'Number') {
                    val = (val as string[]).map(v => {
                        const n = Number(v);
                        return isNaN(n) ? v : n;
                    });
                }
            }

            if (c.operator === '$eq') {
                queryObj[c.field] = val;
            } else {
                if (!queryObj[c.field]) queryObj[c.field] = {};
                // We know it's an object now
                const fieldObj = queryObj[c.field] as Record<string, unknown>;

                if (typeof fieldObj === 'object') {
                    fieldObj[c.operator] = val;
                } else {
                    // unexpected, but handle swap
                    const existing = queryObj[c.field];
                    queryObj[c.field] = { $eq: existing, [c.operator]: val };
                }
            }
        });
        onApply(JSON.stringify(queryObj, null, 2));
    };

    const handleRawChange = (val: string) => {
        setRawInput(val);
        try {
            if (!val) {
                setIsValidJson(true);
                return;
            }
            JSON.parse(val);
            setIsValidJson(true);
        } catch {
            setIsValidJson(false);
        }
    };

    const handleApplyRaw = () => {
        if (!isValidJson) {
            toast.error("Invalid JSON");
            return;
        }
        onApply(rawInput);
        // Try to switch back to visual if possible?
        const parsed = parseQuery(rawInput);
        if (parsed) {
            setMode('visual');
        }
    };

    const handleClear = () => {
        onApply("");
        setRawInput("");
        setConditions([]);
        setMode('visual');
    };

    if (mode === 'raw') {
        return (
            <div className="flex items-center gap-2 flex-1 w-full relative">
                <div className="relative flex-1">
                    <Code className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                        value={rawInput}
                        onChange={e => handleRawChange(e.target.value)}
                        placeholder={`Raw JSON Query...`}
                        className={cn(
                            "h-9 pl-9 w-full text-xs font-mono bg-zinc-900/50 border-zinc-800",
                            !isValidJson && "border-red-500/50 focus-visible:border-red-500"
                        )}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApplyRaw();
                        }}
                    />
                    {!isValidJson && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                            <AlertCircle className="w-4 h-4" />
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleApplyRaw} disabled={!isValidJson} className="h-9">
                    Apply
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900" onClick={() => {
                                const parsed = parseQuery(rawInput);
                                if (parsed) setMode('visual');
                                else toast.warning("Query too complex for Visual Mode");
                            }}>
                                <Filter className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Switch to Visual Mode</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 flex-1 w-full bg-zinc-900/30 border border-zinc-800 rounded-md px-2 h-9 overflow-hidden">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />

            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {conditions.length === 0 ? (
                    <span className="text-zinc-500 text-xs italic">No filters active</span>
                ) : (
                    conditions.map(c => (
                        <Badge key={c.id} variant="secondary" className="h-6 px-1.5 text-[10px] font-normal bg-zinc-800 hover:bg-zinc-700 flex items-center gap-1">
                            <span className="font-semibold text-emerald-400">{c.field}</span>
                            <span className="text-zinc-400">{c.operator === '$eq' ? '=' : c.operator}</span>
                            <span className="max-w-[100px] truncate" title={c.value}>{c.value}</span>
                            <button onClick={() => handleRemoveCondition(c.id)} className="ml-1 text-zinc-500 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))
                )}
            </div>

            <div className="flex items-center gap-1 bg-zinc-950/50 border-l border-zinc-800 pl-1">
                <QueryBuilder fields={fields} onApply={(q) => {
                    // Try to parse the new query
                    const newConditions = parseQuery(q);

                    if (newConditions && newConditions.length > 0) {
                        // If valid simple query, we can try to MERGE it or just REPLACE it.
                        // Since QueryBuilder is currently "construct from scratch", replace is safer logic-wise 
                        // but from UX perspective, if I already had filters, I might expect append?
                        // But QueryBuilder starts empty. So let's stick to Replace for now as per "Add Filter" usually implies "New Filter Set" in this specific UI context
                        // OR we parse current `filterStr` and append?
                        // Let's do a smart append if possible.
                        const current = parseQuery(filterStr) || [];
                        const merged = [...current, ...newConditions];
                        // Deduplicate by field? Maybe not, you might want age > 10 AND age < 20.
                        applyConditions(merged);
                    } else {
                        // Complex query, just apply raw
                        onApply(q);
                    }
                }} />

                {conditions.length > 0 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400" onClick={handleClear}>
                        <X className="w-3.5 h-3.5" />
                    </Button>
                )}

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-emerald-400" onClick={() => setMode('raw')}>
                                <Code className="w-3.5 h-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Raw JSON</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

