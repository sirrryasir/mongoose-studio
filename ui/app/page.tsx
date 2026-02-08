"use client";

import { Sidebar } from "../components/Sidebar";
import { TabWorkspace } from "../components/TabWorkspace";

export default function Home() {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden bg-zinc-900/50">
        <TabWorkspace />
      </main>
    </div>
  );
}
