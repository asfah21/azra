"use client";

import React, { useState, useEffect } from "react";
import { X, Settings, Target, RefreshCw, Trash2, Trophy, Plus, UserCheck } from "lucide-react";

interface SecretSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forcedWinnersMap: Record<number, string>;
  setForcedWinnersMap: (map: Record<number, string>) => void;
  totalPrizes: number;
  setTotalPrizes: (num: number) => void;
  spinCount: number;
  resetSession: () => void;
  names: string[];
}

export default function SecretSettingsModal({ 
  isOpen, 
  onClose, 
  forcedWinnersMap, 
  setForcedWinnersMap,
  totalPrizes,
  setTotalPrizes,
  spinCount,
  resetSession,
  names 
}: SecretSettingsModalProps) {
  const [localMap, setLocalMap] = useState<Record<number, string>>({});
  const [localTotal, setLocalTotal] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setLocalMap(forcedWinnersMap);
      setLocalTotal(totalPrizes);
    }
  }, [isOpen, forcedWinnersMap, totalPrizes]);

  if (!isOpen) return null;

  const handleSave = () => {
    setForcedWinnersMap(localMap);
    setTotalPrizes(localTotal);
    onClose();
  };

  const updateSlot = (slot: number, name: string) => {
    const newMap = { ...localMap };
    if (name === "") {
      delete newMap[slot];
    } else {
      newMap[slot] = name;
    }
    setLocalMap(newMap);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#2b3040] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Settings size={20} className="text-blue-500" />
            Secret Event Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Section 1: Session Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1b1f2b] p-4 rounded-xl border border-white/5 disabled:opacity-50">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Prizes to Give</label>
                <input 
                    type="number" 
                    value={localTotal}
                    onChange={(e) => setLocalTotal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-transparent text-2xl font-black text-white outline-none w-full"
                />
            </div>
            <div className="bg-[#1b1f2b] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Progress</label>
                <div className="text-xl font-bold text-white">
                    {spinCount} / {localTotal} <span className="text-xs text-gray-500 font-normal ml-1">Spins</span>
                </div>
                <button 
                    onClick={() => confirm("Reset all progress?") && resetSession()}
                    className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase mt-1 flex items-center gap-1"
                >
                    <Trash2 size={10} /> Reset Session
                </button>
            </div>
          </div>

          {/* Section 2: Rigging Table */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wide">
              <UserCheck size={16} className="text-green-500" /> Assign Winners to Slots
            </label>
            
            <div className="bg-[#1b1f2b] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-gray-500 text-[10px] uppercase font-bold">
                        <tr>
                            <th className="px-4 py-3 w-16">Spin #</th>
                            <th className="px-4 py-3">Winner (Select from List)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {Array.from({ length: localTotal }).map((_, i) => {
                            const slot = i + 1;
                            const isCompleted = slot <= spinCount;
                            return (
                                <tr key={slot} className={isCompleted ? "opacity-30 bg-black/10" : "hover:bg-white/[0.02]"}>
                                    <td className="px-4 py-3 font-mono font-bold text-gray-400">
                                        #{slot}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <select 
                                                value={localMap[slot] || ""}
                                                onChange={(e) => updateSlot(slot, e.target.value)}
                                                className={`w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none appearance-none transition focus:border-blue-500/50 ${localMap[slot] ? 'text-blue-400 font-bold' : 'text-gray-500'}`}
                                                disabled={isCompleted}
                                            >
                                                <option value="">- Random Spin -</option>
                                                {names.map((name, idx) => {
                                                    const isAlreadySelected = Object.entries(localMap).some(([s, n]) => n === name && Number(s) !== slot);
                                                    if (isAlreadySelected) return null;
                                                    return (
                                                        <option key={idx} value={name}>{name}</option>
                                                    );
                                                })}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                                <UserCheck size={14} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#1b1f2b]/50">
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Save Event Settings
          </button>
        </div>
      </div>
    </div>
  );
}
