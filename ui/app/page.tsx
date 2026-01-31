"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ModelView } from '@/components/ModelView';
import Image from 'next/image';

function AppContent() {
  const searchParams = useSearchParams();
  const model = searchParams.get('model');

  if (model) {
    return <ModelView modelName={model} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
        <Image src="/logo.png" alt="Logo" width={48} height={48} />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome to Mongoose Studio</h1>
      <p className="text-zinc-500 max-w-md">
        Select a model from the sidebar to inspect its schema and view its documents.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
