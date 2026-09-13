import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Maximize2, Move } from 'lucide-react';

interface ProcreateReferenceWindowProps {
  isOpen: boolean;
  onClose: () => void;
  canvasPreviewUrl?: string;
  onPickColor?: (color: string) => void;
}

export function ProcreateReferenceWindow({
  isOpen,
  onClose,
  canvasPreviewUrl,
  onPickColor,
}: ProcreateReferenceWindowProps) {
  const [tab, setTab] = useState<'canvas' | 'image'>('canvas');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 220, e.clientX - dragStart.current.x)),
      y: Math.max(50, Math.min(window.innerHeight - 200, e.clientY - dragStart.current.y)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="procreate-reference-window"
      className="fixed z-45 w-56 sm:w-64 bg-[#14161e]/95 backdrop-blur-md border border-[#2b3140] rounded-2xl shadow-2xl overflow-hidden select-none flex flex-col animate-in zoom-in-95 duration-150"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Draggable Titlebar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-9 px-3 bg-[#101217] border-b border-[#242936] flex items-center justify-between cursor-move text-slate-300"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Move size={12} className="text-slate-400" />
          <span>Referência</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab(tab === 'canvas' ? 'image' : 'canvas')}
            className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e232f] text-slate-300 hover:text-white"
          >
            {tab === 'canvas' ? 'Foto' : 'Tela'}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content View */}
      <div className="h-44 bg-[#0a0c0f] flex items-center justify-center p-2 relative overflow-hidden">
        {tab === 'canvas' ? (
          canvasPreviewUrl ? (
            <img
              src={canvasPreviewUrl}
              alt="Canvas Reference"
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <span className="text-[11px] text-slate-500">Aguardando traços...</span>
          )
        ) : customImage ? (
          <img
            src={customImage}
            alt="Custom Reference"
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <ImageIcon size={13} />
              <span>Importar Imagem</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  setCustomImage(url);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
