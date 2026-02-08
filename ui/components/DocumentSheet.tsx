"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Save, Trash2, Calendar as CalendarIcon, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldInfo, MongooseDoc } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog";

interface DocumentSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doc: MongooseDoc;
    modelName: string;
    onSave: (doc: MongooseDoc) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    fields: FieldInfo[];
}

export function DocumentSheet({ open, onOpenChange, doc, modelName, onSave, onDelete, fields }: DocumentSheetProps) {
    // Fallback: If no fields info provided (metadata missing), generate from doc keys
    const effectiveFields: FieldInfo[] = fields && fields.length > 0
        ? fields
        : (doc ? Object.keys(doc).map(key => ({ path: key, type: 'String', instance: 'String', required: false })) as FieldInfo[] : []);

    const [formData, setFormData] = useState<MongooseDoc>(doc || {});
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'form' | 'json'>('form');

    useEffect(() => {
        setFormData(doc || {});
    }, [doc]);

    const handleChange = (path: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [path]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(formData);
            onOpenChange(false);
            toast.success("Document saved successfully");
        } catch {
            toast.error("Failed to save document");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!doc._id) return;
        setLoading(true);
        try {
            await onDelete(doc._id);
            onOpenChange(false);
            toast.success("Document deleted");
        } catch {
            toast.error("Failed to delete document");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    // Helper to render input based on type
    const renderInput = (field: FieldInfo) => {
        const value = formData[field.path];

        if (field.path === '_id' || field.path === '__v' || field.path === 'createdAt' || field.path === 'updatedAt') {
            return (
                <div className="relative group">
                    <Input
                        disabled
                        value={String(value || '')}
                        className="bg-zinc-900/50 border-zinc-800 text-zinc-500 font-mono text-xs pr-8"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(String(value), field.path)}
                    >
                        <Copy className="w-3 h-3 text-zinc-500" />
                    </Button>
                </div>
            );
        }

        if (field.type === 'Boolean') {
            return (
                <div
                    className="flex items-center space-x-3 h-10 px-3 rounded-md bg-zinc-900/50 border border-zinc-800 cursor-pointer hover:bg-zinc-900/80 transition-colors group"
                    onClick={() => handleChange(field.path, !value)}
                >
                    <Switch
                        checked={!!value}
                        onCheckedChange={(checked: boolean) => handleChange(field.path, checked)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-600 border-2 border-transparent group-hover:border-zinc-500/30 transition-all"
                    />
                    <Label className="text-zinc-300 font-mono text-xs cursor-pointer flex-1 select-none">
                        {value ? 'True' : 'False'}
                    </Label>
                </div>
            );
        }

        if (field.type === 'Number') {
            return (
                <Input
                    type="number"
                    value={value as number || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(field.path, Number(e.target.value))}
                    className="bg-zinc-950 border-zinc-800 focus:border-emerald-500/50 transition-colors"
                />
            );
        }

        if (field.type === 'Date') {
            // Date Picker Logic
            const dateVal = value ? new Date(value as string) : undefined;

            return (
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal bg-zinc-950 border-zinc-800 text-xs",
                                    !dateVal && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                {dateVal ? format(dateVal, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800 z-[105]">
                            <Calendar
                                mode="single"
                                selected={dateVal}
                                onSelect={(d) => d && handleChange(field.path, d.toISOString())}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Input
                        type="time"
                        className="w-[100px] bg-zinc-950 border-zinc-800 text-xs"
                        value={dateVal ? format(dateVal, "HH:mm") : ""}
                        onChange={(e) => {
                            if (!dateVal) return;
                            const [h, m] = e.target.value.split(':');
                            const newDate = new Date(dateVal);
                            newDate.setHours(parseInt(h));
                            newDate.setMinutes(parseInt(m));
                            handleChange(field.path, newDate.toISOString());
                        }}
                    />
                </div>
            );
        }

        if (field.type === 'ObjectID' && field.ref) {
            return (
                <div className="relative">
                    <Input
                        value={value as string || ''}
                        onChange={(e) => handleChange(field.path, e.target.value)}
                        className="bg-zinc-950 border-zinc-800 font-mono text-xs text-emerald-400 focus:border-emerald-500/50"
                        placeholder={`ObjectId (${field.ref})`}
                    />
                    <div className="absolute right-3 top-2.5 text-[10px] text-zinc-600 pointer-events-none">
                        Ref: {field.ref}
                    </div>
                </div>
            );
        }

        // Default or JSON fallback
        if (field.instance === 'Array' || field.instance === 'Embedded') {
            return (
                <Textarea
                    value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '')}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        try {
                            handleChange(field.path, JSON.parse(e.target.value));
                        } catch {
                            // Allow typing types
                        }
                    }}
                    className="bg-zinc-950 border-zinc-800 font-mono text-xs min-h-[100px] focus:border-emerald-500/50"
                />
            );
        }

        return (
            <Input
                value={value as string || ''}
                onChange={(e) => handleChange(field.path, e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus:border-emerald-500/50"
            />
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[500px] sm:max-w-[600px] bg-zinc-950 border-l border-zinc-800 text-zinc-200 p-0 flex flex-col shadow-2xl">
                {/* Custom Header */}
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                                {modelName}
                            </span>
                            {doc._id && <span className="text-[10px] font-mono text-zinc-600">ID: {doc._id}</span>}
                        </div>
                        <SheetTitle className="text-white text-base font-semibold">
                            {doc._id ? 'Edit Document' : 'New Document'}
                        </SheetTitle>
                    </div>


                </div>

                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'form' | 'json')} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 py-2 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
                        <TabsList className="grid w-full max-w-[200px] grid-cols-2 h-8 bg-zinc-900 border border-zinc-800">
                            <TabsTrigger value="form" className="text-xs h-6 data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">Form</TabsTrigger>
                            <TabsTrigger value="json" className="text-xs h-6 data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">JSON</TabsTrigger>
                        </TabsList>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-zinc-500 hover:text-white gap-1.5"
                            onClick={() => copyToClipboard(JSON.stringify(formData, null, 2), "Document JSON")}
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copy JSON</span>
                        </Button>
                    </div>

                    <TabsContent value="form" className="flex-1 overflow-y-auto mt-0">
                        <div className="px-6 py-6 space-y-6 pb-24">
                            {effectiveFields.map(field => (
                                <div key={field.path} className="space-y-1.5">
                                    <Label className="text-zinc-500 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            {field.path}
                                            {field.required && <span className="text-red-500 text-[10px]" title="Required">*</span>}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] px-1.5 py-0.5 rounded border capitalize opacity-70",
                                            field.type === 'ObjectID' ? "text-blue-400 border-blue-500/30" :
                                                field.type === 'Date' ? "text-purple-400 border-purple-500/30" :
                                                    field.type === 'Boolean' ? "text-orange-400 border-orange-500/30" :
                                                        "text-zinc-500 border-zinc-700"
                                        )}>
                                            {field.type}
                                        </span>
                                    </Label>
                                    {renderInput(field)}
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="json" className="flex-1 overflow-hidden mt-0 relative">
                        <Textarea
                            className="w-full h-full resize-none bg-zinc-950 border-0 font-mono text-xs p-4 text-zinc-300 focus-visible:ring-0"
                            value={JSON.stringify(formData, null, 2)}
                            onChange={(e) => {
                                try {
                                    setFormData(JSON.parse(e.target.value));
                                } catch { }
                            }}
                        />
                    </TabsContent>
                </Tabs>

                <SheetFooter className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 flex flex-row items-center justify-between sm:flex-row sm:space-x-0 z-20">
                    <div>
                        {doc._id && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-2 text-xs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-950 border-zinc-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-zinc-100">Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-400">
                                            This action cannot be undone. This will permanently delete the document with ID <span className="font-mono text-zinc-300">{doc._id}</span>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white h-8 text-xs">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 h-8 text-xs px-4">
                            {loading ? <span className="animate-pulse">Saving...</span> : (
                                <>
                                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
