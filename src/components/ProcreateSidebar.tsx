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
  const [sidebarOffsetY, setSidebarOffsetY] = useState(0);
  const isDraggingSidebar = useRef(false);
  const dragStartY = useRef(0);
  const initialOffsetY = useRef(0);

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

  // Handle vertical position dragging on tablet/desktop
  const handleGripPointerDown = (e: React.PointerEvent) => {
    isDraggingSidebar.current = true;
    dragStartY.current = e.clientY;
    initialOffsetY.current = sidebarOffsetY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleGripPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSidebar.current) return;
    const deltaY = e.clientY - dragStartY.current;
    const maxOffset = window.innerHeight * 0.35;
    const nextOffset = Math.max(-maxOffset, Math.min(maxOffset, initialOffsetY.current + deltaY));
    setSidebarOffsetY(nextOffset);
  };

  const handleGripPointerUp = (e: React.PointerEvent) => {
    isDraggingSidebar.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <aside
      id="procreate-sidebar"
      style={{ transform: `translateY(calc(-50% + ${sidebarOffsetY}px))` }}
      className={`fixed top-1/2 z-30 flex flex-col items-center select-none pointer-events-none transition-[left,right] duration-200 ${
        isLeftHanded ? 'right-3 sm:right-5' : 'left-3 sm:left-5'
      }`}
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-auto">
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
            className="w-10 sm:w-11 h-38 sm:h-44 bg-[#14161c]/95 backdrop-blur-md border border-[#2b303d] rounded-full p-1 cursor-ns-resize shadow-2xl relative flex flex-col justify-end items-center touch-none group hover:border-[#404759] transition-colors"
            title="Tamanho do Pincel (Arraste para ajustar)"
          >
            {/* Filled Level Background */}
            <div
              className="w-full bg-[#2f3545] rounded-full transition-all duration-75 pointer-events-none"
              style={{ height: `${sizePercent}%` }}
            />

            {/* Draggable Notch Handle */}
            <div
              className="absolute w-8 sm:w-9 h-3.5 sm:h-4 rounded-full bg-[#f8fafc] shadow-lg border border-[#1e293b] pointer-events-none transition-all duration-75"
              style={{
                bottom: `calc(${sizePercent}% - 7px)`,
              }}
            />
          </div>

          {/* Size Tooltip Bubble */}
          {showSizeBubble && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                isLeftHanded ? 'right-14' : 'left-14'
              } px-3 py-1.5 bg-[#121316] text-[#f1f5f9] text-xs font-bold rounded-xl shadow-2xl border border-[#2e3444] whitespace-nowrap pointer-events-none animate-in fade-in duration-100 z-50`}
            >
              {sizePercent}%
            </div>
          )}
        </div>

        {/* PROCREATE MODIFIER BUTTON (O QUADRADO CENTRAL COM AJUSTE VERTICAL) */}
        <div className="relative flex items-center group/mod">
          <button
            id="procreate-modifier-btn"
            onClick={onTriggerQuickMenu}
            onContextMenu={(e) => {
              e.preventDefault();
              onActivateEyedropper();
            }}
            onPointerDown={handleGripPointerDown}
            onPointerMove={handleGripPointerMove}
            onPointerUp={handleGripPointerUp}
            onPointerCancel={handleGripPointerUp}
            className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-[#181b22]/95 backdrop-blur-md border border-[#2c3240] text-slate-300 hover:text-white hover:bg-[#232732] hover:border-sky-500/60 shadow-xl flex items-center justify-center transition active:scale-95 touch-none cursor-grab active:cursor-grabbing"
            title="Modificador Procreate: Toque para QuickMenu / Arraste para reposicionar a barra no tablet"
          >
            <div className="w-4 h-4 border-2 border-slate-300 group-hover/mod:border-sky-400 rounded-sm transition-colors" />
          </button>
        </div>

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
            className="w-10 sm:w-11 h-38 sm:h-44 bg-[#14161c]/95 backdrop-blur-md border border-[#2b303d] rounded-full p-1 cursor-ns-resize shadow-2xl relative flex flex-col justify-end items-center touch-none group hover:border-[#404759] transition-colors"
            title="Opacidade do Pincel (Arraste para ajustar)"
          >
            {/* Filled Level Background */}
            <div
              className="w-full bg-[#2f3545] rounded-full transition-all duration-75 pointer-events-none"
              style={{ height: `${opacityPercent}%` }}
            />

            {/* Draggable Notch Handle */}
            <div
              className="absolute w-8 sm:w-9 h-3.5 sm:h-4 rounded-full bg-[#f8fafc] shadow-lg border border-[#1e293b] pointer-events-none transition-all duration-75"
              style={{
                bottom: `calc(${opacityPercent}% - 7px)`,
              }}
            />
          </div>

          {/* Opacity Tooltip Bubble */}
          {showOpacityBubble && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                isLeftHanded ? 'right-14' : 'left-14'
              } px-3 py-1.5 bg-[#121316] text-[#f1f5f9] text-xs font-bold rounded-xl shadow-2xl border border-[#2e3444] whitespace-nowrap pointer-events-none animate-in fade-in duration-100 z-50`}
            >
              {opacityPercent}%
            </div>
          )}
        </div>

        {/* UNDO / REDO BUTTONS */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            id="sidebar-undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-[#14161c]/95 backdrop-blur-md border border-[#2b303d] flex items-center justify-center shadow-lg transition active:scale-90 ${
              canUndo
                ? 'text-slate-200 hover:text-white hover:bg-[#232732] hover:border-slate-400'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            title="Desfazer (Toque com dois dedos na tela)"
          >
            <Undo2 size={17} />
          </button>
          <button
            id="sidebar-redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-[#14161c]/95 backdrop-blur-md border border-[#2b303d] flex items-center justify-center shadow-lg transition active:scale-90 ${
              canRedo
                ? 'text-slate-200 hover:text-white hover:bg-[#232732] hover:border-slate-400'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            title="Refazer (Toque com três dedos na tela)"
          >
            <Redo2 size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
