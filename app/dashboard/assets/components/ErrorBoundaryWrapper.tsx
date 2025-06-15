"use client";

import React from "react";
import { useRouter } from "next/navigation";

import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  hasError: boolean;
  errorType?: "database" | "network" | "general";
}

export default function ErrorBoundaryWrapper({
  children,
  hasError,
  errorType = "general",
}: ErrorBoundaryWrapperProps) {
  const router = useRouter();

  const handleRetry = () => {
    // Refresh the page data by forcing a router refresh
    router.refresh();
  };

  return (
    <ErrorFallback
      errorType={errorType}
      hasError={hasError}
      onRetry={handleRetry}
    >
      {children}
    </ErrorFallback>
  );
}
