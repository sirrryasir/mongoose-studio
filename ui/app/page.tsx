"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ModelView } from '@/components/ModelView';

function AppContent() {
  const searchParams = useSearchParams();
  const model = searchParams.get('model');

  if (model) {
    return <ModelView modelName={model} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
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
