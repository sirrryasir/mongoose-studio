import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Database, Terminal, Zap, Shield, Github } from "lucide-react";
import { CopyButton } from "../components/CopyButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Image src="/logo.png" alt="Mongoose Studio Logo" width={32} height={32} className="w-5 h-5" />
            </div>
            <span>Mongoose <span className="text-emerald-400">Studio</span></span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/docs" className="hover:text-emerald-400 transition-colors">Documentation</Link>
            <a href="https://github.com/sirrryasir/mongoose-studio" target="_blank" className="text-zinc-400 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <Link href="/docs" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-full font-bold transition-colors">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-zinc-950/0 to-zinc-950/0"></div>
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                v1.0.1 is now available
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent pb-2">
                Your Mongoose Data,<br />
                <span className="text-emerald-400">Visualized.</span>
              </h1>
              <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                A modern, zero-config GUI for your Mongoose models. Inspect schemas, view data, and debug queries instantly without leaving your terminal.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-sm text-zinc-300 flex items-center gap-3 shadow-lg shadow-emerald-500/5">
                  <span className="text-emerald-500 select-none">$</span>
                  <span>npx mongoose-studio</span>
                  <CopyButton text="npx mongoose-studio" />
                </div>
                <Link href="/docs" className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-white/5">
                  Documentation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Screenshot */}
              <div className="mt-20 relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-sm transform transition-transform duration-500 group-hover:scale-[1.01]">
                  <div className="h-10 bg-zinc-900/90 border-b border-zinc-800 flex items-center px-4 gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="mx-auto text-xs font-mono text-zinc-500 opacity-50">localhost:5555</div>
                  </div>
                  <Image
                    src="/hero-screenshot.png"
                    alt="Mongoose Studio Dashboard"
                    width={1400}
                    height={800}
                    className="w-full h-auto"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specs Grid */}
        <section className="py-24 border-t border-zinc-900 bg-zinc-900/20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="w-6 h-6 text-yellow-400" />}
                title="Zero Config"
                description="Auto-detects models from your project. No manual setup or configuration files needed."
              />
              <FeatureCard
                icon={<Terminal className="w-6 h-6 text-blue-400" />}
                title="CLI Powered"
                description="Runs directly from your terminal. Uses your local mongoose instance for perfect compatibility."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-emerald-400" />}
                title="Type Safe"
                description="Built with TypeScript. Inspects your schema types, required fields, and defaults accurately."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-12">
        <div className="container mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Mongoose Studio by <a href="https://yaasir.dev" className="text-emerald-400 hover:underline">Yasir</a>.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors">
      <div className="mb-4 p-3 bg-zinc-950 rounded-xl w-fit border border-zinc-800">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}
