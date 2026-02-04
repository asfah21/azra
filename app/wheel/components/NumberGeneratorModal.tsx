"use client";

import React, { useState } from "react";
import { X, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NumberGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (count: number) => void;
}

export default function NumberGeneratorModal({ 
  isOpen, 
  onClose, 
  onGenerate 
}: NumberGeneratorModalProps) {
  const [count, setCount] = useState(100);

  const handleGenerate = () => {
    if (count >= 1 && count <= 1000) {
      onGenerate(count);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#2b3040] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/5">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
                <Hash size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Generate Numbers</h3>
                <p className="text-sm text-gray-400">Replace entries with sequential numbers</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
                How many numbers? (1-1000)
              </label>
              <input 
                type="number"
                value={count}
                onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
                min="1"
                max="1000"
                className="w-full bg-black/30 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 outline-none transition focus:border-purple-500/50 text-lg font-mono"
              />
              <p className="text-xs text-gray-500">
                This will generate numbers from <span className="text-purple-400 font-mono">001</span> to <span className="text-purple-400 font-mono">{String(count).padStart(3, '0')}</span>
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-xs text-blue-400 font-semibold mb-1">Preview:</p>
              <div className="flex gap-2 text-sm text-gray-300 font-mono">
                <span>001</span>
                <span>002</span>
                <span>003</span>
                <span className="text-gray-600">...</span>
                <span>{String(count).padStart(3, '0')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3.5 rounded-xl transition border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-purple-900/20 active:scale-[0.98]"
              >
                Generate Numbers
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
