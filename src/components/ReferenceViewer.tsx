import React, { useState, useRef } from 'react';
import { X, Upload, Move, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface ReferenceViewerProps {
  onClose: () => void;
}

export function ReferenceViewer({ onClose }: ReferenceViewerProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [opacity, setOpacity] = useState(0.9);
  const [posX, setPosX] = useState(window.innerWidth - 320);
  const [posY, setPosY] = useState(90);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, curX: 0, curY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      curX: posX,
      curY: posY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      setPosX(dragStart.current.curX + (e.clientX - dragStart.current.x));
      setPosY(dragStart.current.curY + (e.clientY - dragStart.current.y));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        opacity,
      }}
      className="fixed z-30 w-72 bg-[#151922]/95 backdrop-blur-md border border-[#2b3344] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
    >
      {/* Title bar / drag handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-3 py-2 bg-[#1b212d] border-b border-[#283142] flex items-center justify-between cursor-move select-none"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Move size={14} className="text-purple-400" />
          <span>Referência Visual</span>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 text-slate-400 hover:text-white rounded"
        >
          <X size={15} />
        </button>
      </div>

      {/* Image display area */}
      <div className="relative w-full h-52 bg-[#0c0e14] flex items-center justify-center overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Reference"
            style={{ transform: `scale(${zoom})` }}
            className="max-w-full max-h-full object-contain transition-transform"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <p className="text-xs text-slate-400">Carregue uma imagem para usar de referência</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Upload size={14} />
              <span>Importar Imagem</span>
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Controls: Zoom, Opacity, Change file */}
      {imageSrc && (
        <div className="p-2 border-t border-[#242b3a] bg-[#12151d] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setZoom(Math.max(0.4, zoom - 0.2))}
              className="p-1 hover:text-white rounded"
            >
              <ZoomOut size={14} />
            </button>
            <span className="font-mono text-[10px]">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
              className="p-1 hover:text-white rounded"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Eye size={13} />
            <input
              type="range"
              min="20"
              max="100"
              value={Math.round(opacity * 100)}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="w-16 accent-purple-500 h-1 bg-[#283244] rounded cursor-pointer"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] text-purple-400 hover:underline font-medium"
          >
            Trocar
          </button>
        </div>
      )}
    </div>
  );
}
