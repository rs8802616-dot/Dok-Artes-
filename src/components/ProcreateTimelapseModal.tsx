import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Download, Film, FastForward } from 'lucide-react';

interface ProcreateTimelapseModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: string[];
}

export function ProcreateTimelapseModal({
  isOpen,
  onClose,
  snapshots,
}: ProcreateTimelapseModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || snapshots.length === 0) return;
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [isOpen, snapshots.length]);

  // Render current frame onto canvas
  useEffect(() => {
    if (!isOpen || snapshots.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = snapshots[currentIndex];
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [currentIndex, isOpen, snapshots]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || snapshots.length <= 1) return;

    const intervalTime = Math.max(50, 400 / speed);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= snapshots.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, snapshots.length, speed]);

  if (!isOpen) return null;

  const handleExportFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `timelapse_frame_${currentIndex + 1}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[82vh] bg-[#12151c] border border-[#272d3c] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-13 border-b border-[#252b39] px-5 flex items-center justify-between bg-[#0e1015] shrink-0">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-sky-400" />
            <span className="text-sm font-bold text-white tracking-wide">
              Repetição Time-Lapse Procreate
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold">
              {snapshots.length} Quadros Gravados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFrame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202636] hover:bg-sky-600 hover:text-white text-xs font-semibold transition"
            >
              <Download size={14} />
              <span>Exportar Quadro</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202532] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Canvas Display */}
        <div className="flex-1 bg-[#0b0c10] flex items-center justify-center p-4 overflow-hidden relative">
          {snapshots.length === 0 ? (
            <div className="text-center text-slate-400 text-xs">
              Nenhum quadro gravado ainda. Desenhe na tela para gerar o histórico time-lapse!
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-[#222836]"
            />
          )}
        </div>

        {/* Player Controls */}
        <div className="h-16 border-t border-[#252b39] px-6 flex items-center justify-between bg-[#0e1015] shrink-0 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentIndex >= snapshots.length - 1) {
                  setCurrentIndex(0);
                }
                setIsPlaying(!isPlaying);
              }}
              className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition shadow"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
            </button>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e232f] transition"
              title="Reiniciar"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Scrubber Slider */}
          <div className="flex-1 flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400">
              {currentIndex + 1} / {Math.max(1, snapshots.length)}
            </span>
            <input
              type="range"
              min="0"
              max={Math.max(0, snapshots.length - 1)}
              value={currentIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentIndex(parseInt(e.target.value));
              }}
              className="w-full accent-sky-500 bg-[#252b39] h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#181c25] p-1 rounded-xl border border-[#272d3c]">
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                  speed === s ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
