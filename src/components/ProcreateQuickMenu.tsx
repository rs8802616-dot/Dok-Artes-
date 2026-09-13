import React, { useEffect, useRef } from 'react';
import {
  Layers,
  Copy,
  Maximize2,
  Trash2,
  Contrast,
  FlipHorizontal,
  X
} from 'lucide-react';

interface ProcreateQuickMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewLayer: () => void;
  onCopyCanvas: () => void;
  onToggleFullscreen: () => void;
  onClearLayer: () => void;
  onInvertColor: () => void;
  onFlipHorizontal: () => void;
}

export function ProcreateQuickMenu({
  isOpen,
  onClose,
  onNewLayer,
  onCopyCanvas,
  onToggleFullscreen,
  onClearLayer,
  onInvertColor,
  onFlipHorizontal,
}: ProcreateQuickMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs select-none">
      <div
        ref={menuRef}
        id="procreate-quick-menu"
        className="relative w-72 h-72 rounded-full flex items-center justify-center animate-in zoom-in-75 duration-150"
      >
        {/* Center Close/Dismiss Button */}
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-[#181b22] border-2 border-[#363d4f] text-slate-400 hover:text-white hover:border-sky-400 shadow-2xl flex items-center justify-center transition z-20 group"
          title="Fechar QuickMenu"
        >
          <div className="w-5 h-5 rounded border border-slate-400 group-hover:border-sky-400 flex items-center justify-center">
            <X size={12} />
          </div>
        </button>

        {/* 1. TOP: Nova Camada */}
        <button
          onClick={() => {
            onNewLayer();
            onClose();
          }}
          className="absolute top-0 -translate-y-1 w-32 py-2 px-3 rounded-2xl bg-[#16181e]/95 hover:bg-[#252b38] border border-[#2b3140] hover:border-sky-500/60 shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition active:scale-95"
        >
          <Layers size={14} className="text-sky-400" />
          <span>Nova Camada</span>
        </button>

        {/* 2. TOP-RIGHT: Copiar */}
        <button
          onClick={() => {
            onCopyCanvas();
            onClose();
          }}
          className="absolute top-12 right-0 translate-x-2 w-30 py-2 px-3 rounded-2xl bg-[#16181e]/95 hover:bg-[#252b38] border border-[#2b3140] hover:border-sky-500/60 shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition active:scale-95"
        >
          <Copy size={14} className="text-emerald-400" />
          <span>Copiar</span>
        </button>

        {/* 3. BOTTOM-RIGHT: Tela Cheia */}
        <button
          onClick={() => {
            onToggleFullscreen();
            onClose();
          }}
          className="absolute bottom-12 right-0 translate-x-2 w-30 py-2 px-3 rounded-2xl bg-[#16181e]/95 hover:bg-[#252b38] border border-[#2b3140] hover:border-sky-500/60 shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition active:scale-95"
        >
          <Maximize2 size={14} className="text-amber-400" />
          <span>Tela Cheia</span>
        </button>

        {/* 4. BOTTOM: Limpar Camada */}
        <button
          onClick={() => {
            onClearLayer();
            onClose();
          }}
          className="absolute bottom-0 translate-y-1 w-32 py-2 px-3 rounded-2xl bg-[#16181e]/95 hover:bg-[#252b38] border border-[#2b3140] hover:border-red-500/60 shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-red-400 transition active:scale-95"
        >
          <Trash2 size={14} className="text-red-400" />
          <span>Limpar Camada</span>
        </button>

        {/* 5. BOTTOM-LEFT: Inverter Cor */}
        <button
          onClick={() => {
            onInvertColor();
            onClose();
          }}
          className="absolute bottom-12 left-0 -translate-x-2 w-30 py-2 px-3 rounded-2xl bg-[#16181e]/95 hover:bg-[#252b38] border border-[#2b3140] hover:border-sky-500/60 shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition active:scale-95"
        >
          <Contrast size={14} className="text-violet-400" />
          <span>Inverter</span>
        </button>

        {/* 6. TOP-LEFT: Virar Horizontal */}
        <button
          onClick={() => {
            onFlipHorizontal();
            onClose();
          }}
          className="absolute top-12 left-0 -translate-x-2 w-30 py-2 px-3 rounded-2xl bg-[#16181e]/95 hover:bg-[#252b38] border border-[#2b3140] hover:border-sky-500/60 shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition active:scale-95"
        >
          <FlipHorizontal size={14} className="text-sky-400" />
          <span>Virar H</span>
        </button>
      </div>
    </div>
  );
}
