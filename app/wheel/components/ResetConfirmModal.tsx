"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-[#2b3040] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/5">
            <button
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition text-gray-500 hover:text-white"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
                <AlertTriangle className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Reset All Data?
                </h3>
                <p className="text-sm text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <p className="text-sm text-gray-300 leading-relaxed">
                This will permanently delete:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  All entries (names/numbers)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  All winner results
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Spin count and session progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Secret settings and rigged winners
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 text-center">
              The wheel will reset to default state with sample names.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3.5 rounded-xl transition border border-white/10"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-900/20 active:scale-[0.98]"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Reset Everything
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
