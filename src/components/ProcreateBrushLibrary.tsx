import React, { useState, useEffect, useRef } from 'react';
import { Plus, Sliders, X, Check, Sparkles } from 'lucide-react';
import { BrushPreset, BrushCategory, BrushPresetId } from '../types';
import { BRUSH_CATEGORIES, BRUSH_PRESETS } from '../utils/constants';

interface ProcreateBrushLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  activeBrushId: BrushPresetId;
  onSelectBrush: (id: BrushPresetId) => void;
  targetToolName: 'Pincel' | 'Dedo' | 'Borracha';
  smoothing: number;
  onChangeSmoothing: (val: number) => void;
  onOpenBrushStudio?: (brush: BrushPreset) => void;
}

export function ProcreateBrushLibrary({
  isOpen,
  onClose,
  activeBrushId,
  onSelectBrush,
  targetToolName,
  smoothing,
  onChangeSmoothing,
  onOpenBrushStudio,
}: ProcreateBrushLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<BrushCategory>('esboço');
  const [showStudioModal, setShowStudioModal] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-switch category when activeBrushId changes
  useEffect(() => {
    const current = BRUSH_PRESETS.find((b) => b.id === activeBrushId);
    if (current) {
      setSelectedCategory(current.category);
    }
  }, [activeBrushId]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#tool-brush-btn') &&
        !(e.target as HTMLElement).closest('#tool-smudge-btn') &&
        !(e.target as HTMLElement).closest('#tool-eraser-btn')
      ) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategoryBrushes = BRUSH_PRESETS.filter((b) => b.category === selectedCategory);
  const currentBrush = BRUSH_PRESETS.find((b) => b.id === activeBrushId);

  return (
    <div
      ref={popoverRef}
      id="procreate-brush-library"
      className="fixed top-14 right-4 sm:right-24 w-[340px] sm:w-[500px] h-[520px] bg-[#16181d]/95 backdrop-blur-xl border border-[#2b2f3a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none text-slate-200"
    >
      {/* Top Header */}
      <div className="h-12 border-b border-[#252934] px-4 flex items-center justify-between shrink-0 bg-[#121418]/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white tracking-wide">
            Biblioteca de Pincéis
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-medium">
            {targetToolName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenBrushStudio && (
            <button
              onClick={() => {
                const currentBrush = BRUSH_PRESETS.find((b) => b.id === activeBrushId) || BRUSH_PRESETS[0];
                onOpenBrushStudio(currentBrush);
                onClose();
              }}
              className="p-1.5 rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 transition text-xs flex items-center gap-1"
              title="Abrir Brush Studio Avançado (150+ propriedades, grão, dinâmica e bloco de desenho)"
            >
              <Sliders size={14} />
              <span className="text-[11px] font-semibold">Brush Studio Pro</span>
            </button>
          )}

          <button
            onClick={() => setShowStudioModal(!showStudioModal)}
            className={`p-1.5 rounded-lg border transition text-xs flex items-center gap-1 ${
              showStudioModal
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-[#1e222b] border-[#2f3543] text-slate-300 hover:text-white'
            }`}
            title="Ajustes de Streamline"
          >
            <span className="hidden sm:inline text-[11px]">Streamline</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252934] transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content: 2-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Categories */}
        <div className="w-36 sm:w-44 border-r border-[#252934] bg-[#121418]/70 overflow-y-auto py-2 flex flex-col gap-0.5">
          {BRUSH_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-2.5 transition rounded-r-lg ${
                  isSelected
                    ? 'bg-[#252a35] text-white border-l-2 border-sky-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1d24]'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right column: Brushes in Category */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#16181d]/50">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {BRUSH_CATEGORIES.find((c) => c.id === selectedCategory)?.name} ({currentCategoryBrushes.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {currentCategoryBrushes.map((brush) => {
              const isActive = activeBrushId === brush.id;
              return (
                <button
                  key={brush.id}
                  onClick={() => onSelectBrush(brush.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-[#202634] border-sky-500/60 shadow-lg shadow-sky-500/5'
                      : 'bg-[#1a1e27]/80 border-[#262b37] hover:border-[#384050] hover:bg-[#1e232e]'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {brush.name}
                      </span>
                      {isActive && <Check size={13} className="text-sky-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {brush.description}
                    </p>
                  </div>

                  {/* Simulated Procreate stroke ribbon preview */}
                  <div className="w-20 h-6 bg-[#111317] rounded-lg border border-[#272c38] flex items-center justify-center overflow-hidden shrink-0">
                    <svg className="w-18 h-4 overflow-visible" viewBox="0 0 70 16">
                      <path
                        d="M 5 8 C 20 2, 35 14, 50 7 S 65 9, 65 8"
                        fill="none"
                        stroke={isActive ? '#38bdf8' : '#94a3b8'}
                        strokeWidth={Math.max(1.5, Math.min(5, brush.defaultSize * 0.4))}
                        strokeLinecap="round"
                        opacity={brush.defaultOpacity}
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brush Studio Drawer (Streamline / Stabilization / Pressure) */}
      {showStudioModal && (
        <div className="border-t border-[#272c38] bg-[#121418] p-3.5 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-sky-400" />
              <span className="text-xs font-semibold text-white">Estúdio do Pincel</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {currentBrush?.name || 'Configurações'}
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Streamline / Estabilização</span>
                <span className="font-mono text-sky-400">{Math.round(smoothing * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={smoothing}
                onChange={(e) => onChangeSmoothing(parseFloat(e.target.value))}
                className="w-full accent-sky-500 bg-[#252a35] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
