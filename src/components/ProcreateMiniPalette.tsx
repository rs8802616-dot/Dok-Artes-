import React, { useState, useRef } from 'react';
import { X, Pipette, Move, Palette } from 'lucide-react';

interface ProcreateMiniPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  onActivateEyedropper: () => void;
  recentColors: string[];
}

export function ProcreateMiniPalette({
  isOpen,
  onClose,
  currentColor,
  onSelectColor,
  onActivateEyedropper,
  recentColors,
}: ProcreateMiniPaletteProps) {
  const [position, setPosition] = useState({ x: 24, y: 120 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 180, e.clientX - dragOffset.current.x)),
      y: Math.max(50, Math.min(window.innerHeight - 200, e.clientY - dragOffset.current.y)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const paletteColors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    ...recentColors.slice(0, 10),
  ];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-40 w-44 bg-[#141720]/95 backdrop-blur-xl border border-[#272d3c] rounded-2xl shadow-2xl p-2.5 select-none text-slate-200 animate-in fade-in duration-150"
    >
      {/* Mini Palette Header & Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between pb-2 mb-2 border-b border-[#252b39] cursor-grab active:cursor-grabbing text-slate-400"
      >
        <div className="flex items-center gap-1.5 text-slate-400">
          <Move size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Paleta Mini
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onActivateEyedropper}
            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-[#202532] transition"
            title="Conta-gotas"
          >
            <Pipette size={12} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202532] transition"
            title="Fechar / Reanexar"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Active Color Preview & Hex */}
      <div className="flex items-center gap-2 mb-2 bg-[#1b202c] p-1.5 rounded-xl border border-[#272e3f]">
        <div
          className="w-7 h-7 rounded-lg border border-white/20 shadow-inner shrink-0"
          style={{ backgroundColor: currentColor }}
        />
        <span className="font-mono text-xs font-bold text-white uppercase truncate">
          {currentColor}
        </span>
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {paletteColors.slice(0, 15).map((color, idx) => (
          <button
            key={`${color}-${idx}`}
            onClick={() => onSelectColor(color)}
            className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 active:scale-95 shadow-sm ${
              currentColor.toLowerCase() === color.toLowerCase()
                ? 'border-sky-400 ring-2 ring-sky-400/40'
                : 'border-white/10 hover:border-white/40'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
