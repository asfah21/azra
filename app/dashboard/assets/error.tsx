// Berikut adalah penjelasan implementasi lengkap:

// 1. ErrorFallback.tsx (Client Component)
//    Menampilkan modal popup dengan HeroUI ketika terjadi error
//    Monitor status jaringan online/offline
//    Memberikan opsi "Coba Lagi" dan "Refresh Halaman"
//    Mendukung berbagai tipe error (database, network, general)

// 2. ErrorBoundaryWrapper.tsx (Client Component)
//    Wrapper yang menghubungkan ErrorFallback dengan Next.js router
//    Menggunakan router.refresh() untuk retry data fetching
//    Menjembatani antara server component dan client component

// 3. Updated page.tsx (Server Component)
//    Tetap sebagai server component
//    Error handling yang lebih robust dengan tipe error
//    Menggunakan ErrorBoundaryWrapper untuk menangani error
//    Fallback UI jika semua data gagal dimuat

// 4. error.tsx (Error Boundary)
//    Next.js error page untuk menangani unhandled errors
//    Styled dengan HeroUI components
//    Opsi untuk retry, refresh, atau kembali ke home

"use client";

import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error untuk debugging
    console.error("Page Error:", error);
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error while loading this page. This might
          be due to a temporary issue with our servers or your connection.
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
            <code className="text-sm text-red-600 break-all">
              {error.message}
            </code>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1"
            color="primary"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={reset}
          >
            Try Again
          </Button>

          <Button
            className="flex-1"
            color="default"
            variant="light"
            onPress={handleRefresh}
          >
            Refresh Page
          </Button>

          <Button
            className="flex-1"
            color="default"
            startContent={<Home className="w-4 h-4" />}
            variant="bordered"
            onPress={handleGoHome}
          >
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          If the problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
