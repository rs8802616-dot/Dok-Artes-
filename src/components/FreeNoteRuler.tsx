import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, X, Move, Compass, Check } from 'lucide-react';

interface FreeNoteRulerProps {
  onClose: () => void;
  onDrawRulerLine: (angleRad: number, cx: number, cy: number, length: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export function FreeNoteRuler({
  onClose,
  onDrawRulerLine,
  canvasWidth,
  canvasHeight,
}: FreeNoteRulerProps) {
  const [posX, setPosX] = useState(window.innerWidth / 2);
  const [posY, setPosY] = useState(window.innerHeight / 2);
  const [angleDeg, setAngleDeg] = useState(0); // 0 to 360 degrees
  const [rulerLength, setRulerLength] = useState(480);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rulerX: 0, rulerY: 0 });

  const isRotating = useRef(false);
  const rotateStart = useRef({ angle: 0, startAngle: 0 });

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rulerX: posX,
      rulerY: posY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosX(dragStart.current.rulerX + dx);
      setPosY(dragStart.current.rulerY + dy);
    }
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerDownRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    isRotating.current = true;
    const rad = Math.atan2(e.clientY - posY, e.clientX - posX);
    rotateStart.current = { angle: rad, startAngle: angleDeg };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveRotate = (e: React.PointerEvent) => {
    if (isRotating.current) {
      const currentRad = Math.atan2(e.clientY - posY, e.clientX - posX);
      const diffRad = currentRad - rotateStart.current.angle;
      let newDeg = Math.round(rotateStart.current.startAngle + (diffRad * 180) / Math.PI);
      // Snap to 0, 45, 90, 180 within 3 degrees
      [0, 45, 90, 135, 180, 225, 270, 315, 360].forEach((snap) => {
        if (Math.abs(newDeg - snap) < 3) newDeg = snap;
      });
      setAngleDeg((newDeg % 360 + 360) % 360);
    }
  };

  const handlePointerUpRotate = (e: React.PointerEvent) => {
    isRotating.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleSnap90 = () => {
    setAngleDeg((Math.round(angleDeg / 90) * 90 + 90) % 360);
  };

  const handleTraceAlongEdge = () => {
    const rad = (angleDeg * Math.PI) / 180;
    onDrawRulerLine(rad, posX, posY, rulerLength);
  };

  // Generate ticks for ruler
  const ticks = [];
  const tickCount = Math.floor(rulerLength / 12);
  for (let i = 0; i <= tickCount; i++) {
    const isMajor = i % 5 === 0;
    const isCm = i % 10 === 0;
    ticks.push(
      <div
        key={i}
        className={`absolute bottom-0 bg-slate-400 ${
          isCm ? 'h-4 w-[1.5px] bg-slate-200' : isMajor ? 'h-2.5 w-[1px]' : 'h-1.5 w-[1px] opacity-60'
        }`}
        style={{ left: `${(i / tickCount) * 100}%` }}
      >
        {isCm && (
          <span className="absolute -top-3 left-1 text-[8px] font-mono text-slate-300 pointer-events-none">
            {i / 10}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed z-25 pointer-events-auto select-none"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
      }}
    >
      {/* Ruler Body */}
      <div
        style={{ width: `${rulerLength}px` }}
        className="h-16 bg-[#161c28]/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl shadow-2xl relative flex items-center justify-between px-4"
      >
        {/* Drag handle */}
        <div
          onPointerDown={handlePointerDownDrag}
          onPointerMove={handlePointerMoveDrag}
          onPointerUp={handlePointerUpDrag}
          className="cursor-move flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-[#222b3d] transition"
          title="Arrastar Régua"
        >
          <Move size={15} className="text-emerald-400" />
          <span className="text-[11px] font-semibold font-mono">{angleDeg}°</span>
        </div>

        {/* Center buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTraceAlongEdge}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-lg transition shadow flex items-center gap-1"
            title="Desenhar traço reto ao longo da régua"
          >
            <Check size={13} />
            <span>Traçar</span>
          </button>
          <button
            onClick={handleSnap90}
            className="p-1 text-slate-300 hover:text-white hover:bg-[#222b3d] rounded-lg transition"
            title="Girar 90 graus"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Rotation dial handle */}
        <div
          onPointerDown={handlePointerDownRotate}
          onPointerMove={handlePointerMoveRotate}
          onPointerUp={handlePointerUpRotate}
          className="cursor-grab active:cursor-grabbing p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-[#222b3d] rounded-lg transition"
          title="Girar ângulo livremente"
        >
          <Compass size={18} />
        </div>

        {/* Close ruler */}
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-red-950/40 rounded-lg transition ml-1"
          title="Fechar Régua"
        >
          <X size={15} />
        </button>

        {/* Ticks on top edge */}
        <div className="absolute top-0 left-4 right-4 h-4 overflow-hidden pointer-events-none">
          {ticks}
        </div>
      </div>
    </div>
  );
}
