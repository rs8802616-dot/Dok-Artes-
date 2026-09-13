import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Activity,
  Droplet,
  Compass,
  Palette,
  Info,
  Trash2
} from 'lucide-react';
import { BrushPreset, BrushStudioSettings, BrushPresetId } from '../types';
import { BRUSH_PRESETS } from '../utils/constants';
import { drawBrushSegment } from '../utils/drawingEngine';

interface ProcreateBrushStudioProps {
  isOpen: boolean;
  onClose: () => void;
  brush: BrushPreset;
  onSaveBrushSettings: (brushId: BrushPresetId, settings: BrushStudioSettings) => void;
  currentColor: string;
}

type StudioSection = 
  | 'stroke' 
  | 'shape' 
  | 'grain' 
  | 'dynamics' 
  | 'dual' 
  | 'properties' 
  | 'about';

const DEFAULT_SETTINGS: BrushStudioSettings = {
  spacing: 0.12,
  streamline: 0.45,
  jitter: 0,
  falloff: 0,
  scatter: 0,
  rotation: 0,
  grainScale: 1,
  grainDepth: 0.5,
  grainTexture: 'paper',
  speedSize: 0,
  speedOpacity: 0,
  pressureSize: 1,
  pressureOpacity: 0.8,
  dualBrushEnabled: false,
  secondBrushId: 'charcoal',
  dualBlendMode: 'multiply',
  sizeMin: 1,
  sizeMax: 100,
  opacityMin: 0.05,
  opacityMax: 1,
};

