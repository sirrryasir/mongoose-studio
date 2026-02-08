
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Filter, Plus, X } from "lucide-react";

interface QueryBuilderProps {
    fields: { path: string, type: string }[];
    onApply: (query: string) => void;
}

type Operator = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$regex' | '$in';

interface Condition {
    id: string;
    field: string;
    operator: Operator;
    value: string;
}

const OPERATORS: { value: Operator, label: string }[] = [
    { value: '$eq', label: 'Equals (=)' },
    { value: '$ne', label: 'Not Equals (!=)' },
    { value: '$regex', label: 'Contains (Regex)' },
    { value: '$gt', label: 'Greater Than (>)' },
    { value: '$gte', label: 'Greater/Equal (>=)' },
    { value: '$lt', label: 'Less Than (<)' },
    { value: '$lte', label: 'Less/Equal (<=)' },
    { value: '$in', label: 'In List (comma sep)' },
];

export function QueryBuilder({ fields, onApply }: QueryBuilderProps) {
    const [open, setOpen] = useState(false);
    const [conditions, setConditions] = useState<Condition[]>([]);

    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                id: Math.random().toString(36).substr(2, 9),
                field: fields[0]?.path || '',
                operator: '$eq',
                value: ''
            }
        ]);
    };

    const removeCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const updateCondition = (id: string, key: keyof Condition, val: string | Operator) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, [key]: val } : c));
    };

    const handleApply = () => {
        if (conditions.length === 0) {
            onApply("");
            setOpen(false);
            return;
        }

        const queryObj: Record<string, unknown> = {};

        conditions.forEach(c => {
            if (!c.field || !c.value) return;

            let val: string | number | boolean | unknown[] = c.value;
            // Type conversion attempt
            const fieldDef = fields.find((f) => f.path === c.field);
            if (fieldDef?.type === 'Number') {
                const num = Number(c.value);
                if (!isNaN(num)) val = num;
            } else if (fieldDef?.type === 'Boolean') {
                if (c.value === 'true') val = true;
                if (c.value === 'false') val = false;
            }

            if (c.operator === '$in') {
                const list = c.value.split(',').map(s => s.trim());
                if (fieldDef?.type === 'Number') {
                    val = list.map((v) => {
                        const n = Number(v);
                        return isNaN(n) ? v : n;
                    });
                } else {
                    val = list;
                }
            }

            if (c.operator === '$eq') {
                // Simple equality can be implicit, but let's be explicit or just use direct value for exact match logic?
                // Actually standard mongo is { field: value } for eq.
                // But we can use { field: { $eq: value } } too.
                queryObj[c.field] = val;
            } else {
                if (!queryObj[c.field]) queryObj[c.field] = {};
                // Use operator
                // Warning: merging multiple operators on same field needs care, currently simple overwrite or merge
                const fieldObj = queryObj[c.field] as Record<string, unknown>;

                if (typeof fieldObj === 'object' && fieldObj !== null) {
                    fieldObj[c.operator] = val;
                } else {
                    // If it was already set as a direct value (implied eq), convert to object
                    const existing = queryObj[c.field];
                    queryObj[c.field] = { $eq: existing, [c.operator]: val };
                }
            }
        });

        onApply(JSON.stringify(queryObj, null, 2));
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50">
                    <Filter className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Filter Query Builder</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Construct query visually. Combines conditions with AND.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {conditions.length === 0 && (
                        <div className="text-center py-8 text-zinc-600 italic text-sm border border-dashed border-zinc-800 rounded-lg">
                            No active filters. Click &quot;Add Condition&quot; to start.
                        </div>
                    )}

                    {conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded border border-zinc-800 group animate-in fade-in slide-in-from-left-2">
                            <Select value={condition.field} onValueChange={(v) => updateCondition(condition.id, 'field', v)}>
                                <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900 border-zinc-700">
                                    <SelectValue placeholder="Field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fields.map(f => (
                                        <SelectItem key={f.path} value={f.path}>{f.path} <span className="text-zinc-500 text-[10px]">({f.type})</span></SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={condition.operator} onValueChange={(v) => updateCondition(condition.id, 'operator', v as Operator)}>
                                <SelectTrigger className="w-[140px] h-8 text-xs bg-zinc-900 border-zinc-700">
                                    <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATORS.map(op => (
                                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                                className="h-8 text-xs flex-1 bg-zinc-900 border-zinc-700"
                                placeholder="Value..."
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-50 group-hover:opacity-100 transition-all"
                                onClick={() => removeCondition(condition.id)}
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
                    <Button variant="ghost" size="sm" onClick={addCondition} className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Condition
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleApply} size="sm" className="bg-white text-black hover:bg-zinc-200">Apply Filter</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
