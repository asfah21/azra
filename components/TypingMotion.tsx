"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  words: string[];
  typingSpeed?: number; // ms per karakter
  pauseTime?: number; // jeda setelah kata selesai diketik
  className?: string;
  cursorClassName?: string;
  loop?: boolean;
};

export default function TypingMotion({
  words,
  typingSpeed = 80,
  pauseTime = 1000,
  className = "",
  cursorClassName = "",
  loop = true,
}: Props) {
  const [index, setIndex] = useState(0); // index kata
  const [text, setText] = useState(""); // substring yang sedang diketik
  const [show, setShow] = useState(true); // untuk trigger fade-out

  const current = words[index] ?? "";

  // efek mengetik (per karakter)
  useEffect(() => {
    if (!show) return; // kalau sedang fade-out, hentikan typing
    if (text.length < current.length) {
      const t = setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, typingSpeed);

      return () => clearTimeout(t);
    } else {
      // selesai ngetik -> tunggu sebentar -> fade-out
      const t = setTimeout(() => setShow(false), pauseTime);

      return () => clearTimeout(t);
    }
  }, [text, show, current, typingSpeed, pauseTime]);

  // ketika elemen keluar (exit) selesai, pindah ke kata berikutnya & mulai lagi
  const handleExitComplete = () => {
    let next = index + 1;

    if (next >= words.length) next = loop ? 0 : index;
    setIndex(next);
    setText("");
    // re-mount untuk enter anim
    if (loop || next !== index) setShow(true);
  };

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {show && (
          <motion.span
            key={`word-${index}`}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="whitespace-pre"
            exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
            initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
            transition={{ type: "tween", duration: 0.28 }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>

      {/* kursor */}
      <span
        className={`inline-block w-[1ch] -translate-y-[1px] animate-caret ${cursorClassName || ""}`}
      >
        |
      </span>
    </span>
  );
}