export function ProcreateBrushStudio({
  isOpen,
  onClose,
  brush,
  onSaveBrushSettings,
  currentColor,
}: ProcreateBrushStudioProps) {
  const [activeSection, setActiveSection] = useState<StudioSection>('stroke');
  const [settings, setSettings] = useState<BrushStudioSettings>(
    brush.studioSettings || { ...DEFAULT_SETTINGS, streamline: brush.smoothing }
  );

  // Scratchpad state
  const padCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPadDrawing = useRef(false);
  const padLastPoint = useRef<{ x: number; y: number; pressure: number } | null>(null);
  const [padColor, setPadColor] = useState(currentColor);

  // Sync settings when brush changes
  useEffect(() => {
    if (brush) {
      setSettings(brush.studioSettings || { ...DEFAULT_SETTINGS, streamline: brush.smoothing });
    }
  }, [brush]);

  // Clear scratchpad
  const clearPad = () => {
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#101318';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw subtle Procreate grid guide
    ctx.strokeStyle = '#1b202a';
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(clearPad, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Scratchpad drawing handlers
  const handlePadPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPadDrawing.current = true;
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    padLastPoint.current = { x, y, pressure: e.pressure || 0.7 };
  };

  const handlePadPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPadDrawing.current || !padLastPoint.current) return;
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const currentPt = { x, y, pressure: e.pressure || 0.7 };

    // Draw stroke with current brush settings
    drawBrushSegment(
      ctx,
      padLastPoint.current,
      currentPt,
      brush.id,
      padColor,
      brush.defaultSize * (settings.pressureSize > 0 ? (currentPt.pressure * settings.pressureSize) : 1),
      brush.defaultOpacity
    );

    // If dual brush is enabled, overlay second brush
    if (settings.dualBrushEnabled && settings.secondBrushId) {
      ctx.save();
      ctx.globalCompositeOperation = settings.dualBlendMode;
      drawBrushSegment(
        ctx,
        padLastPoint.current,
        currentPt,
        settings.secondBrushId,
        padColor,
        brush.defaultSize * 0.8,
        0.5
      );
      ctx.restore();
    }

    padLastPoint.current = currentPt;
  };

  const handlePadPointerUp = () => {
    isPadDrawing.current = false;
    padLastPoint.current = null;
  };

  const updateSetting = <K extends keyof BrushStudioSettings>(key: K, val: BrushStudioSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[90vh] bg-[#14171f] border border-[#282e3c] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 font-sans">
        {/* Top Header */}
        <div className="h-14 border-b border-[#252a36] px-5 flex items-center justify-between bg-[#111319] shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-[#1e232e]"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-sky-400" />
            <span className="text-sm font-bold text-white tracking-wide">
              Estúdio do Pincel — {brush.name}
            </span>
          </div>

          <button
            onClick={() => {
              onSaveBrushSettings(brush.id, settings);
              onClose();
            }}
            className="text-xs font-semibold text-sky-400 hover:text-white bg-sky-500/20 hover:bg-sky-500 transition px-3.5 py-1.5 rounded-lg"
          >
            Concluído
          </button>
        </div>

        {/* Studio Body: 3-column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Left Sections Nav */}
          <div className="w-48 sm:w-56 border-r border-[#242935] bg-[#111319]/80 overflow-y-auto p-2 space-y-1 shrink-0">
            {[
              { id: 'stroke', label: 'Caminho do Traço', icon: Activity },
              { id: 'shape', label: 'Forma (Shape)', icon: Compass },
              { id: 'grain', label: 'Grão & Textura', icon: Droplet },
              { id: 'dynamics', label: 'Dinâmica & Velocidade', icon: Sliders },
              { id: 'dual', label: 'Pincel Duplo (Dual Brush)', icon: Layers },
              { id: 'properties', label: 'Propriedades do Pincel', icon: Sparkles },
              { id: 'about', label: 'Sobre este Pincel', icon: Info },
            ].map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as StudioSection)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    isActive
                      ? 'bg-[#222836] text-white font-semibold shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#181c25]'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Middle Settings Controls */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#14171f]">
            {/* STROKE PATH */}
            {activeSection === 'stroke' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Propriedades do Traço (Stroke)
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Espaçamento (Spacing)</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.spacing * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="1.5"
                    step="0.02"
                    value={settings.spacing}
                    onChange={(e) => updateSetting('spacing', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Estabilização / Streamline</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.streamline * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.95"
                    step="0.05"
                    value={settings.streamline}
                    onChange={(e) => updateSetting('streamline', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Tremulação (Jitter)</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.jitter * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.jitter}
                    onChange={(e) => updateSetting('jitter', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Atenuação / Queda (Fall-off)</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.falloff * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.falloff}
                    onChange={(e) => updateSetting('falloff', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SHAPE */}
            {activeSection === 'shape' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Comportamento da Forma (Shape)
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Dispersão (Scatter)</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.scatter * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.scatter}
                    onChange={(e) => updateSetting('scatter', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Rotação do Carimbo</span>
                    <span className="font-mono text-sky-400">{settings.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={settings.rotation}
                    onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* GRAIN */}
            {activeSection === 'grain' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Grão & Textura (Grain)
                </h3>

                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 block">Textura da Granulação</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['paper', 'canvas', 'rough', 'noise', 'chalk'] as const).map((tex) => (
                      <button
                        key={tex}
                        onClick={() => updateSetting('grainTexture', tex)}
                        className={`p-2 rounded-xl border text-xs capitalize transition ${
                          settings.grainTexture === tex
                            ? 'bg-sky-500 text-white font-bold border-sky-400'
                            : 'bg-[#1b202a] text-slate-300 border-[#272c39] hover:border-slate-400'
                        }`}
                      >
                        {tex}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Escala do Grão</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.grainScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.05"
                    value={settings.grainScale}
                    onChange={(e) => updateSetting('grainScale', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Profundidade da Textura</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.grainDepth * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.grainDepth}
                    onChange={(e) => updateSetting('grainDepth', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* DYNAMICS */}
            {activeSection === 'dynamics' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dinâmica de Pressão e Velocidade
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Tamanho por Pressão (Apple Pencil)</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.pressureSize * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.pressureSize}
                    onChange={(e) => updateSetting('pressureSize', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Opacidade por Pressão</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.pressureOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.pressureOpacity}
                    onChange={(e) => updateSetting('pressureOpacity', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Dinâmica de Velocidade (Tamanho)</span>
                    <span className="font-mono text-sky-400">{Math.round(settings.speedSize * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={settings.speedSize}
                    onChange={(e) => updateSetting('speedSize', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* DUAL BRUSH */}
            {activeSection === 'dual' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1b202c]">
                  <div>
                    <h4 className="text-xs font-bold text-white">Ativar Dual Brush</h4>
                    <p className="text-[11px] text-slate-400">Mescla dois pincéis em um único traço simultâneo</p>
                  </div>
                  <button
                    onClick={() => updateSetting('dualBrushEnabled', !settings.dualBrushEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      settings.dualBrushEnabled ? 'bg-sky-500' : 'bg-[#293040]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.dualBrushEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {settings.dualBrushEnabled && (
                  <div className="space-y-3 p-3 rounded-xl bg-[#171b24] border border-[#262c3a]">
                    <div>
                      <span className="text-xs text-slate-300 block mb-1">Segundo Pincel Combinado:</span>
                      <select
                        value={settings.secondBrushId}
                        onChange={(e) => updateSetting('secondBrushId', e.target.value as BrushPresetId)}
                        className="w-full bg-[#202635] text-xs text-white p-2 rounded-lg border border-[#2d3648]"
                      >
                        {BRUSH_PRESETS.map((bp) => (
                          <option key={bp.id} value={bp.id}>
                            {bp.name} ({bp.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-xs text-slate-300 block mb-1">Modo de Mesclagem Dual:</span>
                      <div className="grid grid-cols-5 gap-1">
                        {(['multiply', 'screen', 'overlay', 'darken', 'lighten'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => updateSetting('dualBlendMode', m)}
                            className={`p-1.5 rounded-lg text-xs capitalize transition ${
                              settings.dualBlendMode === m
                                ? 'bg-sky-500 text-white font-bold'
                                : 'bg-[#1f2533] text-slate-300'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROPERTIES */}
            {activeSection === 'properties' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Limites do Pincel
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Tamanho Máximo</span>
                    <span className="font-mono text-sky-400">{settings.sizeMax}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    value={settings.sizeMax}
                    onChange={(e) => updateSetting('sizeMax', parseInt(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Tamanho Mínimo</span>
                    <span className="font-mono text-sky-400">{settings.sizeMin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={settings.sizeMin}
                    onChange={(e) => updateSetting('sizeMin', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#242a38] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ABOUT */}
            {activeSection === 'about' && (
              <div className="space-y-3 animate-in fade-in duration-100 text-xs">
                <div className="p-4 rounded-xl bg-[#191d28] border border-[#272d3d] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{brush.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px]">
                      {brush.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{brush.description}</p>
                </div>

                <button
                  onClick={() => setSettings({ ...DEFAULT_SETTINGS, streamline: brush.smoothing })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#222836] hover:bg-[#2b3345] text-slate-300 hover:text-white transition"
                >
                  <RotateCcw size={14} />
                  <span>Redefinir Pincel aos Padrões de Fábrica</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Right Pane: Interactive Scratchpad (Bloco de Desenho) */}
          <div className="w-80 sm:w-96 border-l border-[#242935] bg-[#0e1015] flex flex-col shrink-0">
            {/* Pad Toolbar */}
            <div className="h-10 border-b border-[#212632] px-3 flex items-center justify-between bg-[#121419]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Bloco de Desenho
              </span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {['#ffffff', '#38bdf8', '#ef4444', '#10b981', '#f59e0b'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setPadColor(col)}
                      className={`w-4 h-4 rounded-full border ${
                        padColor === col ? 'border-sky-400 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>

                <button
                  onClick={clearPad}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202532] transition"
                  title="Limpar Bloco de Desenho"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Interactive Scratchpad Canvas */}
            <div className="flex-1 relative cursor-crosshair">
              <canvas
                ref={padCanvasRef}
                width={400}
                height={550}
                onPointerDown={handlePadPointerDown}
                onPointerMove={handlePadPointerMove}
                onPointerUp={handlePadPointerUp}
                className="w-full h-full block touch-none"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] text-slate-500 bg-[#141720]/80 px-2 py-1 rounded-full border border-[#252b39]">
                Rabisque aqui para testar o traço
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
