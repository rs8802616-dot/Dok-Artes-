import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowDown,
  Sparkles,
  X,
  Check,
  MoreHorizontal,
  CornerDownRight,
  SunMoon,
  FolderPlus
} from 'lucide-react';
import { Layer, BlendMode } from '../types';

interface ProcreateLayersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleAlphaLock: (id: string) => void;
  onToggleClippingMask?: (id: string) => void;
  onInvertLayer?: (id: string) => void;
  onCopyLayer?: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onChangeBlendMode: (id: string, mode: BlendMode) => void;
  onMergeDown: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onClearLayer: (id: string) => void;
  onFillLayer: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
  backgroundColor: string;
  onChangeBackgroundColor: (color: string) => void;
}

const BLEND_MODES: { id: BlendMode; name: string; short: string }[] = [
  { id: 'source-over', name: 'Normal', short: 'N' },
  { id: 'multiply', name: 'Multiplicar', short: 'M' },
  { id: 'darken', name: 'Escurecer', short: 'E' },
  { id: 'color-burn', name: 'Superposição de Cores', short: 'SC' },
  { id: 'lighten', name: 'Clarear', short: 'C' },
  { id: 'screen', name: 'Tela', short: 'T' },
  { id: 'color-dodge', name: 'Subexposição de Cores', short: 'SB' },
  { id: 'lighter', name: 'Adicionar', short: 'ADD' },
  { id: 'overlay', name: 'Sobrepor', short: 'S' },
  { id: 'soft-light', name: 'Luz Suave', short: 'LS' },
  { id: 'hard-light', name: 'Luz Direta', short: 'LD' },
  { id: 'difference', name: 'Diferença', short: 'D' },
  { id: 'exclusion', name: 'Exclusão', short: 'EX' },
  { id: 'luminosity', name: 'Luminosidade', short: 'LUM' },
  { id: 'copy', name: 'Copiar', short: 'COP' },
];

