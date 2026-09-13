import React, { useState, useRef, useEffect } from 'react';
import {
  Paintbrush,
  Eraser,
  Hand,
  Pipette,
  Shapes,
  Type,
  Maximize2,
  PaintBucket,
  Fingerprint,
  Square,
  Circle,
  Minus,
  MoveRight,
  Triangle,
  Star,
  Layers,
  Palette,
  Sparkles,
  Highlighter,
  PenTool
} from 'lucide-react';
import { ToolType, ShapeType, BrushPresetId } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  activeShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  primaryColor: string;
  brushSize: number;
  brushOpacity: number;
  onChangeSize: (size: number) => void;
  onChangeOpacity: (opacity: number) => void;
  onToggleColorPanel: () => void;
  showColorPanel: boolean;
  onToggleLayerPanel: () => void;
  showLayerPanel: boolean;
  onToggleBrushPanel: () => void;
  showBrushPanel: boolean;
  activeBrushId: BrushPresetId;
  activeLayerCount: number;
}

export function Toolbar({
  currentTool,
  onSelectTool,
  activeShape,
  onSelectShape,
  primaryColor,
  brushSize,
  brushOpacity,
  onChangeSize,
  onChangeOpacity,
  onToggleColorPanel,
  showColorPanel,
  onToggleLayerPanel,
  showLayerPanel,
  onToggleBrushPanel,
  showBrushPanel,
  activeBrushId,
  activeLayerCount,
}: ToolbarProps) {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const shapeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shapeMenuRef.current && !shapeMenuRef.current.contains(e.target as Node)) {
        setShowShapeMenu(false);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="fixed left-3 top-18 bottom-4 z-20 flex flex-col justify-between pointer-events-none">
      {/* Main vertical tool strip */}
      <div className="bg-[#141821]/95 backdrop-blur-md border border-[#262e3d] rounded-2xl p-1.5 shadow-2xl flex flex-col items-center gap-1 pointer-events-auto max-h-[80vh] overflow-y-auto overflow-x-hidden">
        {/* Brush Tool */}
        <button
          id="tool-brush-btn"
          onClick={() => {
            onSelectTool('brush');
            onToggleBrushPanel();
          }}
          className={`relative p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'brush'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-bold'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Pincéis & Canetas (Clique para abrir biblioteca)"
        >
          {activeBrushId === 'highlighter' ? (
            <Highlighter size={20} />
          ) : activeBrushId === 'pen' || activeBrushId === 'ink' ? (
            <PenTool size={20} />
          ) : (
            <Paintbrush size={20} />
          )}
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Pincel</span>
        </button>

        {/* Eraser Tool */}
        <button
          id="tool-eraser-btn"
          onClick={() => onSelectTool('eraser')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'eraser'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Borracha (E)"
        >
          <Eraser size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Apagar</span>
        </button>

        {/* Smudge / Esfumar */}
        <button
          id="tool-smudge-btn"
          onClick={() => onSelectTool('smudge')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'smudge'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Esfumar / Misturar Cores"
        >
          <Fingerprint size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Esfumar</span>
        </button>

        {/* Flood Fill / Balde */}
        <button
          id="tool-fill-btn"
          onClick={() => onSelectTool('fill')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'fill'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Preenchimento / Balde de Tinta (G)"
        >
          <PaintBucket size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Preencher</span>
        </button>

        {/* Shapes Menu */}
        <div className="relative" ref={shapeMenuRef}>
          <button
            id="tool-shapes-btn"
            onClick={() => {
              onSelectTool('shapes');
              setShowShapeMenu(!showShapeMenu);
            }}
            className={`p-2.5 rounded-xl transition flex flex-col items-center ${
              currentTool === 'shapes'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-300 hover:bg-[#202735] hover:text-white'
            }`}
            title="Formas Geométricas & QuickShape"
          >
            <Shapes size={20} />
            <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Formas</span>
          </button>

          {showShapeMenu && (
            <div className="absolute left-full ml-2 top-0 bg-[#191f2b] border border-[#2e3748] rounded-2xl shadow-2xl p-2 grid grid-cols-2 gap-1.5 w-40 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
              {[
                { id: 'line', icon: Minus, label: 'Linha' },
                { id: 'arrow', icon: MoveRight, label: 'Seta' },
                { id: 'rect', icon: Square, label: 'Retângulo' },
                { id: 'circle', icon: Circle, label: 'Círculo' },
                { id: 'triangle', icon: Triangle, label: 'Triângulo' },
                { id: 'star', icon: Star, label: 'Estrela' },
              ].map((s) => {
                const IconComponent = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectShape(s.id as ShapeType);
                      onSelectTool('shapes');
                      setShowShapeMenu(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs transition ${
                      activeShape === s.id && currentTool === 'shapes'
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-[#252e40]'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Text Tool */}
        <button
          id="tool-text-btn"
          onClick={() => onSelectTool('text')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'text'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Adicionar Texto"
        >
          <Type size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Texto</span>
        </button>

        {/* Selection & Transform */}
        <button
          id="tool-select-btn"
          onClick={() => onSelectTool('select')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'select'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Seleção e Transformação Retangular (Mover / Ajustar)"
        >
          <Maximize2 size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Seleção</span>
        </button>

        {/* Eyedropper / Conta-gotas */}
        <button
          id="tool-eyedropper-btn"
          onClick={() => onSelectTool('eyedropper')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'eyedropper'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Conta-gotas (Capturar cor da tela)"
        >
          <Pipette size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Gotas</span>
        </button>

        {/* Hand tool */}
        <button
          id="tool-hand-btn"
          onClick={() => onSelectTool('hand')}
          className={`p-2.5 rounded-xl transition flex flex-col items-center ${
            currentTool === 'hand'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Mão / Navegar pela tela (Espaço)"
        >
          <Hand size={20} />
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Mover</span>
        </button>

        <div className="w-8 h-[1px] bg-[#293242] my-1" />

        {/* Color Button & Preview */}
        <button
          id="toggle-color-panel-btn"
          onClick={onToggleColorPanel}
          className={`relative p-2 rounded-xl transition flex flex-col items-center ${
            showColorPanel ? 'ring-2 ring-violet-500 bg-[#222b3b]' : 'hover:bg-[#202735]'
          }`}
          title="Paleta e Roda de Cores"
        >
          <div
            className="w-7 h-7 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="text-[9px] text-slate-400 mt-1 hidden sm:block">Cores</span>
        </button>

        {/* Layers Button */}
        <button
          id="toggle-layer-panel-btn"
          onClick={onToggleLayerPanel}
          className={`relative p-2.5 rounded-xl transition flex flex-col items-center ${
            showLayerPanel
              ? 'bg-violet-600 text-white font-bold'
              : 'text-slate-300 hover:bg-[#202735] hover:text-white'
          }`}
          title="Gerenciar Camadas"
        >
          <div className="relative">
            <Layers size={20} />
            <span className="absolute -top-1.5 -right-2 bg-violet-400 text-[#0e1217] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {activeLayerCount}
            </span>
          </div>
          <span className="text-[9px] mt-0.5 tracking-tight hidden sm:block">Camadas</span>
        </button>
      </div>

      {/* Floating sliders for Size & Opacity */}
      <div className="bg-[#141821]/95 backdrop-blur-md border border-[#262e3d] rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 pointer-events-auto w-36 sm:w-40">
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1">
            <span>Tamanho</span>
            <span className="text-slate-200 font-mono">{brushSize}px</span>
          </div>
          <input
            id="brush-size-slider"
            type="range"
            min="1"
            max="150"
            value={brushSize}
            onChange={(e) => onChangeSize(Number(e.target.value))}
            className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1">
            <span>Opacidade</span>
            <span className="text-slate-200 font-mono">{Math.round(brushOpacity * 100)}%</span>
          </div>
          <input
            id="brush-opacity-slider"
            type="range"
            min="5"
            max="100"
            value={Math.round(brushOpacity * 100)}
            onChange={(e) => onChangeOpacity(Number(e.target.value) / 100)}
            className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </aside>
  );
}
