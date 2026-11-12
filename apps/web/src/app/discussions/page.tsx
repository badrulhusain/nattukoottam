'use client';

import React, { Suspense } from 'react';
import { DiscussionsListView } from '../../components/discussions/DiscussionsListView';
import { Loader2 } from 'lucide-react';

export default function DiscussionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-[#718078] text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#16A34A]" />
          <span>Loading discussions...</span>
        </div>
      }
    >
      <DiscussionsListView />
    </Suspense>
  );
}