export function ProcreateLayersPanel({
  isOpen,
  onClose,
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onToggleVisibility,
  onToggleLock,
  onToggleAlphaLock,
  onToggleClippingMask,
  onInvertLayer,
  onCopyLayer,
  onChangeOpacity,
  onChangeBlendMode,
  onMergeDown,
  onDuplicateLayer,
  onClearLayer,
  onFillLayer,
  onRenameLayer,
  backgroundColor,
  onChangeBackgroundColor,
}: ProcreateLayersPanelProps) {
  const [expandedBlendLayerId, setExpandedBlendLayerId] = useState<string | null>(null);
  const [activeMenuLayerId, setActiveMenuLayerId] = useState<string | null>(null);
  const [editingLayerNameId, setEditingLayerNameId] = useState<string | null>(null);
  const [tempLayerName, setTempLayerName] = useState('');
  const [showBgColorInput, setShowBgColorInput] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#tool-layers-btn')
      ) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Procreate shows top layer on top (reversed array)
  const reversedLayers = [...layers].reverse();

  const getShortBlendMode = (mode: BlendMode) => {
    return BLEND_MODES.find((m) => m.id === mode)?.short || 'N';
  };

  return (
    <div
      ref={popoverRef}
      id="procreate-layers-popover"
      className="fixed top-14 right-4 sm:right-14 w-[310px] sm:w-[350px] max-h-[560px] bg-[#16181d]/95 backdrop-blur-xl border border-[#2b2f3a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none text-slate-200"
    >
      {/* Header */}
      <div className="h-12 border-b border-[#252934] px-4 flex items-center justify-between shrink-0 bg-[#121418]/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white tracking-wide">Camadas</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#242934] text-slate-300 font-mono">
            {layers.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="add-layer-btn"
            onClick={onAddLayer}
            className="p-1.5 rounded-lg bg-[#222733] hover:bg-sky-500 hover:text-white border border-[#2f3543] text-slate-200 transition"
            title="Adicionar Nova Camada (+)"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252934] transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {reversedLayers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          const isBlendExpanded = expandedBlendLayerId === layer.id;
          const isMenuOpen = activeMenuLayerId === layer.id;
          const canMerge = layers.findIndex((l) => l.id === layer.id) > 0;

          return (
            <div
              key={layer.id}
              className={`rounded-xl border transition flex flex-col overflow-hidden ${
                isActive
                  ? 'bg-[#222735] border-sky-500/60 shadow-md'
                  : 'bg-[#191d26]/80 border-[#272c38] hover:border-[#384050]'
              }`}
            >
              {/* Main Layer Row */}
              <div
                onClick={() => onSelectLayer(layer.id)}
                className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer ${
                  layer.clippingMask ? 'pl-6 bg-[#161a24]/50' : ''
                }`}
              >
                {/* Clipping Mask Arrow */}
                {layer.clippingMask && (
                  <CornerDownRight size={13} className="text-sky-400 shrink-0 -mr-1" />
                )}

                {/* Visibility Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                    layer.visible
                      ? 'bg-sky-500 border-sky-400 text-white'
                      : 'bg-[#15171e] border-[#363c4c] text-transparent hover:border-slate-400'
                  }`}
                  title={layer.visible ? 'Ocultar camada' : 'Mostrar camada'}
                >
                  <Check size={13} strokeWidth={3} />
                </button>

                {/* Layer Thumbnail */}
                <div className="w-11 h-9 rounded-lg bg-[#111317] border border-[#282e3c] overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                  {layer.canvas ? (
                    <img
                      src={layer.canvas.toDataURL()}
                      alt={layer.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-500">Vazia</span>
                  )}
                  {layer.alphaLocked && (
                    <div
                      className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400"
                      title="Bloqueio Alfa Ativo"
                    />
                  )}
                </div>

                {/* Layer Name & Badges */}
                <div className="flex-1 min-w-0 pr-1">
                  {editingLayerNameId === layer.id ? (
                    <input
                      type="text"
                      value={tempLayerName}
                      onChange={(e) => setTempLayerName(e.target.value)}
                      onBlur={() => {
                        if (tempLayerName.trim()) {
                          onRenameLayer(layer.id, tempLayerName.trim());
                        }
                        setEditingLayerNameId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (tempLayerName.trim()) {
                            onRenameLayer(layer.id, tempLayerName.trim());
                          }
                          setEditingLayerNameId(null);
                        }
                      }}
                      autoFocus
                      className="w-full bg-[#161a23] text-white text-xs px-1.5 py-0.5 rounded border border-sky-400 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span
                        onDoubleClick={() => {
                          setEditingLayerNameId(layer.id);
                          setTempLayerName(layer.name);
                        }}
                        className={`text-xs font-semibold truncate ${
                          isActive ? 'text-white' : 'text-slate-200'
                        }`}
                        title="Dois cliques para renomear"
                      >
                        {layer.name}
                      </span>
                      {layer.locked && <Lock size={11} className="text-slate-400 shrink-0" />}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{Math.round(layer.opacity * 100)}%</span>
                    {layer.alphaLocked && <span className="text-amber-400">Alfa</span>}
                  </div>
                </div>

                {/* Procreate 'N' Blend Mode Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedBlendLayerId(isBlendExpanded ? null : layer.id);
                  }}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono transition shrink-0 ${
                    isBlendExpanded
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-[#1b202a] text-slate-300 border-[#2b3140] hover:text-white hover:border-slate-500'
                  }`}
                  title="Modo de Mesclagem & Opacidade"
                >
                  {getShortBlendMode(layer.blendMode)}
                </button>

                {/* Layer Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuLayerId(isMenuOpen ? null : layer.id);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#282f3d] transition"
                  title="Opções da Camada"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>

              {/* Procreate Blend Mode & Opacity Drawer */}
              {isBlendExpanded && (
                <div className="p-3 border-t border-[#292f3d] bg-[#141720] space-y-2.5 animate-in slide-in-from-top-1 duration-150">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Opacidade</span>
                      <span className="font-mono text-sky-400">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layer.opacity}
                      onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-[#252a35] h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Modo de Mesclagem
                    </span>
                    <div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto pr-1">
                      {BLEND_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => onChangeBlendMode(layer.id, mode.id)}
                          className={`px-1.5 py-1 rounded text-[10px] font-medium transition truncate ${
                            layer.blendMode === mode.id
                              ? 'bg-sky-500 text-white font-bold'
                              : 'bg-[#1b202a] text-slate-300 hover:bg-[#252c3b]'
                          }`}
                          title={mode.name}
                        >
                          {mode.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Layer Actions Menu Drawer */}
              {isMenuOpen && (
                <div className="p-2 border-t border-[#292f3d] bg-[#141720] grid grid-cols-2 gap-1 animate-in slide-in-from-top-1 duration-150 text-xs">
                  <button
                    onClick={() => {
                      onToggleAlphaLock(layer.id);
                      setActiveMenuLayerId(null);
                    }}
                    className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition text-left ${
                      layer.alphaLocked
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-slate-300 hover:bg-[#222836]'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>Bloqueio Alfa</span>
                  </button>

                  {onToggleClippingMask && (
                    <button
                      onClick={() => {
                        onToggleClippingMask(layer.id);
                        setActiveMenuLayerId(null);
                      }}
                      className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition text-left ${
                        layer.clippingMask
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'text-slate-300 hover:bg-[#222836]'
                      }`}
                    >
                      <CornerDownRight size={13} />
                      <span>Máscara de Corte</span>
                    </button>
                  )}

                  {onInvertLayer && (
                    <button
                      onClick={() => {
                        onInvertLayer(layer.id);
                        setActiveMenuLayerId(null);
                      }}
                      className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                    >
                      <SunMoon size={13} />
                      <span>Inverter Cores</span>
                    </button>
                  )}

                  {onCopyLayer && (
                    <button
                      onClick={() => {
                        onCopyLayer(layer.id);
                        setActiveMenuLayerId(null);
                      }}
                      className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                    >
                      <Copy size={13} />
                      <span>Copiar</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onToggleLock(layer.id);
                      setActiveMenuLayerId(null);
                    }}
                    className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                  >
                    {layer.locked ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{layer.locked ? 'Desbloquear' : 'Bloquear'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onDuplicateLayer(layer.id);
                      setActiveMenuLayerId(null);
                    }}
                    className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                  >
                    <Copy size={13} />
                    <span>Duplicar</span>
                  </button>

                  <button
                    onClick={() => {
                      onFillLayer(layer.id);
                      setActiveMenuLayerId(null);
                    }}
                    className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                  >
                    <span>🎨 Preencher</span>
                  </button>

                  <button
                    onClick={() => {
                      onClearLayer(layer.id);
                      setActiveMenuLayerId(null);
                    }}
                    className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                  >
                    <span>🧹 Limpar</span>
                  </button>

                  {canMerge && (
                    <button
                      onClick={() => {
                        onMergeDown(layer.id);
                        setActiveMenuLayerId(null);
                      }}
                      className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-[#222836] flex items-center gap-1.5 transition text-left"
                    >
                      <ArrowDown size={13} />
                      <span>Mesclar Abaixo</span>
                    </button>
                  )}

                  {layers.length > 1 && (
                    <button
                      onClick={() => {
                        onDeleteLayer(layer.id);
                        setActiveMenuLayerId(null);
                      }}
                      className="px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-500/20 flex items-center gap-1.5 transition text-left col-span-2"
                    >
                      <Trash2 size={13} />
                      <span>Excluir Camada</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Procreate "Cor do Fundo" (Background Color) */}
        <div className="mt-2 pt-2 border-t border-[#252934]">
          <div
            onClick={() => setShowBgColorInput(!showBgColorInput)}
            className="p-2.5 rounded-xl border border-[#272c38] bg-[#191d26]/80 hover:border-[#384050] flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-lg border border-[#3b4254] shadow-inner"
                style={{ backgroundColor: backgroundColor || '#ffffff' }}
              />
              <span className="text-xs font-semibold text-slate-300">Cor do Fundo</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              {backgroundColor}
            </span>
          </div>

          {showBgColorInput && (
            <div className="p-2.5 mt-1.5 rounded-xl bg-[#141720] border border-[#292f3d] space-y-2">
              <span className="text-[11px] text-slate-400">Escolha a cor da prancheta:</span>
              <div className="grid grid-cols-6 gap-1.5">
                {['#ffffff', '#fafafa', '#f4ebd0', '#15181d', '#0b0d10', '#3b82f6'].map(
                  (col) => (
                    <button
                      key={col}
                      onClick={() => onChangeBackgroundColor(col)}
                      className={`h-7 rounded-md border transition ${
                        backgroundColor === col ? 'border-sky-400 scale-105' : 'border-[#333a4a]'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
