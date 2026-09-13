import React from 'react';
import { Check, X, Copy, RefreshCw, Trash2, PaintBucket, Square, Circle } from 'lucide-react';
import { ShapeType } from '../types';

interface ProcreateSelectionBarProps {
  selectionMode: 'freehand' | 'rect' | 'circle';
  onChangeSelectionMode: (mode: 'freehand' | 'rect' | 'circle') => void;
  onInvertSelection: () => void;
  onCopyAndPaste: () => void;
  onFillSelection: () => void;
  onClearSelection: () => void;
  onClose: () => void;
}

export function ProcreateSelectionBar({
  selectionMode,
  onChangeSelectionMode,
  onInvertSelection,
  onCopyAndPaste,
  onFillSelection,
  onClearSelection,
  onClose,
}: ProcreateSelectionBarProps) {
  return (
    <div
      id="procreate-selection-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#16181e]/95 backdrop-blur-md border border-[#2b3140] rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 select-none animate-in slide-in-from-bottom-3 duration-150 text-xs"
    >
      {/* Selection Type */}
      <div className="flex items-center gap-1 bg-[#121418] p-1 rounded-xl border border-[#252a36]">
        <button
          onClick={() => onChangeSelectionMode('freehand')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectionMode === 'freehand'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Mão Livre
        </button>

        <button
          onClick={() => onChangeSelectionMode('rect')}
          className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
            selectionMode === 'rect'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Square size={13} />
          <span>Retângulo</span>
        </button>

        <button
          onClick={() => onChangeSelectionMode('circle')}
          className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
            selectionMode === 'circle'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Circle size={13} />
          <span>Elipse</span>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#2d3342]" />

      {/* Action shortcuts */}
      <div className="flex items-center gap-1">
        <button
          onClick={onInvertSelection}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Inverter Seleção"
        >
          <RefreshCw size={14} />
        </button>

        <button
          onClick={onCopyAndPaste}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Copiar e Colar em Nova Camada"
        >
          <Copy size={14} />
        </button>

        <button
          onClick={onFillSelection}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-[#252b38] text-slate-200 transition"
          title="Preencher com Cor Ativa"
        >
          <PaintBucket size={14} />
        </button>

        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg bg-[#1a1d25] hover:bg-red-500/20 text-red-400 transition"
          title="Limpar Área Selecionada"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#2d3342]" />

      {/* Done */}
      <button
        onClick={onClose}
        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold flex items-center gap-1 transition shadow"
      >
        <Check size={14} strokeWidth={3} />
        <span>Concluir</span>
      </button>
    </div>
  );
}
