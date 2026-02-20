"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Shuffle,
  SortAsc,
  List,
  Trophy,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  Hash,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";

import SecretSettingsModal from "./components/SecretSettingsModal";
import PasswordModal from "./components/PasswordModal";
import NumberGeneratorModal from "./components/NumberGeneratorModal";
import ResetConfirmModal from "./components/ResetConfirmModal";

const COLORS = [
  "#3369e8", // Blue
  "#d50f25", // Red
  "#eeb211", // Yellow
  "#009925", // Green
  "#ff6d00", // Orange
  "#9c27b0", // Purple
  "#00bcd4", // Cyan
  "#795548", // Brown
];

const DEFAULT_NAMES = [
  "Ali",
  "Beatriz",
  "Charles",
  "Diya",
  "Eric",
  "Fatima",
  "Gabriel",
  "Hanna",
];

export default function WheelClientPage() {
  // State for the raw text input (easier for 600+ items)
  const [textInput, setTextInput] = useState(DEFAULT_NAMES.join("\n"));
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);

  // Tabs: 'entries' | 'results'
  const [activeTab, setActiveTab] = useState<"entries" | "results">("entries");
  const [results, setResults] = useState<string[]>([]);

  // State for side panel visibility
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Settings / Rigging
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNumberGenOpen, setIsNumberGenOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [forcedWinnersMap, setForcedWinnersMap] = useState<
    Record<number, string>
  >({});
  const [totalPrizes, setTotalPrizes] = useState(30);
  const [spinCount, setSpinCount] = useState(0);

  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  const currentRotation = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("wheelTextInput");

      if (savedText) setTextInput(savedText);

      const savedResults = localStorage.getItem("wheelResults");

      if (savedResults) setResults(JSON.parse(savedResults));

      const savedMap = localStorage.getItem("wheelForcedWinnersMap");

      if (savedMap) setForcedWinnersMap(JSON.parse(savedMap));

      const savedPrizes = localStorage.getItem("wheelTotalPrizes");

      if (savedPrizes) setTotalPrizes(parseInt(savedPrizes));

      const savedCount = localStorage.getItem("wheelSpinCount");

      if (savedCount) setSpinCount(parseInt(savedCount));
    }
  }, []);

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  // Sync text input with names array
  useEffect(() => {
    const lines = textInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setNames(lines);
  }, [textInput]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wheelTextInput", textInput);
    }
  }, [textInput]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wheelResults", JSON.stringify(results));
    }
  }, [results]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "wheelForcedWinnersMap",
        JSON.stringify(forcedWinnersMap),
      );
    }
  }, [forcedWinnersMap]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wheelTotalPrizes", totalPrizes.toString());
    }
  }, [totalPrizes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wheelSpinCount", spinCount.toString());
    }
  }, [spinCount]);

  const playTickSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sharper, more realistic tick sound
    oscillator.frequency.value = 1200;
    oscillator.type = "square";

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.02);
  };

  const playSpinSound = (_duration: number) => {
    // Clear any existing interval
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }

    const totalTicks = 40; // Total number of ticks
    const startInterval = 30; // Start fast (ms)
    const endInterval = 150; // End slow (ms)

    let tickCount = 0;

    const tick = () => {
      if (tickCount >= totalTicks) {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

        return;
      }

      playTickSound();
      tickCount++;

      // Calculate next interval (exponential slowdown)
      const progress = tickCount / totalTicks;
      const nextInterval =
        startInterval + (endInterval - startInterval) * Math.pow(progress, 2);

      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = setTimeout(tick, nextInterval);
    };

    tick();
  };

  const playApplauseSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const duration = 3;

    // Layer 1: Dense white noise for crowd applause (louder and more intense)
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate); // Stereo for richer sound

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      for (let i = 0; i < bufferSize; i++) {
        // Add some variation to make it more organic
        data[i] = (Math.random() * 2 - 1) * (0.7 + Math.random() * 0.3);
      }
    }

    const noise = ctx.createBufferSource();

    noise.buffer = buffer;

    // Multiple filters for richer applause texture
    const filter1 = ctx.createBiquadFilter();

    filter1.type = "bandpass";
    filter1.frequency.value = 800;
    filter1.Q.value = 1;

    const filter2 = ctx.createBiquadFilter();

    filter2.type = "highpass";
    filter2.frequency.value = 400;

    // Louder envelope with punch
    const gainNode = ctx.createGain();

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.35, ctx.currentTime + 1.8);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    noise.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + duration);

    // Layer 2: Victory fanfare (triumphant melody)
    const fanfareNotes = [
      { freq: 523, time: 0.1, duration: 0.15 }, // C
      { freq: 659, time: 0.25, duration: 0.15 }, // E
      { freq: 784, time: 0.4, duration: 0.25 }, // G
      { freq: 1047, time: 0.7, duration: 0.4 }, // C (high)
    ];

    fanfareNotes.forEach((note) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.frequency.value = note.freq;
      osc.type = "triangle";

      const startTime = ctx.currentTime + note.time;

      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      oscGain.gain.linearRampToValueAtTime(0, startTime + note.duration);

      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });

    // Layer 3: Celebratory high-pitched cheers (more of them!)
    for (let i = 0; i < 12; i++) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.frequency.value = 1000 + Math.random() * 800;
      osc.type = "sine";

      const startTime = ctx.currentTime + 0.3 + i * 0.12;

      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.08, startTime + 0.03);
      oscGain.gain.linearRampToValueAtTime(0, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }

    // Layer 4: Rhythmic claps (3 claps for excitement)
    for (let i = 0; i < 3; i++) {
      const clapNoise = ctx.createBufferSource();
      const clapBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.05,
        ctx.sampleRate,
      );
      const clapData = clapBuffer.getChannelData(0);

      for (let j = 0; j < clapData.length; j++) {
        clapData[j] = Math.random() * 2 - 1;
      }

      clapNoise.buffer = clapBuffer;

      const clapFilter = ctx.createBiquadFilter();

      clapFilter.type = "highpass";
      clapFilter.frequency.value = 2000;

      const clapGain = ctx.createGain();
      const startTime = ctx.currentTime + 0.5 + i * 0.3;

      clapGain.gain.setValueAtTime(0.2, startTime);
      clapGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

      clapNoise.connect(clapFilter);
      clapFilter.connect(clapGain);
      clapGain.connect(ctx.destination);

      clapNoise.start(startTime);
    }
  };

  const handleSpin = async () => {
    if (isSpinning || names.length < 2) return;
    setIsSpinning(true);
    setWinner(null);

    const currentSpinNumber = spinCount + 1;

    // Stop if we reached total prizes
    if (currentSpinNumber > totalPrizes) {
      alert("All prizes have been given out!");

      return;
    }
    setSpinCount(currentSpinNumber);

    // Play spin sound
    playSpinSound(4000);

    const segmentSize = 360 / names.length;
    let finalOffset = Math.random() * 360;

    // Forced winner logic - check specific spin number
    const nextForcedWinner = forcedWinnersMap[currentSpinNumber] || "";
    const forcedIndex = names.findIndex(
      (n) => n.toLowerCase() === nextForcedWinner.trim().toLowerCase(),
    );

    if (forcedIndex !== -1) {
      // We want index 'forcedIndex' to land at angle 0 (Right).
      // Segment 'i' covers [i * segmentSize, (i + 1) * segmentSize] in wheel frame.
      // To have segment i land at 0 global:
      // (R + i*s + offset_in_segment) % 360 = 0
      // So R = (0 - (i*s + offset_in_segment)) % 360
      const offsetInSegment = (Math.random() * 0.7 + 0.15) * segmentSize; // Stay away from borders
      const targetLocalAngle = forcedIndex * segmentSize + offsetInSegment;

      // Calculate R such that currentRotation + R + rotation_already_applied stays consistent
      // Actually simpler logic:
      // We want to land such that currentRotation.current % 360 = targetR
      // where targetR = (360 - targetLocalAngle) % 360
      const targetR = (360 - targetLocalAngle) % 360;
      const currentR = currentRotation.current % 360;

      // Add enough rotations to be smooth, then land on targetR
      let extraSpins = 360 * 5;
      let rotationToAdd = (targetR - currentR) % 360;

      if (rotationToAdd < 0) rotationToAdd += 360;

      finalOffset = rotationToAdd + extraSpins;
    } else {
      // Normal random spin
      finalOffset = 360 * 5 + Math.random() * 360;
    }

    currentRotation.current += finalOffset;

    await controls.start({
      rotate: currentRotation.current,
      transition: {
        duration: 4,
        ease: [0.2, 0.8, 0.3, 1],
      },
    });

    // Calculate winner
    const degrees = currentRotation.current % 360;
    // Pointer is at Right (0 deg). Segment starts at index 0.
    // We need to reverse the rotation to find which segment is at 0.
    let localAngle = (0 - degrees) % 360;

    if (localAngle < 0) localAngle += 360;

    const winningIndex = Math.floor(localAngle / segmentSize);
    const winName = names[winningIndex];

    setWinner(winName);
    setResults((prev) => [winName, ...prev]);

    setIsSpinning(false);

    // Play applause sound for winner
    playApplauseSound();

    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: COLORS,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: COLORS,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const shuffleNames = () => {
    const lines = textInput.split("\n").filter((l) => l.trim());
    const shuffled = lines.sort(() => Math.random() - 0.5);

    setTextInput(shuffled.join("\n"));
  };

  const sortNames = () => {
    const lines = textInput.split("\n").filter((l) => l.trim());
    const sorted = lines.sort((a, b) => a.localeCompare(b));

    setTextInput(sorted.join("\n"));
  };

  const generateNumbers = (count: number) => {
    const numbers = Array.from({ length: count }, (_, i) =>
      String(i + 1).padStart(3, "0"),
    );

    setTextInput(numbers.join("\n"));
    setIsNumberGenOpen(false);
  };

  const resetAll = () => {
    // Reset all state
    setTextInput(DEFAULT_NAMES.join("\n"));
    setResults([]);
    setSpinCount(0);
    setForcedWinnersMap({});
    setTotalPrizes(30);

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("wheelTextInput");
      localStorage.removeItem("wheelResults");
      localStorage.removeItem("wheelSpinCount");
      localStorage.removeItem("wheelForcedWinnersMap");
      localStorage.removeItem("wheelTotalPrizes");
    }
  };

  // SVG Helper components
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);

    return [x, y];
  };

  const WheelSegment = ({
    index,
    total,
    text,
  }: {
    index: number;
    total: number;
    text: string;
  }) => {
    const startPercent = index / total;
    const endPercent = (index + 1) / total;

    // Performance optimization for huge lists: simplified rendering if needed
    // But SVG handles 600 paths usually okay-ish.

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    if (total === 1) {
      return (
        <circle cx="0" cy="0" fill={COLORS[index % COLORS.length]} r="1" />
      );
    }

    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`,
    ].join(" ");

    const midPercent = (index + 0.5) / total;
    const rotateAngle = midPercent * 360;

    // Hide text if segments are too small
    const showText = total < 100;

    return (
      <g>
        <path
          d={pathData}
          fill={COLORS[index % COLORS.length]}
          stroke="none"
          strokeWidth={total > 200 ? "0" : "0.005"}
        />
        {showText && (
          <g transform={`rotate(${rotateAngle}) translate(0.6, 0)`}>
            <text
              alignmentBaseline="middle"
              fill="white"
              fontSize={Math.min(0.08, 1.5 / total)} // Scale font down as items increase
              fontWeight="bold"
              textAnchor="middle"
              x="0"
              y="0"
            >
              {text.length > 15 ? text.substring(0, 15) + "..." : text}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#1e2330] text-gray-100 overflow-hidden group">
      {/* Left Area: Wheel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-10 relative overflow-hidden">
        {/* Toggle Button */}
        <button
          className={`absolute top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 border border-white/20 
                ${
                  isPanelVisible
                    ? "right-[-20px] group-hover:right-4 opacity-0 group-hover:opacity-100"
                    : "right-4 opacity-100 shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                }`}
          title={isPanelVisible ? "Hide Panel" : "Show Panel"}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          {isPanelVisible ? (
            <ChevronRight size={24} />
          ) : (
            <ChevronLeft size={24} />
          )}
        </button>

        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 pointer-events-none" />

        <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
          {/* Pointer */}
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 z-20 drop-shadow-xl filter">
            <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[40px] border-r-white transform rotate-0" />
            <div className="absolute top-1/2 right-[2px] -translate-y-1/2 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[32px] border-r-red-600 transform rotate-0" />
          </div>

          {/* Wheel Container */}
          <motion.div
            animate={controls}
            className="w-full h-full rounded-full overflow-hidden shadow-2xl border-[8px] border-white/10"
            initial={{ rotate: 0 }}
            style={{ boxShadow: "0 0 60px rgba(0,0,0,0.6)" }}
          >
            <svg className="w-full h-full border-none" viewBox="-1 -1 2 2">
              {names.map((name, i) => (
                <WheelSegment
                  key={i}
                  index={i}
                  text={name}
                  total={names.length}
                />
              ))}
            </svg>
          </motion.div>

          {/* Center Button */}
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white rounded-full z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-gray-100"
            type="button"
            onClick={handleSpin}
          >
            <span className="text-gray-800 font-black text-lg select-none tracking-wide">
              SPIN
            </span>
          </button>
        </div>

        {/* Winner Modal Overlay */}
        {winner && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white text-gray-900 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <h2 className="text-3xl font-bold mb-1 text-gray-800">Winner!</h2>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 my-6 break-words leading-tight">
                {winner}
              </div>

              <div className="flex gap-3 justify-center">
                {/* <button 
                            onClick={() => setWinner(null)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold transition-colors"
                        >
                            Close
                        </button> */}
                <button
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                  onClick={() => {
                    const newText = textInput
                      .split("\n")
                      .filter((n) => n.trim() !== winner)
                      .join("\n");

                    setTextInput(newText);
                    setWinner(null);
                  }}
                >
                  <XCircle size={18} /> Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right Area: Controls */}
      <motion.div
        animate={{
          width: isPanelVisible ? 400 : 0,
          opacity: isPanelVisible ? 1 : 0,
          x: isPanelVisible ? 0 : 50,
        }}
        className="bg-[#2b3040] shadow-xl border-l border-white/5 flex flex-col z-10 overflow-hidden relative"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-[400px] h-full flex flex-col">
          {/* Tabs Header */}
          <div className="flex border-b border-white/10">
            <button
              className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors relative
                        ${activeTab === "entries" ? "text-white bg-[#353b4d]" : "text-gray-400 hover:text-white hover:bg-[#353b4d]/50"}
                    `}
              onClick={() => setActiveTab("entries")}
            >
              <List size={16} /> Entries
              <span className="bg-white/10 text-xs py-0.5 px-2 rounded-full">
                {names.length}
              </span>
              {activeTab === "entries" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors relative
                        ${activeTab === "results" ? "text-white bg-[#353b4d]" : "text-gray-400 hover:text-white hover:bg-[#353b4d]/50"}
                    `}
              onClick={() => setActiveTab("results")}
            >
              <Trophy size={16} /> Results
              <span className="bg-white/10 text-xs py-0.5 px-2 rounded-full">
                {results.length}
              </span>
              {activeTab === "results" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {activeTab === "entries" && (
              <>
                {/* Toolbar */}
                <div className="flex gap-2 mb-3">
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-lg shadow-blue-900/20"
                    onClick={shuffleNames}
                  >
                    <Shuffle size={14} /> Shuffle
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-[#3f465a] hover:bg-[#4b5269] text-white text-xs font-semibold rounded-lg transition border border-white/5"
                    onClick={sortNames}
                  >
                    <SortAsc size={14} /> Sort
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-[#3f465a] hover:bg-[#4b5269] text-white text-xs font-semibold rounded-lg transition border border-white/5"
                    title="Generate Numbers"
                    onClick={() => setIsNumberGenOpen(true)}
                  >
                    <Hash size={14} /> Numbers
                  </button>
                  <button
                    className="p-2 bg-[#3f465a] hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition border border-white/5"
                    title="Reset All Data"
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    className="p-2 bg-[#3f465a] hover:bg-[#4b5269] text-gray-400 hover:text-white rounded-lg transition border border-white/5"
                    title="Settings"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    <Settings size={14} />
                  </button>
                  <div className="flex-1" />
                </div>

                {/* Main Input Area */}
                <div className="flex-1 relative group">
                  <textarea
                    className="w-full h-full bg-[#1b1f2b] text-gray-200 p-4 rounded-xl border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none outline-none font-mono text-sm leading-relaxed custom-scrollbar"
                    placeholder="Enter names here (one per line)..."
                    spellCheck={false}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 bg-[#1b1f2b]/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                    Autosaved
                  </div>
                </div>
              </>
            )}

            {activeTab === "results" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                    <Trophy className="mb-4 text-gray-600" size={48} />
                    <p>No winners yet.</p>
                    <p className="text-sm">Spin the wheel to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-[#3f465a]/30 rounded-lg border border-white/5 animate-in fade-in slide-in-from-right-4 duration-300"
                      >
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                          {results.length - i}
                        </span>
                        <span className="font-medium text-gray-200">{r}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <PasswordModal
        correctPassword="651123"
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => setIsSettingsOpen(true)}
      />

      <NumberGeneratorModal
        isOpen={isNumberGenOpen}
        onClose={() => setIsNumberGenOpen(false)}
        onGenerate={generateNumbers}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAll}
      />

      <SecretSettingsModal
        forcedWinnersMap={forcedWinnersMap}
        isOpen={isSettingsOpen}
        names={names}
        resetSession={() => {
          setSpinCount(0);
          setResults([]);
          if (typeof window !== "undefined") {
            localStorage.setItem("wheelSpinCount", "0");
            localStorage.setItem("wheelResults", "[]");
          }
        }}
        setForcedWinnersMap={setForcedWinnersMap}
        setTotalPrizes={setTotalPrizes}
        spinCount={spinCount}
        totalPrizes={totalPrizes}
        onClose={() => setIsSettingsOpen(false)}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1b1f2b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f465a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5269;
        }
      `,
        }}
      />
    </div>
  );
}
