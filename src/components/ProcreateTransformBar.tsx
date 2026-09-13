import React from 'react';
import { Check, FlipHorizontal, FlipVertical, RotateCw, Maximize, RotateCcw } from 'lucide-react';

interface ProcreateTransformBarProps {
  transformMode: 'free' | 'uniform' | 'distort';
  onChangeTransformMode: (mode: 'free' | 'uniform' | 'distort') => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate45: () => void;
  onFitToCanvas: () => void;
  onReset: () => void;
  onApply: () => void;
}

export function ProcreateTransformBar({
  transformMode,
  onChangeTransformMode,
  onFlipHorizontal,
  onFlipVertical,
  onRotate45,
  onFitToCanvas,
  onReset,
  onApply,
}: ProcreateTransformBarProps) {
  return (
    <div
      id="procreate-transform-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#16181e]/95 backdrop-blur-md border border-[#2b3140] rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 select-none animate-in slide-in-from-bottom-3 duration-150 text-xs"
    >
      {/* Transform Mode buttons */}
      <div className="flex items-center gap-1 bg-[#121418] p-1 rounded-xl border border-[#252a36]">
        <button
          onClick={() => onChangeTransformMode('free')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            transformMode === 'free'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Forma Livre
        </button>

        <button
          onClick={() => onChangeTransformMode('uniform')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            transformMode === 'uniform'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Uniforme
        </button>

        <button
          onClick={() => onChangeTransformMode('distort')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            transformMode === 'distort'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Distorcer
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#2d3342]" />

      {/* Shortcuts */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFlipHorizontal}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Virar Horizontalmente"
        >
          <FlipHorizontal size={14} />
        </button>

        <button
          onClick={onFlipVertical}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Virar Verticalmente"
        >
          <FlipVertical size={14} />
        </button>

        <button
          onClick={onRotate45}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Girar 45°"
        >
          <RotateCw size={14} />
        </button>

        <button
          onClick={onFitToCanvas}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Ajustar à Tela"
        >
          <Maximize size={14} />
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Redefinir Transformação"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#2d3342]" />

      {/* Done */}
      <button
        onClick={onApply}
        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold flex items-center gap-1 transition shadow"
      >
        <Check size={14} strokeWidth={3} />
        <span>Concluir</span>
      </button>
    </div>
  );
}
