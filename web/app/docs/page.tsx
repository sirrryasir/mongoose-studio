"use client";
import Link from "next/link";
import { Copy, Check, ChevronRight, Hash, Github, Menu, X } from "lucide-react";
import { CodeTabs } from "../../components/CodeTabs";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function DocsPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    // ScrollSpy Logic
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-10% 0px -80% 0px" });

        const sections = document.querySelectorAll("section[id]");
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    return (
        <div className="flex flex-col min-h-screen relative">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>

                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Image src="/logo.png" alt="Mongoose Studio Logo" width={32} height={32} className="w-5 h-5" />
                            </div>
                            <span className="hidden sm:inline text-foreground">Mongoose <span className="text-emerald-400">Studio</span></span>
                            <span className="text-muted-foreground text-sm font-normal">Docs</span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="hidden sm:block hover:text-emerald-400 transition-colors">Home</Link>
                        <ThemeToggle />
                        <a href="https://github.com/sirrryasir/mongoose-studio" target="_blank" className="hover:text-emerald-400 transition-colors"><Github /></a>
                    </nav>
                </div>
            </header>

            <div className="container mx-auto px-6 flex-1 flex relative">
                {/* Desktop Sidebar */}
                <aside className="w-64 py-12 hidden md:block border-r border-border sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
                    <DocsNav activeSection={activeSection} />
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* Drawer */}
                        <aside className="absolute left-0 top-16 bottom-0 w-3/4 max-w-xs bg-background border-r border-border p-6 overflow-y-auto animate-in slide-in-from-left">
                            <DocsNav activeSection={activeSection} onClick={() => setIsMobileMenuOpen(false)} />
                        </aside>
                    </div>
                )}

                {/* Content */}
                <main className="flex-1 py-12 md:pl-12 max-w-3xl min-w-0">
                    <div className="space-y-12">
                        <section id="introduction" className="scroll-mt-24">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Introduction</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Mongoose Studio is a developer-first GUI for Mongoose. It auto-detects your models and launches a modern dashboard to visualize your schema and manage your data—no configuration required.
                            </p>
                        </section>

                        <section id="quickstart" className="pt-8 text-foreground scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Quickstart</h2>
                            <p className="text-muted-foreground mb-6">Run Mongoose Studio instantly in your project root using your preferred package manager:</p>
                            <CodeTabs
                                commands={{
                                    npm: "npx mongoose-studio",
                                    pnpm: "pnpm dlx mongoose-studio",
                                    yarn: "yarn dlx mongoose-studio",
                                    bun: "bunx mongoose-studio"
                                }}
                            />
                        </section>

                        <section id="installation" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Installation</h2>
                            <p className="text-muted-foreground mb-6">If you prefer to install it globally (though running via dlx/npx is recommended):</p>
                            <CodeTabs
                                commands={{
                                    npm: "npm install -g mongoose-studio",
                                    pnpm: "pnpm add -g mongoose-studio",
                                    yarn: "yarn global add mongoose-studio",
                                    bun: "bun add -g mongoose-studio"
                                }}
                            />
                        </section>

                        <section id="project-setup" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Project Setup</h2>
                            <p className="text-muted-foreground mb-6">Mongoose Studio works with both JavaScript and TypeScript projects. Here are some common configurations:</p>

                            <div className="space-y-6">
                                <div className="p-6 rounded-xl bg-muted/30 border border-border">
                                    <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">JavaScript (CommonJS/ESM)</h3>
                                    <p className="text-muted-foreground text-sm mb-4">No special configuration needed. Just point to your models directory if it&apos;s not auto-detected.</p>
                                    <CodeBlock code="npx mongoose-studio --models=src/models" />
                                </div>

                                <div className="p-6 rounded-xl bg-muted/30 border border-border">
                                    <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">TypeScript</h3>
                                    <p className="text-muted-foreground text-sm mb-4">Mongoose Studio uses `bun` internally to run your TypeScript files on the fly. You don&apos;t need to compile your code first.</p>
                                    <CodeBlock code="npx mongoose-studio --models=src/models" />
                                </div>
                            </div>
                        </section>

                        <section id="real-world-example" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Real World Example</h2>
                            <p className="text-muted-foreground mb-6">See how Mongoose Studio works in a real project. Follow these steps to clone a demo repo and inspect its models:</p>

                            <div className="space-y-4 mb-8">
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-foreground">1. Clone the demo repository</p>
                                    <CodeBlock code="git clone https://github.com/sirrryasir/mongoose-studio-demo.git" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-foreground">2. Install & Start Server</p>
                                    <p className="text-muted-foreground text-xs">This starts the database and seeds it with data. Keep this terminal running.</p>
                                    <CodeBlock code="cd mongoose-studio-demo && npm install && npm start" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-foreground">3. Run Mongoose Studio</p>
                                    <p className="text-muted-foreground text-xs">Open a <b>new terminal</b> and run the studio pointing to the demo URI.</p>
                                    <CodeTabs
                                        commands={{
                                            npm: "npx mongoose-studio",
                                            pnpm: "pnpm dlx mongoose-studio",
                                            yarn: "yarn dlx mongoose-studio",
                                            bun: "bunx mongoose-studio"
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl overflow-hidden border border-border bg-card/50 shadow-2xl">
                                <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                    </div>
                                    <div className="mx-auto text-xs font-mono text-zinc-500">Mongoose Studio Dashboard</div>
                                </div>
                                <Image
                                    src="/real-world-demo.png"
                                    alt="Mongoose Studio Dashboard"
                                    width={1200}
                                    height={800}
                                    className="w-full h-auto"
                                    unoptimized
                                />
                            </div>
                        </section>



                        <section id="configuration" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Configuration</h2>
                            <p className="text-muted-foreground mb-6">You can configure Mongoose Studio using flags or Environment Variables in your `.env` file.</p>

                            <div className="overflow-x-auto rounded-xl border border-border mb-8">
                                <table className="w-full text-left text-sm text-muted-foreground">
                                    <thead className="bg-muted/50 text-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Variable</th>
                                            <th className="px-4 py-3 font-medium">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-400">MONGO_URI</td>
                                            <td className="px-4 py-3">Your MongoDB connection string. If present in your `.env`, it will be used automatically.</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-400">PORT</td>
                                            <td className="px-4 py-3">The port to run the studio on (default: 5555).</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section id="cli-options" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> CLI Options</h2>
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-left text-sm text-muted-foreground">
                                    <thead className="bg-muted/50 text-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Flag</th>
                                            <th className="px-4 py-3 font-medium">Description</th>
                                            <th className="px-4 py-3 font-medium">Default</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
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
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-400">--help</td>
                                            <td className="px-4 py-3">Show help message</td>
                                            <td className="px-4 py-3">N/A</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section id="troubleshooting" className="pt-8 space-y-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-white"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Troubleshooting</h2>

                            <div id="mongoose-not-found" className="p-6 rounded-xl bg-red-950/10 border border-red-500/20 scroll-mt-24">
                                <h3 className="text-lg font-bold text-red-500 dark:text-red-400 mb-2">⚠ Mongoose not found</h3>
                                <p className="text-muted-foreground mb-4">Mongoose Studio couldn&apos;t find the mongoose package in your project.</p>
                                <p className="text-sm font-bold text-foreground">Solution:</p>
                                <ul className="list-disc list-inside text-muted-foreground text-sm mt-1">
                                    <li>Ensure you are running the command from your project root.</li>
                                    <li>Ensure you have installed dependencies (npm install).</li>
                                </ul>
                            </div>

                            <div id="models-directory-not-found" className="p-6 rounded-xl bg-yellow-950/10 border border-yellow-500/20 scroll-mt-24">
                                <h3 className="text-lg font-bold text-yellow-500 dark:text-yellow-400 mb-2">⚠ Models directory not found</h3>
                                <p className="text-muted-foreground mb-4">The path specified by --models or the default paths (models, src/models) do not exist.</p>
                                <p className="text-sm font-bold text-foreground">Solution:</p>
                                <CodeBlock code="npx mongoose-studio --models=src/database/models" />
                            </div>

                            <div id="no-mongoose-models-registered" className="p-6 rounded-xl bg-blue-950/10 border border-blue-500/20 scroll-mt-24">
                                <h3 className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-2">ℹ No Mongoose models registered</h3>
                                <p className="text-muted-foreground mb-4">Mongoose connected, but no models were found. This usually means your model files aren&apos;t being required.</p>
                                <p className="text-sm font-bold text-foreground">Solution:</p>
                                <p className="text-muted-foreground text-sm mt-1">Point explicitly to your models folder so Mongoose Studio can require them:</p>
                                <CodeBlock code="npx mongoose-studio --models=src/models" />
                            </div>
                        </section>

                        <section id="faq" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> FAQ</h2>
                            <div className="space-y-4">
                                <details className="group bg-muted/20 border border-border rounded-xl open:bg-muted/40 hover:border-zinc-700 transition-all">
                                    <summary className="font-medium p-4 cursor-pointer list-none flex items-center justify-between text-muted-foreground group-hover:text-foreground">
                                        <span>Does this work with remote databases?</span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-zinc-500" />
                                    </summary>
                                    <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-transparent group-open:border-border mt-2">
                                        Yes! You can connect to Atlas or any remote MongoDB instance by providing the `MONGO_URI` in the dashboard or via the `--uri` flag/env variable.
                                    </div>
                                </details>

                                <details className="group bg-muted/20 border border-border rounded-xl open:bg-muted/40 hover:border-zinc-700 transition-all">
                                    <summary className="font-medium p-4 cursor-pointer list-none flex items-center justify-between text-muted-foreground group-hover:text-foreground">
                                        <span>Is my data safe?</span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-zinc-500" />
                                    </summary>
                                    <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-transparent group-open:border-border mt-2">
                                        Absolutely. Mongoose Studio runs locally on your machine. Your data never leaves your network and is not sent to any external servers.
                                    </div>
                                </details>

                                <details className="group bg-muted/20 border border-border rounded-xl open:bg-muted/40 hover:border-zinc-700 transition-all">
                                    <summary className="font-medium p-4 cursor-pointer list-none flex items-center justify-between text-muted-foreground group-hover:text-foreground">
                                        <span>Can I edit data?</span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-zinc-500" />
                                    </summary>
                                    <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-transparent group-open:border-border mt-2">
                                        Currently, Mongoose Studio is read-only for safety. Editing and deletion features are planned for v1.1.
                                    </div>
                                </details>
                            </div>
                        </section>

                        <section id="contributing" className="pt-8 scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 group text-foreground"><Hash className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Contributing</h2>
                            <p className="text-muted-foreground mb-6 font-light">
                                We welcome contributions! Mongoose Studio is open source.
                                <br />
                                Check out the repo, fork it, and submit a PR.
                            </p>
                            <a
                                href="https://github.com/sirrryasir/mongoose-studio"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 rounded-lg text-sm font-medium transition-colors text-white"
                            >
                                <Github className="w-4 h-4" />
                                View on GitHub
                            </a>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

function DocsNav({ onClick, activeSection }: { onClick?: () => void, activeSection?: string }) {
    const linkClass = (id: string) => `block py-1 transition-all border-l pl-4 -ml-px ${activeSection === id ? "border-emerald-500 text-emerald-500 font-medium scale-105 origin-left" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`;

    return (
        <nav className="space-y-8 pl-2">
            <div className="space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider pl-4">Getting Started</p>
                <ul className="space-y-1 text-sm">
                    <li><a href="#introduction" onClick={onClick} className={linkClass("introduction")}>Introduction</a></li>
                    <li><a href="#quickstart" onClick={onClick} className={linkClass("quickstart")}>Quickstart</a></li>
                    <li><a href="#installation" onClick={onClick} className={linkClass("installation")}>Installation</a></li>
                    <li><a href="#project-setup" onClick={onClick} className={linkClass("project-setup")}>Project Setup</a></li>
                    <li><a href="#real-world-example" onClick={onClick} className={linkClass("real-world-example")}>Real World Example</a></li>
                </ul>
            </div>
            <div className="space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider pl-4">Configuration</p>
                <ul className="space-y-1 text-sm">
                    <li><a href="#configuration" onClick={onClick} className={linkClass("configuration")}>Environment Variables</a></li>
                    <li><a href="#cli-options" onClick={onClick} className={linkClass("cli-options")}>CLI Options</a></li>
                </ul>
            </div>
            <div className="space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider pl-4">Reference</p>
                <ul className="space-y-1 text-sm">
                    <li><a href="#troubleshooting" onClick={onClick} className={linkClass("troubleshooting")}>Troubleshooting</a></li>
                    <li><a href="#faq" onClick={onClick} className={linkClass("faq")}>FAQ</a></li>
                    <li><a href="#contributing" onClick={onClick} className={linkClass("contributing")}>Contributing</a></li>
                </ul>
            </div>
        </nav>
    )
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
            <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 pr-12 font-mono text-sm text-zinc-300 overflow-x-auto">
                {code}
            </pre>
            <button
                onClick={onCopy}
                className="absolute top-3 right-3 p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    )
}
