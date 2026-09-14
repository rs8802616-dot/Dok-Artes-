import React, { useState } from 'react';
import { X, Check, Sliders, Waves, Activity, Sparkles, Droplet, Eye, Palette } from 'lucide-react';
import {
  applyCurves,
  applyColorBalance,
  applyGradientMap,
  applyNoise,
  applySharpen,
  applyImageAdjustments,
  applyMotionBlur,
  applyBloom,
  applyGlitch,
  applyHalftone
} from '../utils/filterEngine';

interface ProcreateAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAdjustment: string | null;
  activeLayerCanvas: HTMLCanvasElement | null;
  onApplyChanges: () => void;
}

export function ProcreateAdjustmentModal({
  isOpen,
  onClose,
  activeAdjustment,
  activeLayerCanvas,
  onApplyChanges,
}: ProcreateAdjustmentModalProps) {
  // Slider state for linear adjustments (Gaussian blur, noise, sharpen, motion blur)
  const [percentage, setPercentage] = useState(30);

  // Color balance state
  const [cyanRed, setCyanRed] = useState(0);
  const [magentaGreen, setMagentaGreen] = useState(0);
  const [yellowBlue, setYellowBlue] = useState(0);

  // Gradient map preset
  const [selectedGradient, setSelectedGradient] = useState<'sunset' | 'neon' | 'vintage' | 'noir' | 'cyber'>('sunset');

  // Curves state: control points
  const [curveMidpoint, setCurveMidpoint] = useState(128);

  if (!isOpen || !activeAdjustment || !activeLayerCanvas) return null;

  const ctx = activeLayerCanvas.getContext('2d');
  if (!ctx) return null;

  const handleApply = () => {
    if (activeAdjustment === 'gaussian') {
      applyImageAdjustments(ctx, { blur: (percentage / 100) * 20 });
    } else if (activeAdjustment === 'noise') {
      applyNoise(ctx, percentage);
    } else if (activeAdjustment === 'sharpen') {
      applySharpen(ctx, percentage);
    } else if (activeAdjustment === 'color_balance') {
      applyColorBalance(ctx, cyanRed, magentaGreen, yellowBlue);
    } else if (activeAdjustment === 'curves') {
      // Build curve map from midpoint
      const rMap = new Array(256).fill(0).map((_, i) => {
        const t = i / 255;
        const bent = t < 0.5 
          ? 2 * t * (curveMidpoint / 255) 
          : 1 - 2 * (1 - t) * (1 - curveMidpoint / 255);
        return Math.max(0, Math.min(255, Math.round(bent * 255)));
      });
      applyCurves(ctx, { r: rMap, g: rMap, b: rMap });
    } else if (activeAdjustment === 'gradient_map') {
      const presets = {
        sunset: [
          { pos: 0, r: 24, g: 12, b: 48 },
          { pos: 0.5, r: 244, g: 63, b: 94 },
          { pos: 1, r: 254, g: 240, b: 138 },
        ],
        neon: [
          { pos: 0, r: 15, g: 23, b: 42 },
          { pos: 0.5, r: 6, g: 182, b: 212 },
          { pos: 1, r: 236, g: 72, b: 153 },
        ],
        vintage: [
          { pos: 0, r: 41, g: 29, b: 20 },
          { pos: 0.5, r: 180, g: 140, b: 100 },
          { pos: 1, r: 245, g: 235, b: 215 },
        ],
        noir: [
          { pos: 0, r: 0, g: 0, b: 0 },
          { pos: 0.5, r: 120, g: 120, b: 120 },
          { pos: 1, r: 255, g: 255, b: 255 },
        ],
        cyber: [
          { pos: 0, r: 10, g: 10, b: 30 },
          { pos: 0.5, r: 139, g: 92, b: 246 },
          { pos: 1, r: 52, g: 211, b: 153 },
        ],
      };
      applyGradientMap(ctx, presets[selectedGradient] || presets.sunset);
    } else if (activeAdjustment === 'invert') {
      applyImageAdjustments(ctx, { invert: true });
    } else if (activeAdjustment === 'motion_blur') {
      applyMotionBlur(ctx, percentage);
    } else if (activeAdjustment === 'bloom') {
      applyBloom(ctx, percentage);
    } else if (activeAdjustment === 'glitch') {
      applyGlitch(ctx, percentage);
    } else if (activeAdjustment === 'halftone') {
      applyHalftone(ctx, percentage);
    }

    onApplyChanges();
    onClose();
  };

  const titles: Record<string, string> = {
    gaussian: 'Desfoque Gaussiano',
    motion_blur: 'Desfoque de Movimento',
    noise: 'Ruído (Noise)',
    sharpen: 'Nitidez (Sharpen)',
    bloom: 'Florescer (Bloom)',
    glitch: 'Glitch Cromático',
    halftone: 'Meio-Tom Reticulado',
    curves: 'Curvas Tonal RGB',
    color_balance: 'Balanço de Cores',
    gradient_map: 'Mapeamento de Gradiente',
    invert: 'Inverter Cores',
    liquify: 'Dissolver (Liquify)',
  };

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[500px] bg-[#141720]/95 backdrop-blur-xl border border-[#272d3c] rounded-2xl shadow-2xl p-4 select-none text-slate-200 animate-in slide-in-from-top-3 duration-150">
      {/* Top Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#252b39] mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {titles[activeAdjustment] || 'Ajuste'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-[#1e2330] transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold shadow transition"
          >
            <Check size={13} strokeWidth={3} />
            <span>Aplicar</span>
          </button>
        </div>
      </div>

      {/* Adjustments Bodies */}
      {/* 1. Linear percentage sliders: Gaussian, Noise, Sharpen, Motion Blur */}
      {['gaussian', 'motion_blur', 'noise', 'sharpen', 'bloom', 'glitch', 'halftone'].includes(activeAdjustment) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Intensidade do Efeito</span>
            <span className="font-mono text-sky-400 font-bold">{percentage}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full accent-sky-500 bg-[#252b39] h-2 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 block text-center mt-1">
            Deslize o controle para dosar a aplicação sobre a camada ativa
          </span>
        </div>
      )}

      {/* 2. Balanço de Cores */}
      {activeAdjustment === 'color_balance' && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-400">Ciano</span>
              <span className="text-red-400">Vermelho ({cyanRed})</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={cyanRed}
              onChange={(e) => setCyanRed(parseInt(e.target.value))}
              className="w-full accent-red-500 bg-[#252b39] h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pink-400">Magenta</span>
              <span className="text-emerald-400">Verde ({magentaGreen})</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={magentaGreen}
              onChange={(e) => setMagentaGreen(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-[#252b39] h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-yellow-400">Amarelo</span>
              <span className="text-blue-400">Azul ({yellowBlue})</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={yellowBlue}
              onChange={(e) => setYellowBlue(parseInt(e.target.value))}
              className="w-full accent-blue-500 bg-[#252b39] h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3. Curvas */}
      {activeAdjustment === 'curves' && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Ponto Médio de Contraste Tonal</span>
            <span className="font-mono text-sky-400 font-bold">{curveMidpoint} / 255</span>
          </div>
          <input
            type="range"
            min="30"
            max="220"
            value={curveMidpoint}
            onChange={(e) => setCurveMidpoint(parseInt(e.target.value))}
            className="w-full accent-sky-500 bg-[#252b39] h-2 rounded-lg appearance-none cursor-pointer"
          />
          {/* Curve Visualization */}
          <div className="h-20 bg-[#0e1015] rounded-xl border border-[#252b39] p-2 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 60">
              <path
                d={`M 0 60 Q 100 ${60 - (curveMidpoint / 255) * 60}, 200 0`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 4. Gradient Map */}
      {activeAdjustment === 'gradient_map' && (
        <div className="space-y-2">
          <span className="text-xs text-slate-300 block mb-1">Presets de Mapeamento de Gradiente:</span>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'sunset', name: 'Pôr do Sol', gradient: 'from-purple-900 via-rose-500 to-yellow-200' },
              { id: 'neon', name: 'Neon Cyber', gradient: 'from-slate-900 via-cyan-500 to-pink-500' },
              { id: 'vintage', name: 'Vintage', gradient: 'from-amber-950 via-amber-700 to-amber-100' },
              { id: 'noir', name: 'Noir P&B', gradient: 'from-black via-gray-500 to-white' },
              { id: 'cyber', name: 'Esmeralda', gradient: 'from-indigo-950 via-purple-600 to-emerald-400' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedGradient(p.id as any)}
                className={`p-1 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  selectedGradient === p.id
                    ? 'border-sky-400 bg-[#202636]'
                    : 'border-[#262c3a] bg-[#161a24] hover:border-slate-400'
                }`}
              >
                <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${p.gradient}`} />
                <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
