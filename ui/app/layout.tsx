
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mongoose Studio",
  description: "A modern GUI for your Mongoose models",
};

import { Suspense } from "react";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-200 antialiased`}>
        <div className="flex h-screen">
          <Suspense fallback={<div className="w-64 bg-zinc-900 border-r border-zinc-800" />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 ml-64 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
