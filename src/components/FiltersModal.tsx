import React, { useState } from 'react';
import { X, Sliders, Wand2, RotateCcw, Check } from 'lucide-react';

interface FiltersModalProps {
  onApply: (adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    invert: boolean;
    grayscale: boolean;
    sepia: boolean;
    pixelate: number;
  }) => void;
  onClose: () => void;
}

export function FiltersModal({ onApply, onClose }: FiltersModalProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [invert, setInvert] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [pixelate, setPixelate] = useState(1);

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setInvert(false);
    setGrayscale(false);
    setSepia(false);
    setPixelate(1);
  };

  const handleConfirm = () => {
    onApply({
      brightness,
      contrast,
      saturation,
      blur,
      invert,
      grayscale,
      sepia,
      pixelate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151922] border border-[#2b3446] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#242b3a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-violet-400" />
            <h2 className="font-semibold text-base text-slate-100">Filtros & Ajustes de Imagem</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Sliders */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>Brilho</span>
              <span className="font-mono text-violet-400">{brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>Contraste</span>
              <span className="font-mono text-violet-400">{contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>Saturação</span>
              <span className="font-mono text-violet-400">{saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
            />
          </div>

          {/* Blur */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>Desfoque Gaussiano</span>
              <span className="font-mono text-violet-400">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
            />
          </div>

          {/* Pixelate */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>Pixelização (Pixel Art)</span>
              <span className="font-mono text-violet-400">{pixelate}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={pixelate}
              onChange={(e) => setPixelate(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
            />
          </div>

          {/* Toggles: Invert, Grayscale, Sepia */}
          <div className="pt-2 border-t border-[#262f3e] grid grid-cols-3 gap-2">
            <button
              onClick={() => setInvert(!invert)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                invert
                  ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                  : 'bg-[#1c2230] border-[#2b3546] text-slate-400 hover:text-slate-200'
              }`}
            >
              Inverter Cores
            </button>
            <button
              onClick={() => setGrayscale(!grayscale)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                grayscale
                  ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                  : 'bg-[#1c2230] border-[#2b3546] text-slate-400 hover:text-slate-200'
              }`}
            >
              Preto & Branco
            </button>
            <button
              onClick={() => setSepia(!sepia)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                sepia
                  ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                  : 'bg-[#1c2230] border-[#2b3546] text-slate-400 hover:text-slate-200'
              }`}
            >
              Tom Sépia
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-3 border-t border-[#242b3a] bg-[#12151d] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition"
          >
            <RotateCcw size={14} />
            <span>Restaurar Padrão</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#202735] transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md transition flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Aplicar na Camada</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
