"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface ErrorFallbackProps {
  hasError: boolean;
  errorType?: "database" | "network" | "general";
  onRetry: () => void;
  children: React.ReactNode;
}

export default function ErrorFallback({
  hasError,
  errorType = "general",
  onRetry,
  children,
}: ErrorFallbackProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Open modal when error occurs
  useEffect(() => {
    if (hasError) {
      onOpen();
    }
  }, [hasError, onOpen]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay for UX
      onRetry();
      onClose();
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const getErrorConfig = () => {
    switch (errorType) {
      case "database":
        return {
          title: "Database Connection Error",
          message:
            "Tidak dapat terhubung ke database. Silakan coba lagi atau refresh halaman.",
          icon: <AlertTriangle className="w-8 h-8 text-danger-500" />,
          color: "danger" as const,
        };
      case "network":
        return {
          title: "Network Connection Error",
          message: isOnline
            ? "Koneksi jaringan bermasalah. Silakan periksa koneksi internet Anda."
            : "Tidak ada koneksi internet. Silakan periksa koneksi Anda.",
          icon: isOnline ? (
            <Wifi className="w-8 h-8 text-warning-500" />
          ) : (
            <WifiOff className="w-8 h-8 text-danger-500" />
          ),
          color: isOnline ? ("warning" as const) : ("danger" as const),
        };
      default:
        return {
          title: "Something Went Wrong",
          message: "Terjadi kesalahan saat memuat data. Silakan coba lagi.",
          icon: <AlertTriangle className="w-8 h-8 text-danger-500" />,
          color: "danger" as const,
        };
    }
  };

  const errorConfig = getErrorConfig();

  if (!hasError) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      <Modal
        hideCloseButton
        backdrop="blur"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
        isOpen={isOpen}
        placement="center"
        onClose={() => {}} // Prevent closing by clicking outside
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              {errorConfig.icon}
              <div>
                <h3 className="text-lg font-semibold">{errorConfig.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? "bg-success-500" : "bg-danger-500"
                    }`}
                  />
                  <span className="text-sm text-default-500">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <p className="text-default-600">{errorConfig.message}</p>

            {!isOnline && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mt-3">
                <p className="text-danger-700 text-sm">
                  <strong>Tip:</strong> Pastikan perangkat Anda terhubung ke
                  internet dan coba lagi.
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="default" variant="light" onPress={handleRefreshPage}>
              Refresh Halaman
            </Button>
            <Button
              color={errorConfig.color}
              isLoading={isRetrying}
              startContent={!isRetrying && <RefreshCw className="w-4 h-4" />}
              onPress={handleRetry}
            >
              {isRetrying ? "Mencoba..." : "Coba Lagi"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
