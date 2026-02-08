"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, X } from "lucide-react";
import { toast } from "sonner";
import JSON5 from 'json5';

interface Stage {
    stage: string;
    value: string;
}

const STAGES = ["$match", "$group", "$sort", "$project", "$limit", "$unwind", "$lookup", "$addFields", "$count"];

export function AggregationBuilder({ modelName }: { modelName: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pipeline, setPipeline] = useState<Stage[]>([]);
    const [results, setResults] = useState<unknown[] | null>(null);

    const addStage = (stage: string) => {
        setPipeline([...pipeline, { stage, value: stage === '$lookup' ? '{\n  from: "",\n  localField: "",\n  foreignField: "",\n  as: ""\n}' : '{}' }]);
    };

    const removeStage = (index: number) => {
        const newPipeline = [...pipeline];
        newPipeline.splice(index, 1);
        setPipeline(newPipeline);
    };

    const updateStageValue = (index: number, value: string) => {
        const newPipeline = [...pipeline];
        newPipeline[index].value = value;
        setPipeline(newPipeline);
    };

    const runAggregation = async () => {
        setLoading(true);
        setResults(null);
        try {
            // Construct pipeline array
            const finalPipeline = pipeline.map(p => {
                try {
                    // Use JSON5 for loose parsing
                    const parsed = JSON5.parse(p.value);
                    return { [p.stage]: parsed };
                } catch {
                    throw new Error(`Invalid JSON (or JS Object) in stage ${p.stage}`);
                }
            });

            const res = await fetch(`/api/models/${modelName}/aggregate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPipeline)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Aggregation failed");

            setResults(data.docs);
            toast.success(`Aggregation successful. ${data.docs.length} docs found.`);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800">
                    Aggregation
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[800px] sm:w-[900px] bg-zinc-950 border-l border-zinc-800 text-zinc-200 flex flex-col p-0 gap-0">
                <SheetHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <SheetTitle className="text-white flex items-center justify-between">
                        <span>Aggregation Pipeline <span className="text-zinc-500 font-normal text-sm ml-2">({modelName})</span></span>
                        <div className="flex gap-2 mr-8">
                            <Button size="sm" onClick={runAggregation} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                <Play className="w-4 h-4 mr-2" />
                                {loading ? "Running..." : "Run"}
                            </Button>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Pipeline Editor */}
                    <div className="w-1/2 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {pipeline.map((item, idx) => (
                                    <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shadow-sm">
                                        <div className="bg-zinc-800/50 px-3 py-2 flex items-center justify-between border-b border-zinc-800">
                                            <span className="font-mono text-xs font-bold text-emerald-400">{item.stage}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-red-400" onClick={() => removeStage(idx)}>
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="p-0">
                                            <textarea
                                                className="w-full bg-zinc-950/30 text-xs font-mono p-3 text-zinc-300 focus:outline-none resize-none min-h-[80px]"
                                                value={item.value}
                                                onChange={(e) => updateStageValue(idx, e.target.value)}
                                                spellCheck={false}
                                                placeholder="{}"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Add Stage</p>
                                <div className="flex flex-wrap gap-2">
                                    {STAGES.map(stage => (
                                        <Button
                                            key={stage}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addStage(stage)}
                                            className="h-7 text-xs border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 hover:text-white text-zinc-400"
                                        >
                                            {stage}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Results View */}
                    <div className="w-1/2 flex flex-col bg-zinc-900/10">
                        <div className="p-2 border-b border-zinc-800 bg-zinc-900/30 text-xs font-mono text-zinc-500 flex justify-between">
                            <span>Output Preview</span>
                            <span>{results ? `${results.length} results` : ""}</span>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            {results ? (
                                <div className="space-y-2">
                                    {results.map((doc, i) => (
                                        <div key={i} className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all shadow-sm">
                                            {JSON.stringify(doc, null, 2)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                                    No results to show
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
