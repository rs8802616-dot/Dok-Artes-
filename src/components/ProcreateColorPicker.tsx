import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Disc, Square, CircleDot, Sliders, Palette as PaletteIcon, Plus, X } from 'lucide-react';
import { COLOR_PALETTES } from '../utils/constants';

interface ProcreateColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onChangeColor: (color: string) => void;
  previousColor: string;
  onDetachPalette?: () => void;
}

type TabType = 'disc' | 'classic' | 'harmony' | 'values' | 'palettes';

// Helper conversions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean,
    16
  );
  if (isNaN(bigint)) return { r: 0, g: 0, b: 0 };
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = (h % 360) / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0:
      r = v; g = t; b = p; break;
    case 1:
      r = q; g = v; b = p; break;
    case 2:
      r = p; g = v; b = t; break;
    case 3:
      r = p; g = q; b = v; break;
    case 4:
      r = t; g = p; b = v; break;
    case 5:
      r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function ProcreateColorPicker({
  isOpen,
  onClose,
  currentColor,
  onChangeColor,
  previousColor,
  onDetachPalette,
}: ProcreateColorPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('disc');
  const [customPalettes, setCustomPalettes] = useState(COLOR_PALETTES);
  const popoverRef = useRef<HTMLDivElement>(null);

  // HSV State
  const rgb = hexToRgb(currentColor);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const [hue, setHue] = useState(hsv.h);
  const [sat, setSat] = useState(hsv.s);
  const [val, setVal] = useState(hsv.v);

  // Sync internal HSV if external color changes
  useEffect(() => {
    const curRgb = hexToRgb(currentColor);
    const curHsv = rgbToHsv(curRgb.r, curRgb.g, curRgb.b);
    setHue(curHsv.h);
    setSat(curHsv.s);
    setVal(curHsv.v);
  }, [currentColor]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#tool-color-btn')
      ) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const updateFromHsv = (newH: number, newS: number, newV: number) => {
    setHue(newH);
    setSat(newS);
    setVal(newV);
    const newRgb = hsvToRgb(newH, newS, newV);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChangeColor(newHex);
  };

  const discCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingDiscHue = useRef(false);
  const isDraggingDiscSatVal = useRef(false);

  // Draw the Procreate Color Disc
  useEffect(() => {
    if (activeTab !== 'disc' || !isOpen) return;
    const canvas = discCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size / 2 - 4;
    const innerRadius = outerRadius - 20;

    ctx.clearRect(0, 0, size, size);

    // 1. Draw outer hue ring
    for (let angle = 0; angle < 360; angle += 1) {
      const startRad = ((angle - 0.5) * Math.PI) / 180;
      const endRad = ((angle + 1.5) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, (outerRadius + innerRadius) / 2, startRad, endRad);
      ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.lineWidth = outerRadius - innerRadius;
      ctx.stroke();
    }

    // 2. Outer ring handle for current hue
    const hueAngle = (hue * Math.PI) / 180;
    const handleDist = (outerRadius + innerRadius) / 2;
    const hx = cx + Math.cos(hueAngle) * handleDist;
    const hy = cy + Math.sin(hueAngle) * handleDist;

    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    // 3. Draw inner Saturation/Value circle
    const svRadius = innerRadius - 12;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, svRadius, 0, Math.PI * 2);
    ctx.clip();

    // Fill with current Hue
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(cx - svRadius, cy - svRadius, svRadius * 2, svRadius * 2);

    // Horizontal White Gradient (Saturation 0 on left to 1 on right)
    const whiteGrad = ctx.createLinearGradient(cx - svRadius, cy, cx + svRadius, cy);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(cx - svRadius, cy - svRadius, svRadius * 2, svRadius * 2);

    // Vertical Black Gradient (Value 1 on top to 0 on bottom)
    const blackGrad = ctx.createLinearGradient(cx, cy - svRadius, cx, cy + svRadius);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(cx - svRadius, cy - svRadius, svRadius * 2, svRadius * 2);

    ctx.restore();

    // 4. Inner Sat/Val ring cursor
    // Map sat (0-100) and val (0-100) inside circle
    const normX = (sat / 100) * 2 - 1;
    const normY = (1 - val / 100) * 2 - 1;
    const svX = cx + normX * (svRadius * 0.7);
    const svY = cy + normY * (svRadius * 0.7);

    ctx.beginPath();
    ctx.arc(svX, svY, 7, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = val > 50 ? '#000000' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }, [activeTab, isOpen, hue, sat, val, currentColor]);

  // Pointer interactions on Disc Canvas
  const handleDiscPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = discCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dist = Math.hypot(x - cx, y - cy);

    const outerRadius = canvas.width / 2 - 4;
    const innerRadius = outerRadius - 20;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (dist >= innerRadius - 8 && dist <= outerRadius + 12) {
      isDraggingDiscHue.current = true;
      updateDiscHue(x - cx, y - cy);
    } else {
      isDraggingDiscSatVal.current = true;
      updateDiscSatVal(x - cx, y - cy, innerRadius - 12);
    }
  };

  const handleDiscPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = discCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = e.clientX - rect.left - cx;
    const dy = e.clientY - rect.top - cy;

    if (isDraggingDiscHue.current) {
      updateDiscHue(dx, dy);
    } else if (isDraggingDiscSatVal.current) {
      updateDiscSatVal(dx, dy, canvas.width / 2 - 36);
    }
  };

  const handleDiscPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingDiscHue.current = false;
    isDraggingDiscSatVal.current = false;
  };

  const updateDiscHue = (dx: number, dy: number) => {
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    updateFromHsv(Math.round(angle), sat, val);
  };

  const updateDiscSatVal = (dx: number, dy: number, radius: number) => {
    const clampedDist = Math.min(radius * 0.75, Math.hypot(dx, dy));
    const clampedX = Math.max(-radius * 0.7, Math.min(radius * 0.7, dx));
    const clampedY = Math.max(-radius * 0.7, Math.min(radius * 0.7, dy));

    const newSat = Math.max(0, Math.min(100, Math.round(((clampedX / (radius * 0.7)) + 1) * 50)));
    const newVal = Math.max(0, Math.min(100, Math.round((1 - (clampedY / (radius * 0.7))) * 50)));
    updateFromHsv(hue, newSat, newVal);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      id="procreate-color-popover"
      className="fixed top-14 right-4 sm:right-6 w-[310px] sm:w-[340px] bg-[#16181d]/95 backdrop-blur-xl border border-[#2b2f3a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none text-slate-200"
    >
      {/* Top Split Swatch: Previous (Left) vs Active (Right) */}
      <div className="p-3 border-b border-[#252934] flex items-center justify-between bg-[#121418]/60">
        <div className="flex items-center gap-2">
          {/* Split Color Swatch */}
          <div className="flex items-center h-8 rounded-lg overflow-hidden border border-[#2a2f3c] shadow-inner">
            <button
              onClick={() => onChangeColor(previousColor)}
              className="w-12 h-full transition hover:opacity-90"
              style={{ backgroundColor: previousColor }}
              title={`Cor Anterior (${previousColor}) - Clique para reverter`}
            />
            <div
              className="w-16 h-full transition"
              style={{ backgroundColor: currentColor }}
              title={`Cor Atual (${currentColor})`}
            />
          </div>
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wide">
            {currentColor}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onDetachPalette && (
            <button
              onClick={() => {
                onDetachPalette();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-[#252934] transition text-xs flex items-center gap-1"
              title="Desacoplar Paleta Flutuante Mini"
            >
              <span className="text-[10px] font-semibold text-slate-400">Flutuante</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#252934] transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-4 flex flex-col items-center justify-center min-h-[260px]">
        {/* TAB 1: DISCO (THE SIGNATURE PROCREATE COLOR DISC) */}
        {activeTab === 'disc' && (
          <div className="flex flex-col items-center">
            <canvas
              ref={discCanvasRef}
              width={240}
              height={240}
              onPointerDown={handleDiscPointerDown}
              onPointerMove={handleDiscPointerMove}
              onPointerUp={handleDiscPointerUp}
              onPointerCancel={handleDiscPointerUp}
              className="cursor-crosshair touch-none"
            />
          </div>
        )}

        {/* TAB 2: CLÁSSICO */}
        {activeTab === 'classic' && (
          <div className="w-full space-y-3">
            {/* Saturation / Brightness Box */}
            <div
              className="w-full h-36 rounded-xl relative cursor-crosshair overflow-hidden border border-[#2b303d]"
              style={{
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
                backgroundImage: `
                  linear-gradient(to right, #fff, transparent),
                  linear-gradient(to top, #000, transparent)
                `,
              }}
              onPointerDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const update = (clientX: number, clientY: number) => {
                  const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
                  const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
                  const newS = Math.round((x / rect.width) * 100);
                  const newV = Math.round((1 - y / rect.height) * 100);
                  updateFromHsv(hue, newS, newV);
                };
                update(e.clientX, e.clientY);
                const moveHandler = (me: PointerEvent) => update(me.clientX, me.clientY);
                const upHandler = () => {
                  window.removeEventListener('pointermove', moveHandler);
                  window.removeEventListener('pointerup', upHandler);
                };
                window.addEventListener('pointermove', moveHandler);
                window.addEventListener('pointerup', upHandler);
              }}
            >
              {/* Cursor Dot */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${sat}%`,
                  top: `${100 - val}%`,
                  backgroundColor: currentColor,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Matiz (H)</span>
                <span>{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => updateFromHsv(parseInt(e.target.value), sat, val)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
            </div>

            {/* Saturation Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Saturação (S)</span>
                <span>{sat}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sat}
                onChange={(e) => updateFromHsv(hue, parseInt(e.target.value), val)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-sky-400 bg-[#252a35]"
              />
            </div>

            {/* Brightness Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Brilho (B)</span>
                <span>{val}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => updateFromHsv(hue, sat, parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-sky-400 bg-[#252a35]"
              />
            </div>
          </div>
        )}

        {/* TAB 3: HARMONIA */}
        {activeTab === 'harmony' && (
          <div className="w-full flex flex-col items-center space-y-3">
            <div className="text-xs text-slate-300 font-medium">
              Harmonia Complementar Procreate
            </div>
            {/* Complementary circle swatches */}
            <div className="flex items-center gap-4 py-2">
              <div
                className="w-14 h-14 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-mono text-[10px] text-white font-bold"
                style={{ backgroundColor: currentColor }}
              >
                Base
              </div>
              <span className="text-slate-500 font-bold">⇄</span>
              <button
                onClick={() => {
                  const compHue = (hue + 180) % 360;
                  updateFromHsv(compHue, sat, val);
                }}
                className="w-14 h-14 rounded-full border-2 border-sky-400 shadow-xl flex items-center justify-center font-mono text-[10px] text-white font-bold hover:scale-105 transition"
                style={{
                  backgroundColor: `hsl(${(hue + 180) % 360}, ${sat}%, ${val}%)`,
                }}
              >
                Opôsto
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center max-w-[220px]">
              Cores complementares oferecem contraste máximo e equilíbrio visual para ilustrações.
            </p>
          </div>
        )}

        {/* TAB 4: VALORES */}
        {activeTab === 'values' && (
          <div className="w-full space-y-2.5 text-xs">
            {/* RGB */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Canais RGB</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-red-400">R: {rgb.r}</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => {
                      const newHex = rgbToHex(parseInt(e.target.value), rgb.g, rgb.b);
                      onChangeColor(newHex);
                    }}
                    className="w-full accent-red-500 bg-[#252a35] h-1.5 rounded"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-green-400">G: {rgb.g}</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => {
                      const newHex = rgbToHex(rgb.r, parseInt(e.target.value), rgb.b);
                      onChangeColor(newHex);
                    }}
                    className="w-full accent-green-500 bg-[#252a35] h-1.5 rounded"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-blue-400">B: {rgb.b}</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => {
                      const newHex = rgbToHex(rgb.r, rgb.g, parseInt(e.target.value));
                      onChangeColor(newHex);
                    }}
                    className="w-full accent-blue-500 bg-[#252a35] h-1.5 rounded"
                  />
                </div>
              </div>
            </div>

            {/* HEX Input */}
            <div className="pt-2 border-t border-[#252934]">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Código Hexadecimal
              </label>
              <input
                type="text"
                value={currentColor.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    onChangeColor(val);
                  }
                }}
                className="w-full bg-[#1e222b] border border-[#2f3543] rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs uppercase focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* TAB 5: PALETAS */}
        {activeTab === 'palettes' && (
          <div className="w-full space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {customPalettes.map((pal, pIdx) => (
              <div key={pal.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">{pal.name}</span>
                  {pIdx === 0 && (
                    <button
                      onClick={() => {
                        const updated = [...customPalettes];
                        updated[0].colors.push(currentColor);
                        setCustomPalettes(updated);
                      }}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                    >
                      <Plus size={12} /> Salvar Cor
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-10 gap-1 bg-[#121418] p-1.5 rounded-xl border border-[#252934]">
                  {pal.colors.map((c, cIdx) => (
                    <button
                      key={`${c}-${cIdx}`}
                      onClick={() => onChangeColor(c)}
                      className={`w-6 h-6 rounded-md border transition hover:scale-110 ${
                        currentColor.toLowerCase() === c.toLowerCase()
                          ? 'border-white scale-105 shadow-md'
                          : 'border-[#2d323f]'
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
      </div>

      {/* Bottom Procreate Tab Navigation */}
      <div className="h-11 border-t border-[#252934] bg-[#121418] px-2 flex items-center justify-around shrink-0">
        <button
          onClick={() => setActiveTab('disc')}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
            activeTab === 'disc'
              ? 'bg-[#252a35] text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Disc size={13} />
          <span>Disco</span>
        </button>

        <button
          onClick={() => setActiveTab('classic')}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
            activeTab === 'classic'
              ? 'bg-[#252a35] text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Square size={13} />
          <span>Clássico</span>
        </button>

        <button
          onClick={() => setActiveTab('harmony')}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
            activeTab === 'harmony'
              ? 'bg-[#252a35] text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CircleDot size={13} />
          <span>Harmonia</span>
        </button>

        <button
          onClick={() => setActiveTab('values')}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
            activeTab === 'values'
              ? 'bg-[#252a35] text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={13} />
          <span>Valores</span>
        </button>

        <button
          onClick={() => setActiveTab('palettes')}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
            activeTab === 'palettes'
              ? 'bg-[#252a35] text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PaletteIcon size={13} />
          <span>Paletas</span>
        </button>
      </div>
    </div>
  );
}
