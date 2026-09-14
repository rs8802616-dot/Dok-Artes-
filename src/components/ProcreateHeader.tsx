import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Wrench,
  Sparkles,
  MousePointer,
  Paintbrush,
  Hand,
  Eraser,
  Layers,
  X,
  Check,
  Download
} from 'lucide-react';
import { ToolType, BrushPresetId } from '../types';

interface ProcreateHeaderProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  onOpenGallery: () => void;
  onOpenInstallModal?: () => void;
  // Left buttons
  onToggleActions: () => void;
  showActions: boolean;
  onToggleAdjustments: () => void;
  showAdjustments: boolean;
  isSelectionActive: boolean;
  onToggleSelection: () => void;
  isTransformActive: boolean;
  onToggleTransform: () => void;
  // Right tools
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onToggleBrushLibrary: (tool: 'Pincel' | 'Dedo' | 'Borracha') => void;
  showBrushLibrary: boolean;
  onToggleLayers: () => void;
  showLayers: boolean;
  onToggleColorPicker: () => void;
  showColorPicker: boolean;
  primaryColor: string;
  previousColor: string;
  // ColorDrop Dragging
  onColorDrop: (clientX: number, clientY: number) => void;
  // Context banners (Adjustments, QuickShape, ColorDrop Threshold)
  activeAdjustment: string | null;
  adjustmentValue: number;
  onChangeAdjustmentValue: (val: number) => void;
  onApplyAdjustment: () => void;
  onCancelAdjustment: () => void;
  quickShapeNotification: string | null;
  onEditQuickShape?: () => void;
  colorDropThreshold: number | null;
  onChangeColorDropThreshold?: (val: number) => void;
}

