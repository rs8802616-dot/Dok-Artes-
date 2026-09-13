import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface ProcreateSidebarProps {
  brushSize: number;
  brushOpacity: number;
  onChangeSize: (size: number) => void;
  onChangeOpacity: (opacity: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTriggerQuickMenu: () => void;
  onActivateEyedropper: () => void;
  isLeftHanded?: boolean;
}

export function ProcreateSidebar({
  brushSize,
  brushOpacity,
  onChangeSize,
  onChangeOpacity,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTriggerQuickMenu,
  onActivateEyedropper,
  isLeftHanded = false,
}: ProcreateSidebarProps) {
  const [isDraggingSize, setIsDraggingSize] = useState(false);
  const [isDraggingOpacity, setIsDraggingOpacity] = useState(false);
  const [showSizeBubble, setShowSizeBubble] = useState(false);
  const [showOpacityBubble, setShowOpacityBubble] = useState(false);

  const sizeTrackRef = useRef<HTMLDivElement>(null);
  const opacityTrackRef = useRef<HTMLDivElement>(null);

  // Calculate percentage of track
  // brushSize ranges 1 - 150
  const sizePercent = Math.max(1, Math.min(100, Math.round((brushSize / 150) * 100)));
  const opacityPercent = Math.round(brushOpacity * 100);

  // Handle Size Drag
  const handleSizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingSize(true);
    setShowSizeBubble(true);
    updateSizeFromPointer(e.clientY);
  };

  const handleSizePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSize) return;
    updateSizeFromPointer(e.clientY);
  };

  const handleSizePointerUp = (e: React.PointerEvent) => {
    if (isDraggingSize) {
      setIsDraggingSize(false);
      setTimeout(() => setShowSizeBubble(false), 800);
    }
  };

  const updateSizeFromPointer = useCallback(
    (clientY: number) => {
      if (!sizeTrackRef.current) return;
      const rect = sizeTrackRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      // Procreate: top of track = 100%, bottom of track = 1%
      const rawFrac = 1 - relativeY / rect.height;
      const clampedFrac = Math.max(0.01, Math.min(1.0, rawFrac));
      const newSize = Math.max(1, Math.round(clampedFrac * 150));
      onChangeSize(newSize);
    },
    [onChangeSize]
  );

  // Handle Opacity Drag
  const handleOpacityPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingOpacity(true);
    setShowOpacityBubble(true);
    updateOpacityFromPointer(e.clientY);
  };

  const handleOpacityPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingOpacity) return;
    updateOpacityFromPointer(e.clientY);
  };

  const handleOpacityPointerUp = (e: React.PointerEvent) => {
    if (isDraggingOpacity) {
      setIsDraggingOpacity(false);
      setTimeout(() => setShowOpacityBubble(false), 800);
    }
  };

  const updateOpacityFromPointer = useCallback(
    (clientY: number) => {
      if (!opacityTrackRef.current) return;
      const rect = opacityTrackRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      // top = 100%, bottom = 1%
      const rawFrac = 1 - relativeY / rect.height;
      const clampedFrac = Math.max(0.01, Math.min(1.0, rawFrac));
      onChangeOpacity(clampedFrac);
    },
    [onChangeOpacity]
  );

  return (
    <aside
      id="procreate-sidebar"
      className={`fixed top-1/2 -translate-y-1/2 z-30 flex flex-col items-center select-none pointer-events-none transition-all duration-200 ${
        isLeftHanded ? 'right-4' : 'left-4'
      }`}
    >
      <div className="flex flex-col items-center gap-3.5 pointer-events-auto">
        {/* SIZE SLIDER (TAMANHO) */}
        <div className="relative flex items-center">
          <div
            ref={sizeTrackRef}
            id="size-slider-track"
            onPointerDown={handleSizePointerDown}
            onPointerMove={handleSizePointerMove}
            onPointerUp={handleSizePointerUp}
            onPointerCancel={handleSizePointerUp}
            onMouseEnter={() => setShowSizeBubble(true)}
            onMouseLeave={() => {
              if (!isDraggingSize) setShowSizeBubble(false);
            }}
            className="w-9 h-36 bg-[#16181d]/90 backdrop-blur-md border border-[#2b2f3a] rounded-full p-1 cursor-ns-resize shadow-2xl relative flex flex-col justify-end items-center touch-none group hover:border-[#3e4453] transition-colors"
            title="Tamanho do Pincel"
          >
            {/* Filled Level Background */}
            <div
              className="w-full bg-[#323846] rounded-full transition-all duration-75 pointer-events-none"
              style={{ height: `${sizePercent}%` }}
            />

            {/* Draggable Notch Handle */}
            <div
              className="absolute w-7 h-3 rounded-full bg-[#f1f5f9] shadow-md border border-[#1e293b] pointer-events-none transition-all duration-75"
              style={{
                bottom: `calc(${sizePercent}% - 6px)`,
              }}
            />
          </div>

          {/* Size Tooltip Bubble */}
          {showSizeBubble && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                isLeftHanded ? 'right-12' : 'left-12'
              } px-2.5 py-1 bg-[#121316] text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#2a2e3a] whitespace-nowrap pointer-events-none animate-in fade-in duration-100 z-50`}
            >
              {sizePercent}%
            </div>
          )}
        </div>

        {/* PROCREATE MODIFIER BUTTON (O QUADRADO CENTRAL) */}
        <button
          id="procreate-modifier-btn"
          onClick={onTriggerQuickMenu}
          onContextMenu={(e) => {
            e.preventDefault();
            onActivateEyedropper();
          }}
          className="w-9 h-9 rounded-xl bg-[#1a1d24]/90 backdrop-blur-md border border-[#2e3340] text-slate-300 hover:text-white hover:bg-[#252a35] hover:border-sky-500/60 shadow-xl flex items-center justify-center transition active:scale-95 group"
          title="Modificador Procreate: Toque para QuickMenu ou clique com botão direito para Conta-Gotas"
        >
          <div className="w-3.5 h-3.5 border-2 border-slate-400 group-hover:border-sky-400 rounded-sm transition-colors" />
        </button>

        {/* OPACITY SLIDER (OPACIDADE) */}
        <div className="relative flex items-center">
          <div
            ref={opacityTrackRef}
            id="opacity-slider-track"
            onPointerDown={handleOpacityPointerDown}
            onPointerMove={handleOpacityPointerMove}
            onPointerUp={handleOpacityPointerUp}
            onPointerCancel={handleOpacityPointerUp}
            onMouseEnter={() => setShowOpacityBubble(true)}
            onMouseLeave={() => {
              if (!isDraggingOpacity) setShowOpacityBubble(false);
            }}
            className="w-9 h-36 bg-[#16181d]/90 backdrop-blur-md border border-[#2b2f3a] rounded-full p-1 cursor-ns-resize shadow-2xl relative flex flex-col justify-end items-center touch-none group hover:border-[#3e4453] transition-colors"
            title="Opacidade do Pincel"
          >
            {/* Filled Level Background */}
            <div
              className="w-full bg-[#323846] rounded-full transition-all duration-75 pointer-events-none"
              style={{ height: `${opacityPercent}%` }}
            />

            {/* Draggable Notch Handle */}
            <div
              className="absolute w-7 h-3 rounded-full bg-[#f1f5f9] shadow-md border border-[#1e293b] pointer-events-none transition-all duration-75"
              style={{
                bottom: `calc(${opacityPercent}% - 6px)`,
              }}
            />
          </div>

          {/* Opacity Tooltip Bubble */}
          {showOpacityBubble && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                isLeftHanded ? 'right-12' : 'left-12'
              } px-2.5 py-1 bg-[#121316] text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#2a2e3a] whitespace-nowrap pointer-events-none animate-in fade-in duration-100 z-50`}
            >
              {opacityPercent}%
            </div>
          )}
        </div>

        {/* UNDO / REDO BUTTONS */}
        <div className="flex flex-col gap-1.5 mt-1">
          <button
            id="sidebar-undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-9 h-9 rounded-xl bg-[#16181d]/90 backdrop-blur-md border border-[#2b2f3a] flex items-center justify-center shadow-lg transition active:scale-90 ${
              canUndo
                ? 'text-slate-200 hover:text-white hover:bg-[#252a35] hover:border-slate-500'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            title="Desfazer (Toque com dois dedos)"
          >
            <Undo2 size={16} />
          </button>
          <button
            id="sidebar-redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-9 h-9 rounded-xl bg-[#16181d]/90 backdrop-blur-md border border-[#2b2f3a] flex items-center justify-center shadow-lg transition active:scale-90 ${
              canRedo
                ? 'text-slate-200 hover:text-white hover:bg-[#252a35] hover:border-slate-500'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            title="Refazer (Toque com três dedos)"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
