"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Terminal, Zap, Shield } from "lucide-react";
import { LandingHeader } from "../components/LandingHeader";
import { motion } from "framer-motion";
import { CodeTabs } from "../components/CodeTabs";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
      <LandingHeader />

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-24 pb-20 relative overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-emerald-400 backdrop-blur-sm hover:border-emerald-500/30 transition-colors cursor-default"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                v1.0.3 is now available
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight pb-2"
              >
                <span className="bg-gradient-to-b from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  Your Mongoose Data,
                </span>
                <br />
                <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Visualized.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              >
                A modern, zero-config GUI for your Mongoose models. Inspect schemas, view data, and debug queries instantly without leaving your terminal.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-8 w-full"
              >
                <CodeTabs
                  commands={{
                    npm: "npx mongoose-studio",
                    pnpm: "pnpm dlx mongoose-studio",
                    yarn: "yarn dlx mongoose-studio",
                    bun: "bunx mongoose-studio"
                  }}
                  className="w-full max-w-md mx-auto"
                />

                <Link href="/docs" className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* 3D Screenshot Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                className="mt-24 relative group perspective-1000 max-w-5xl mx-auto"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-blue-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>

                {/* Main Image Container */}
                <motion.div
                  className="relative rounded-xl overflow-hidden border border-border bg-card/90 shadow-2xl backdrop-blur-sm"
                  initial={{ y: 0 }}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2 backdrop-blur-md">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 transition-colors"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/40 transition-colors"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50 hover:bg-green-500/40 transition-colors"></div>
                    </div>
                    <div className="mx-auto text-xs font-mono text-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity">Mongoose Studio Dashboard - localhost:5555</div>
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
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Specs Grid */}
        <section className="py-24 border-t border-border bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="w-6 h-6 text-yellow-400" />}
                title="Zero Config"
                description="Auto-detects models from your project. No manual setup or configuration files needed."
                delay={0}
              />
              <FeatureCard
                icon={<Terminal className="w-6 h-6 text-blue-400" />}
                title="CLI Powered"
                description="Runs directly from your terminal. Uses your local mongoose instance for perfect compatibility."
                delay={0.1}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-emerald-400" />}
                title="Type Safe"
                description="Built with TypeScript. Inspects your schema types, required fields, and defaults accurately."
                delay={0.2}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Mongoose Studio by <a href="https://yaasir.dev" className="text-emerald-400 hover:underline hover:text-emerald-300 transition-colors">Yasir</a>.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-card/30 border border-border hover:border-emerald-500/30 hover:bg-card/50 transition-all group backdrop-blur-sm"
    >
      <div className="mb-6 p-4 bg-background rounded-xl w-fit border border-border group-hover:border-emerald-500/30 transition-colors shadow-inner">{icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
