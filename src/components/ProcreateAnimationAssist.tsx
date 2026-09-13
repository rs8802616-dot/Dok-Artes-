import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Settings, X, Repeat, SkipBack, SkipForward } from 'lucide-react';
import { Layer } from '../types';

interface ProcreateAnimationAssistProps {
  isOpen: boolean;
  onClose: () => void;
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddFrame: () => void;
}

export function ProcreateAnimationAssist({
  isOpen,
  onClose,
  layers,
  activeLayerId,
  onSelectLayer,
  onAddFrame,
}: ProcreateAnimationAssistProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [showSettings, setShowSettings] = useState(false);
  const [loopMode, setLoopMode] = useState<'loop' | 'pingpong' | 'shot'>('loop');

  const timerRef = useRef<number | null>(null);

  // Play animation through visible layers
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = Math.round(1000 / fps);
    timerRef.current = window.setInterval(() => {
      if (layers.length === 0) return;
      const curIdx = layers.findIndex((l) => l.id === activeLayerId);
      const nextIdx = (curIdx + 1) % layers.length;
      onSelectLayer(layers[nextIdx].id);
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, fps, layers, activeLayerId, onSelectLayer]);

  if (!isOpen) return null;

  return (
    <div
      id="procreate-animation-assist"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-[#14161e]/95 backdrop-blur-md border border-[#272d3b] rounded-2xl shadow-2xl p-2.5 z-40 select-none text-slate-200 animate-in slide-in-from-bottom-4 duration-150"
    >
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-[#232836]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow transition ${
              isPlaying
                ? 'bg-amber-500 text-white'
                : 'bg-sky-500 hover:bg-sky-400 text-white'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
            <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-[#1e2330] hover:bg-[#282f40] text-slate-300 transition text-xs flex items-center gap-1"
            title="Configurações de Reprodução (FPS, Onion Skin)"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Configurações</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddFrame}
            className="px-3 py-1.5 rounded-xl bg-[#1e2330] hover:bg-sky-500 hover:text-white border border-[#2d3446] text-xs font-medium flex items-center gap-1 transition"
          >
            <Plus size={14} />
            <span>Adicionar Quadro</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232836] transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="p-3 my-2 bg-[#0e1015] rounded-xl border border-[#222734] space-y-2 animate-in fade-in duration-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Quadros por Segundo (FPS): {fps}</span>
            <input
              type="range"
              min="1"
              max="24"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-32 accent-sky-400"
            />
          </div>
        </div>
      )}

      {/* Filmstrip Frame Thumbnails */}
      <div className="flex items-center gap-2 pt-2 overflow-x-auto py-1 px-1">
        {layers.map((layer, idx) => {
          const isActive = layer.id === activeLayerId;
          return (
            <button
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`w-16 h-12 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center shrink-0 transition ${
                isActive
                  ? 'border-sky-400 ring-2 ring-sky-500/30 bg-[#1e2433]'
                  : 'border-[#2a3040] bg-[#101217] hover:border-slate-400'
              }`}
            >
              {layer.canvas ? (
                <img
                  src={layer.canvas.toDataURL()}
                  alt={`Quadro ${idx + 1}`}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <span className="text-[10px] text-slate-500">{idx + 1}</span>
              )}
              <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-slate-400">
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