export function ProcreateHeader({
  projectName,
  onRenameProject,
  onOpenGallery,
  onOpenInstallModal,
  onToggleActions,
  showActions,
  onToggleAdjustments,
  showAdjustments,
  isSelectionActive,
  onToggleSelection,
  isTransformActive,
  onToggleTransform,
  currentTool,
  onSelectTool,
  onToggleBrushLibrary,
  showBrushLibrary,
  onToggleLayers,
  showLayers,
  onToggleColorPicker,
  showColorPicker,
  primaryColor,
  previousColor,
  onColorDrop,
  activeAdjustment,
  adjustmentValue,
  onChangeAdjustmentValue,
  onApplyAdjustment,
  onCancelAdjustment,
  quickShapeNotification,
  onEditQuickShape,
  colorDropThreshold,
  onChangeColorDropThreshold,
}: ProcreateHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectName);

  // ColorDrop dragging state
  const [isDraggingColor, setIsDraggingColor] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const handleColorPointerDown = (e: React.PointerEvent) => {
    // Only drag with primary mouse/touch button
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let didDrag = false;

    const handlePointerMove = (me: PointerEvent) => {
      const dist = Math.hypot(me.clientX - startX, me.clientY - startY);
      if (dist > 8) {
        didDrag = true;
        setIsDraggingColor(true);
        setDragPos({ x: me.clientX, y: me.clientY });
      }
    };

    const handlePointerUp = (me: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (didDrag) {
        setIsDraggingColor(false);
        onColorDrop(me.clientX, me.clientY);
      } else {
        // Simple tap -> toggle color popover
        onToggleColorPicker();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <>
      <header
        id="procreate-header"
        className="h-12 bg-[#121418]/95 backdrop-blur-md border-b border-[#222631] px-2 sm:px-4 flex items-center justify-between select-none z-40 relative shrink-0"
      >
        {/* LEFT CLUSTER: Galeria + Ações + Ajustes + Seleção + Transformar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 1. Galeria */}
          <button
            id="gallery-btn"
            onClick={onOpenGallery}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f232c] transition text-xs font-semibold"
            title="Voltar para a Galeria Procreate"
          >
            <ChevronLeft size={17} className="text-slate-400" />
            <span>Galeria</span>
          </button>

          <div className="h-4 w-[1px] bg-[#292e3c]" />

          {/* 2. Ações (Wrench) */}
          <button
            id="action-wrench-btn"
            onClick={onToggleActions}
            className={`p-1.5 rounded-lg transition ${
              showActions
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Ações (Tela, Inserir Foto, Compartilhar, Prefs)"
          >
            <Wrench size={16} />
          </button>

          {/* 3. Ajustes (Magic Wand) */}
          <button
            id="adjustments-magic-wand-btn"
            onClick={onToggleAdjustments}
            className={`p-1.5 rounded-lg transition ${
              showAdjustments
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Ajustes (Desfoque Gaussiano, HSL, Ruído, Glitch)"
          >
            <Sparkles size={16} />
          </button>

          {/* 4. Seleção ('S' ribbon) */}
          <button
            id="selection-tool-btn"
            onClick={onToggleSelection}
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
              isSelectionActive
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Seleção (Mão Livre, Retângulo, Elipse)"
          >
            <span className="italic font-serif font-black text-sm">S</span>
          </button>

          {/* 5. Transformar (Pointer arrow) */}
          <button
            id="transform-tool-btn"
            onClick={onToggleTransform}
            className={`p-1.5 rounded-lg transition ${
              isTransformActive
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Transformar & Mover Camada"
          >
            <MousePointer size={15} />
          </button>
        </div>

        {/* CENTER CONTEXT BANNER / SLIDER */}
        <div className="flex-1 max-w-sm sm:max-w-md mx-2 flex items-center justify-center">
          {/* Active Adjustment Slider (e.g. Gaussian Blur / HSL) */}
          {activeAdjustment ? (
            <div className="w-full flex items-center gap-2 bg-[#181b22] px-3 py-1 rounded-full border border-[#2e3444] shadow-lg animate-in fade-in duration-100">
              <span className="text-xs font-semibold text-slate-200 capitalize whitespace-nowrap">
                {activeAdjustment}: {Math.round(adjustmentValue * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={adjustmentValue}
                onChange={(e) => onChangeAdjustmentValue(parseFloat(e.target.value))}
                className="flex-1 accent-sky-400 bg-[#2b3140] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={onApplyAdjustment}
                className="p-1 rounded bg-sky-500 text-white hover:bg-sky-400 transition"
                title="Aplicar Ajuste"
              >
                <Check size={12} strokeWidth={3} />
              </button>
              <button
                onClick={onCancelAdjustment}
                className="p-1 rounded text-slate-400 hover:text-white transition"
                title="Cancelar Ajuste"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ) : colorDropThreshold !== null ? (
            /* ColorDrop Threshold Slider */
            <div className="w-full flex items-center gap-2 bg-[#181b22] px-3 py-1 rounded-full border border-sky-500/50 shadow-lg animate-in fade-in duration-100">
              <span className="text-xs font-semibold text-sky-400 whitespace-nowrap">
                Limiar de ColorDrop: {Math.round(colorDropThreshold * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={colorDropThreshold}
                onChange={(e) => onChangeColorDropThreshold?.(parseFloat(e.target.value))}
                className="flex-1 accent-sky-400 bg-[#2b3140] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ) : quickShapeNotification ? (
            /* QuickShape Recognized Pill */
            <div className="flex items-center gap-2 bg-[#181b22] px-3 py-1 rounded-full border border-sky-500/60 shadow-lg animate-in zoom-in-95 duration-150">
              <span className="text-xs font-semibold text-white">
                {quickShapeNotification}
              </span>
              {onEditQuickShape && (
                <button
                  onClick={onEditQuickShape}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 underline"
                >
                  Editar Forma
                </button>
              )}
            </div>
          ) : (
            /* Project Title */
            <div className="hidden md:flex items-center">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => {
                    if (tempTitle.trim()) onRenameProject(tempTitle.trim());
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (tempTitle.trim()) onRenameProject(tempTitle.trim());
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="bg-[#1b1f28] text-white text-xs px-2 py-0.5 rounded border border-sky-400 focus:outline-none"
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    setIsEditingTitle(true);
                    setTempTitle(projectName);
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer transition truncate max-w-[180px]"
                  title="Dois cliques para renomear"
                >
                  {projectName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT CLUSTER: Pincel, Esfumar (Dedo), Borracha, Camadas, Cor Ativa + Baixar App */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          {onOpenInstallModal && (
            <button
              id="header-install-app-btn"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#1a1e28] hover:bg-[#252b3a] border border-[#2b3346] hover:border-cyan-500/50 text-cyan-300 hover:text-white transition text-xs font-semibold shadow-sm"
              title="Baixar FreeNote Studio para Tablet, Celular ou PC"
            >
              <Download size={14} className="text-cyan-400" />
              <span className="hidden md:inline">Baixar App</span>
            </button>
          )}

          {/* 1. Pincel */}
          <button
            id="tool-brush-btn"
            onClick={() => {
              if (currentTool === 'brush') {
                onToggleBrushLibrary('Pincel');
              } else {
                onSelectTool('brush');
              }
            }}
            className={`p-2 rounded-xl transition ${
              currentTool === 'brush'
                ? 'bg-[#1e2533] text-sky-400 border border-sky-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Pincel Procreate: Toque para selecionar ou toque novamente para abrir a Biblioteca de Pincéis"
          >
            <Paintbrush size={18} strokeWidth={2.2} />
          </button>

          {/* 2. Dedo / Esfumar */}
          <button
            id="tool-smudge-btn"
            onClick={() => {
              if (currentTool === 'smudge') {
                onToggleBrushLibrary('Dedo');
              } else {
                onSelectTool('smudge');
              }
            }}
            className={`p-2 rounded-xl transition ${
              currentTool === 'smudge'
                ? 'bg-[#1e2533] text-sky-400 border border-sky-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Dedo / Esfumar Procreate: Toque para esfumar cores suavemente"
          >
            <Hand size={18} strokeWidth={2.2} />
          </button>

          {/* 3. Borracha */}
          <button
            id="tool-eraser-btn"
            onClick={() => {
              if (currentTool === 'eraser') {
                onToggleBrushLibrary('Borracha');
              } else {
                onSelectTool('eraser');
              }
            }}
            className={`p-2 rounded-xl transition ${
              currentTool === 'eraser'
                ? 'bg-[#1e2533] text-sky-400 border border-sky-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Borracha Procreate: Apague com textura do pincel"
          >
            <Eraser size={18} strokeWidth={2.2} />
          </button>

          {/* 4. Camadas */}
          <button
            id="tool-layers-btn"
            onClick={onToggleLayers}
            className={`p-2 rounded-xl transition ${
              showLayers
                ? 'bg-[#1e2533] text-sky-400 border border-sky-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#1f232c]'
            }`}
            title="Camadas Procreate: Painel de camadas, modos de mesclagem e opacidade"
          >
            <Layers size={18} strokeWidth={2.2} />
          </button>

          {/* 5. Círculo de Cor Ativa (Com suporte a ColorDrop!) */}
          <div className="relative">
            <button
              id="tool-color-btn"
              onPointerDown={handleColorPointerDown}
              className={`w-7 h-7 rounded-full border-2 transition shadow-md touch-none flex items-center justify-center active:scale-95 ${
                showColorPicker
                  ? 'border-sky-400 scale-105'
                  : 'border-white/80 hover:border-white'
              }`}
              style={{ backgroundColor: primaryColor }}
              title="Cor Ativa: Toque para abrir Paleta/Disco ou ARRASTE para o desenho (ColorDrop)"
            />
          </div>
        </div>
      </header>

      {/* Floating ColorDrop Dragging Disc Following Pointer */}
      {isDraggingColor && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-white shadow-2xl animate-pulse"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="mt-1 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
            Solte para ColorDrop
          </div>
        </div>
      )}
    </>
  );
}
