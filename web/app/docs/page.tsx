"use client";
import Link from "next/link";
import { Copy, Check, ChevronRight, Hash, Github } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Image src="/logo.png" alt="Mongoose Studio Logo" width={32} height={32} className="w-5 h-5" />
                        </div>
                        <span>Mongoose <span className="text-emerald-400">Studio</span></span>
                        <span className="text-zinc-600 text-sm font-normal">Docs</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                        <a href="https://github.com/sirrryasir/mongoose-studio" target="_blank" className="hover:text-emerald-400 transition-colors"><Github /></a>
                    </nav>
                </div>
            </header>

            <div className="container mx-auto px-6 flex-1 flex">
                {/* Sidebar */}
                <aside className="w-64 py-12 hidden md:block border-r border-zinc-900 sticky top-16 h-[calc(100vh-4rem)]">
                    <nav className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Getting Started</p>
                            <ul className="space-y-1 text-sm text-zinc-400">
                                <li><a href="#quickstart" className="block py-1 hover:text-white transition-colors">Quickstart</a></li>
                                <li><a href="#installation" className="block py-1 hover:text-white transition-colors">Installation</a></li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Usage</p>
                            <ul className="space-y-1 text-sm text-zinc-400">
                                <li><a href="#cli-options" className="block py-1 hover:text-white transition-colors">CLI Options</a></li>
                                <li><a href="#features" className="block py-1 hover:text-white transition-colors">Features</a></li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Troubleshooting</p>
                            <ul className="space-y-1 text-sm text-zinc-400">
                                <li><a href="#mongoose-not-found" className="block py-1 hover:text-white transition-colors">Mongoose Not Found</a></li>
                                <li><a href="#models-directory-not-found" className="block py-1 hover:text-white transition-colors">Models Not Found</a></li>
                                <li><a href="#no-mongoose-models-registered" className="block py-1 hover:text-white transition-colors">No Models Registered</a></li>
                            </ul>
                        </div>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 py-12 md:pl-12 max-w-3xl">
                    <div className="space-y-12">
                        <section id="introduction">
                            <h1 className="text-4xl font-bold mb-4">Introduction</h1>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                Mongoose Studio is a developer-first GUI for Mongoose. It auto-detects your models and launches a modern dashboard to visualize your schema and manage your data—no configuration required.
                            </p>
                        </section>

                        <section id="quickstart" className="pt-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Quickstart</h2>
                            <p className="text-zinc-400 mb-4">Run Mongoose Studio instantly in your project root using npx:</p>
                            <CodeBlock code="npx mongoose-studio" />
                            <p className="text-zinc-400 my-4">or with bunx:</p>
                            <CodeBlock code="bunx mongoose-studio" />
                        </section>

                        <section id="installation" className="pt-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Installation</h2>
                            <p className="text-zinc-400 mb-4">If you prefer to install it globally (though npx is recommended):</p>
                            <CodeBlock code="npm install -g mongoose-studio" />
                        </section>

                        <section id="cli-options" className="pt-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> CLI Options</h2>
                            <div className="overflow-x-auto rounded-xl border border-zinc-800">
                                <table className="w-full text-left text-sm text-zinc-400">
                                    <thead className="bg-zinc-900/50 text-zinc-200">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Flag</th>
                                            <th className="px-4 py-3 font-medium">Description</th>
                                            <th className="px-4 py-3 font-medium">Default</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-400">--port</td>
                                            <td className="px-4 py-3">Specify the port to run on</td>
                                            <td className="px-4 py-3 font-mono">5555</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-400">--uri</td>
                                            <td className="px-4 py-3">Custom MongoDB connection URI</td>
                                            <td className="px-4 py-3 font-mono">mongodb://localhost...</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-400">--models</td>
                                            <td className="px-4 py-3">Path to models directory</td>
                                            <td className="px-4 py-3">Auto-detected</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section id="troubleshooting" className="pt-8 space-y-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Troubleshooting</h2>

                            <div id="mongoose-not-found" className="p-6 rounded-xl bg-red-950/10 border border-red-500/20">
                                <h3 className="text-lg font-bold text-red-400 mb-2">⚠ Mongoose not found</h3>
                                <p className="text-zinc-400 mb-4">Mongoose Studio couldn't find the mongoose package in your project.</p>
                                <p className="text-sm font-bold text-zinc-300">Solution:</p>
                                <ul className="list-disc list-inside text-zinc-400 text-sm mt-1">
                                    <li>Ensure you are running the command from your project root.</li>
                                    <li>Ensure you have installed dependencies (npm install).</li>
                                </ul>
                            </div>

                            <div id="models-directory-not-found" className="p-6 rounded-xl bg-yellow-950/10 border border-yellow-500/20">
                                <h3 className="text-lg font-bold text-yellow-400 mb-2">⚠ Models directory not found</h3>
                                <p className="text-zinc-400 mb-4">The path specified by --models or the default paths (models, src/models) do not exist.</p>
                                <p className="text-sm font-bold text-zinc-300">Solution:</p>
                                <CodeBlock code="npx mongoose-studio --models=src/database/models" />
                            </div>

                            <div id="no-mongoose-models-registered" className="p-6 rounded-xl bg-blue-950/10 border border-blue-500/20">
                                <h3 className="text-lg font-bold text-blue-400 mb-2">ℹ No Mongoose models registered</h3>
                                <p className="text-zinc-400 mb-4">Mongoose connected, but no models were found. This usually means your model files aren't being required.</p>
                                <p className="text-sm font-bold text-zinc-300">Solution:</p>
                                <p className="text-zinc-400 text-sm mt-1">Point explicitly to your models folder so Mongoose Studio can require them:</p>
                                <CodeBlock code="npx mongoose-studio --models=src/models" />
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="relative group">
            <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
                {code}
            </pre>
            <button
                onClick={onCopy}
                className="absolute top-3 right-3 p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    )
}
