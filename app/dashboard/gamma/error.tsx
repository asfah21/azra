// app/dashboard/gamma/error.tsx
"use client";

import { Users } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-4 bg-red-50 rounded-xl mb-4">
          <Users className="w-12 h-12 text-red-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Gagal Memuat Data Breakdown
        </h2>
        <p className="text-gray-600 mb-4">
          Terjadi kesalahan saat memuat halaman breakdown. Silakan coba refresh halaman.
        </p>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          onClick={() => reset()}
        >
          Refresh Halaman
        </button>
        <details className="mt-4 text-left text-xs text-gray-500">
          <summary>Detail Error</summary>
          <pre>{error.message}</pre>
        </details>
      </div>
    </div>
  );
}