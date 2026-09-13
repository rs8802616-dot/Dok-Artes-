import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Plus,
  Copy,
  Trash2,
  Film,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import { AnimationFrameData } from '../types';

interface AnimationTimelineProps {
  frames: AnimationFrameData[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  fps: number;
  onChangeFps: (fps: number) => void;
  onionSkinEnabled: boolean;
  onToggleOnionSkin: () => void;
  onClose: () => void;
}

export function AnimationTimeline({
  frames,
  currentFrameIndex,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  isPlaying,
  onTogglePlay,
  fps,
  onChangeFps,
  onionSkinEnabled,
  onToggleOnionSkin,
  onClose,
}: AnimationTimelineProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-25 w-[94vw] max-w-4xl bg-[#141822]/95 backdrop-blur-xl border border-[#2a3446] rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Top bar controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-pink-400 font-semibold text-xs">
            <Film size={15} />
            <span>Linha do Tempo (Quadro a Quadro)</span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono bg-[#1c2230] px-2 py-0.5 rounded border border-[#2d3648]">
            Quadro {currentFrameIndex + 1} de {frames.length}
          </span>
        </div>

        {/* Playback & Frame navigation */}
        <div className="flex items-center gap-1.5">
          {/* Play / Pause button */}
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
          </button>

          {/* Onion Skin toggle */}
          <button
            onClick={onToggleOnionSkin}
            className={`px-2 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
              onionSkinEnabled
                ? 'bg-pink-600/30 border-pink-500 text-pink-300'
                : 'bg-[#1c2230] border-[#2d3648] text-slate-400 hover:text-slate-200'
            }`}
            title="Onion Skinning (Exibir rastro dos quadros anterior e seguinte)"
          >
            <Eye size={13} />
            <span>Casca de Cebola</span>
          </button>

          {/* FPS Slider popover toggle */}
          <div className="flex items-center gap-1 text-xs text-slate-300 bg-[#1c2230] px-2 py-1 rounded-xl border border-[#2d3648]">
            <span className="text-slate-400 font-medium">FPS:</span>
            <span className="font-mono text-pink-400 font-bold">{fps}</span>
            <input
              type="range"
              min="1"
              max="24"
              value={fps}
              onChange={(e) => onChangeFps(Number(e.target.value))}
              className="w-16 accent-pink-500 h-1 bg-[#283244] rounded-lg cursor-pointer ml-1"
            />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#222b3b] transition ml-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Frames strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
        {frames.map((frame, idx) => {
          const isSelected = idx === currentFrameIndex;
          // Look for preview thumbnail in frame snapshots
          const firstSnap = Object.values(frame.layerSnapshots)[0] || '';

          return (
            <div
              key={frame.id}
              onClick={() => onSelectFrame(idx)}
              className={`relative shrink-0 w-20 h-16 rounded-xl border-2 transition cursor-pointer overflow-hidden flex flex-col justify-between p-1 select-none ${
                isSelected
                  ? 'border-pink-500 bg-[#251f2e] ring-2 ring-pink-500/40'
                  : 'border-[#2d3648] bg-[#181d27] hover:border-slate-500'
              }`}
            >
              {/* Thumbnail background */}
              <div className="absolute inset-0 checkerboard-pattern opacity-40 -z-10" />
              {firstSnap && (
                <img
                  src={firstSnap}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}

              {/* Frame number badge */}
              <div className="flex justify-between items-center z-10">
                <span className="text-[9px] font-bold bg-black/70 text-white px-1 py-0.2 rounded">
                  #{idx + 1}
                </span>

                {/* Quick action buttons on frame */}
                {isSelected && (
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDuplicateFrame(idx)}
                      className="p-0.5 bg-black/70 hover:bg-black text-slate-300 hover:text-white rounded"
                      title="Duplicar Quadro"
                    >
                      <Copy size={10} />
                    </button>
                    {frames.length > 1 && (
                      <button
                        onClick={() => onDeleteFrame(idx)}
                        className="p-0.5 bg-red-950/80 hover:bg-red-900 text-red-300 rounded"
                        title="Excluir Quadro"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Frame button */}
        <button
          onClick={onAddFrame}
          className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-[#343e52] hover:border-pink-500 text-slate-400 hover:text-pink-300 hover:bg-[#202738] transition flex flex-col items-center justify-center gap-1 text-[10px] font-semibold"
        >
          <Plus size={18} />
          <span>Novo</span>
        </button>
      </div>
    </div>
  );
}
