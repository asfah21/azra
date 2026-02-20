"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPassword: string;
}

export default function PasswordModal({
  isOpen,
  onClose,
  onSuccess,
  correctPassword,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
      setShowPassword(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === correctPassword) {
      onSuccess();
      onClose();
    } else {
      setError("Password salah");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword("");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className={`bg-[#2b3040] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden ${isShaking ? "animate-shake" : ""}`}
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
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Lock className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Enter Password</h3>
                <p className="text-sm text-gray-400">Access settings</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold text-gray-400 uppercase tracking-wide"
                htmlFor="password-input"
              >
                Password
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  autoComplete="off"
                  className={`w-full bg-black/30 border-2 ${error ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 outline-none transition focus:border-blue-500/50 font-mono`}
                  id="password-input"
                  placeholder="Enter password..."
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs font-semibold flex items-center gap-2"
                    exit={{ opacity: 0, y: -5 }}
                    initial={{ opacity: 0, y: -5 }}
                  >
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3.5 rounded-xl transition border border-white/10"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                type="submit"
              >
                Open Settings
              </button>
            </div>
          </form>
        </motion.div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-10px);
            }
            75% {
              transform: translateX(10px);
            }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `,
          }}
        />
      </div>
    </AnimatePresence>
  );
}
