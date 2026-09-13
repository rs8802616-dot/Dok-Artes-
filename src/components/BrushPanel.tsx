import React from 'react';
import { X, Sparkles, Sliders, Check } from 'lucide-react';
import { BrushPreset, BrushPresetId } from '../types';
import { BRUSH_PRESETS } from '../utils/constants';

interface BrushPanelProps {
  activeBrushId: BrushPresetId;
  onSelectBrush: (preset: BrushPreset) => void;
  onClose: () => void;
  smoothing: number;
  onChangeSmoothing: (v: number) => void;
  pressureEnabled: boolean;
  onTogglePressure: () => void;
}

export function BrushPanel({
  activeBrushId,
  onSelectBrush,
  onClose,
  smoothing,
  onChangeSmoothing,
  pressureEnabled,
  onTogglePressure,
}: BrushPanelProps) {
  const categories = [
    { id: 'canetas', label: 'Canetas & FreeNote' },
    { id: 'esboço', label: 'Esboço & Desenho' },
    { id: 'pintura', label: 'Pintura Artística' },
    { id: 'efeitos', label: 'Efeitos & Spray' },
  ];

  return (
    <div className="fixed left-18 sm:left-20 top-18 z-30 w-80 bg-[#151922]/95 backdrop-blur-xl border border-[#2a3242] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#242b3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          <h2 className="font-semibold text-sm text-slate-100">Biblioteca de Pincéis</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#252c3c] transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Brush List categorized */}
      <div className="p-3 overflow-y-auto space-y-4 flex-1">
        {categories.map((cat) => {
          const presets = BRUSH_PRESETS.filter((p) => p.category === cat.id);
          if (presets.length === 0) return null;

          return (
            <div key={cat.id}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                {cat.label}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {presets.map((brush) => {
                  const isSelected = activeBrushId === brush.id;
                  return (
                    <button
                      key={brush.id}
                      onClick={() => onSelectBrush(brush)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm'
                          : 'bg-[#1b202c]/70 border-[#283142] text-slate-300 hover:bg-[#222938]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-slate-100">{brush.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-violet-500/30 text-violet-300 px-1.5 py-0.2 rounded font-semibold">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {brush.description}
                        </p>
                      </div>
                      {isSelected && <Check size={16} className="text-violet-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stroke Dynamics & Smoothing */}
      <div className="p-3 border-t border-[#242b3a] bg-[#12151d]/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium">Sensibilidade à Pressão</span>
          <button
            onClick={onTogglePressure}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${
              pressureEnabled ? 'bg-violet-600 justify-end' : 'bg-[#293242] justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
            <span>Estabilização de Traço (Streamline)</span>
            <span className="font-mono text-violet-400">{Math.round(smoothing * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            value={Math.round(smoothing * 100)}
            onChange={(e) => onChangeSmoothing(Number(e.target.value) / 100)}
            className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-0.5">
            Suaviza linhas trêmulas para caligrafia e escrita livre perfeita
          </div>
        </div>
      </div>
    </div>
  );
}
