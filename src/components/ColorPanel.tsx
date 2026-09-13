import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Palette, Pipette, Check } from 'lucide-react';
import { COLOR_PALETTES } from '../utils/constants';

interface ColorPanelProps {
  currentColor: string;
  onChangeColor: (color: string) => void;
  recentColors: string[];
  onClose: () => void;
}

// Convert HEX to RGB
function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number) {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number) {
  h = h / 360;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

export function ColorPanel({
  currentColor,
  onChangeColor,
  recentColors,
  onClose,
}: ColorPanelProps) {
  const [hexInput, setHexInput] = useState(currentColor);
  const [activeTab, setActiveTab] = useState<'picker' | 'palettes'>('picker');
  const [customFavorites, setCustomFavorites] = useState<string[]>([]);

  // HSV state
  const rgb = hexToRgb(currentColor);
  const initialHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);

  const satValRef = useRef<HTMLCanvasElement>(null);
  const isDraggingSatVal = useRef(false);

  useEffect(() => {
    setHexInput(currentColor);
    const cRgb = hexToRgb(currentColor);
    const cHsv = rgbToHsv(cRgb.r, cRgb.g, cRgb.b);
    setHue(cHsv.h);
    setSat(cHsv.s);
    setVal(cHsv.v);
  }, [currentColor]);

  // Draw Saturation / Value Gradient Box
  const drawSatValBox = useCallback(() => {
    const canvas = satValRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Base color from hue
    const baseRgb = hsvToRgb(hue, 1, 1);
    ctx.fillStyle = `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`;
    ctx.fillRect(0, 0, w, h);

    // Horizontal white gradient (saturation)
    const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, '#ffffff');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, w, h);

    // Vertical black gradient (value)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, '#000000');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, w, h);
  }, [hue]);

  useEffect(() => {
    drawSatValBox();
  }, [drawSatValBox]);

  const updateFromCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = satValRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const newSat = x / rect.width;
    const newVal = 1 - y / rect.height;
    setSat(newSat);
    setVal(newVal);

    const newRgb = hsvToRgb(hue, newSat, newVal);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChangeColor(newHex);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingSatVal.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromCoords(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingSatVal.current) {
      updateFromCoords(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingSatVal.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    const newRgb = hsvToRgb(newHue, sat, val);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChangeColor(newHex);
  };

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      onChangeColor(hexInput);
    }
  };

  const handleAddFavorite = () => {
    if (!customFavorites.includes(currentColor)) {
      setCustomFavorites([currentColor, ...customFavorites.slice(0, 15)]);
    }
  };

  return (
    <div className="fixed left-18 sm:left-20 top-18 z-30 w-80 bg-[#151922]/95 backdrop-blur-xl border border-[#2a3242] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#242b3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-violet-400" />
          <h2 className="font-semibold text-sm text-slate-100">Cores & Paletas</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#252c3c] transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#242b3a] px-3 pt-2 gap-2 bg-[#12161f]">
        <button
          onClick={() => setActiveTab('picker')}
          className={`pb-2 text-xs font-semibold px-2 transition border-b-2 ${
            activeTab === 'picker'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Seletor HSV
        </button>
        <button
          onClick={() => setActiveTab('palettes')}
          className={`pb-2 text-xs font-semibold px-2 transition border-b-2 ${
            activeTab === 'palettes'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Paletas de Estudo
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {activeTab === 'picker' ? (
          <>
            {/* Saturation / Value Canvas */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#2d3545] cursor-crosshair">
              <canvas
                ref={satValRef}
                width={280}
                height={176}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-full block"
              />
              {/* Pointer indicator */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${sat * 100}%`,
                  top: `${(1 - val) * 100}%`,
                  backgroundColor: currentColor,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => handleHueChange(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
            </div>

            {/* Preview Swatch & Hex Code */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl border border-white/20 shadow-inner shrink-0"
                style={{ backgroundColor: currentColor }}
              />
              <form onSubmit={handleHexSubmit} className="flex-1 flex gap-1.5">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onBlur={() => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) onChangeColor(hexInput);
                  }}
                  className="w-full bg-[#1b202c] border border-[#2e3748] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 uppercase focus:outline-none focus:border-violet-500"
                  placeholder="#000000"
                />
                <button
                  type="button"
                  onClick={handleAddFavorite}
                  className="p-1.5 bg-[#1b202c] border border-[#2e3748] hover:border-violet-500 text-slate-300 rounded-lg transition"
                  title="Salvar cor favorita"
                >
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Palettes view */
          <div className="space-y-4">
            {COLOR_PALETTES.map((pal) => (
              <div key={pal.name}>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">{pal.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {pal.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => onChangeColor(c)}
                      className={`w-7 h-7 rounded-lg border transition ${
                        currentColor.toLowerCase() === c.toLowerCase()
                          ? 'ring-2 ring-violet-400 scale-110'
                          : 'border-black/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div className="pt-2 border-t border-[#242b3a]">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Cores Recentes</div>
            <div className="flex flex-wrap gap-1.5">
              {recentColors.slice(0, 14).map((c, i) => (
                <button
                  key={`${c}_${i}`}
                  onClick={() => onChangeColor(c)}
                  className={`w-6 h-6 rounded-md border border-black/20 transition ${
                    currentColor.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-violet-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom saved favorites */}
        {customFavorites.length > 0 && (
          <div className="pt-2 border-t border-[#242b3a]">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Salvas pelo Usuário</div>
            <div className="flex flex-wrap gap-1.5">
              {customFavorites.map((c, i) => (
                <button
                  key={`fav_${c}_${i}`}
                  onClick={() => onChangeColor(c)}
                  className="w-6 h-6 rounded-md border border-black/20 hover:scale-105 transition"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
