import { useState } from 'react';
import {
  Layers,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  ArrowDown,
  Eraser,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { Layer, BlendMode } from '../types';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMergeDown: (id: string) => void;
  onClearLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleAlphaLock: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onChangeBlendMode: (id: string, mode: BlendMode) => void;
  onRenameLayer: (id: string, name: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onClose: () => void;
}

const BLEND_MODES: { id: BlendMode; label: string }[] = [
  { id: 'source-over', label: 'Normal' },
  { id: 'multiply', label: 'Multiplicar (Multiply)' },
  { id: 'screen', label: 'Tela (Screen)' },
  { id: 'overlay', label: 'Sobrepor (Overlay)' },
  { id: 'darken', label: 'Escurecer' },
  { id: 'lighten', label: 'Clarear' },
  { id: 'color-dodge', label: 'Subexposição de Cores' },
  { id: 'soft-light', label: 'Luz Suave' },
  { id: 'difference', label: 'Diferença' },
];

export function LayerPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMergeDown,
  onClearLayer,
  onToggleVisibility,
  onToggleLock,
  onToggleAlphaLock,
  onChangeOpacity,
  onChangeBlendMode,
  onRenameLayer,
  onMoveLayer,
  onClose,
}: LayerPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const handleStartRename = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleFinishRename = (id: string) => {
    if (editingName.trim()) {
      onRenameLayer(id, editingName.trim());
    }
    setEditingLayerId(null);
  };

  return (
    <div className="fixed right-3 top-18 z-30 w-80 bg-[#151922]/95 backdrop-blur-xl border border-[#2a3242] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#242b3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={17} className="text-violet-400" />
          <h2 className="font-semibold text-sm text-slate-100">Camadas ({layers.length})</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="add-layer-btn"
            onClick={onAddLayer}
            className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition shadow-sm flex items-center gap-1 text-xs font-semibold px-2.5"
            title="Criar nova camada"
          >
            <Plus size={15} />
            <span>Nova</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#252c3c] transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Layers List (Top layer first) */}
      <div className="p-3 overflow-y-auto space-y-2 flex-1">
        {/* Render layers in reverse order so top layer is at top of panel */}
        {[...layers].reverse().map((layer, reverseIndex) => {
          const actualIndex = layers.length - 1 - reverseIndex;
          const isSelected = layer.id === activeLayerId;
          const isExpanded = expandedLayerId === layer.id;

          // Thumbnail preview
          let thumbUrl = '';
          try {
            thumbUrl = layer.canvas.toDataURL('image/png');
          } catch (e) {}

          return (
            <div
              key={layer.id}
              className={`rounded-xl border transition overflow-hidden ${
                isSelected
                  ? 'bg-[#1e2535] border-violet-500 shadow-md ring-1 ring-violet-500/50'
                  : 'bg-[#181d27]/80 border-[#262f3e] hover:bg-[#1c2230]'
              }`}
            >
              {/* Main layer bar */}
              <div
                onClick={() => onSelectLayer(layer.id)}
                className="p-2.5 flex items-center gap-2.5 cursor-pointer select-none"
              >
                {/* Visibility Eye */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  className={`p-1 rounded-md transition ${
                    layer.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600'
                  }`}
                  title={layer.visible ? 'Ocultar camada' : 'Exibir camada'}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                {/* Layer Thumbnail */}
                <div className="w-10 h-10 rounded-lg border border-[#30394a] bg-[#0d1017] checkerboard-pattern shrink-0 overflow-hidden flex items-center justify-center">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-600">Vazia</span>
                  )}
                </div>

                {/* Layer Info / Name */}
                <div className="flex-1 min-w-0">
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleFinishRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFinishRename(layer.id);
                      }}
                      autoFocus
                      className="bg-[#12161f] border border-violet-500 text-xs text-white px-1.5 py-0.5 rounded w-full focus:outline-none"
                    />
                  ) : (
                    <div
                      onDoubleClick={() => handleStartRename(layer)}
                      className="font-medium text-xs text-slate-100 truncate"
                      title="Clique duas vezes para renomear"
                    >
                      {layer.name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{Math.round(layer.opacity * 100)}%</span>
                    <span>•</span>
                    <span className="capitalize">{layer.blendMode.replace('-', ' ')}</span>
                    {layer.alphaLocked && (
                      <span className="text-violet-400 font-semibold">• Alpha</span>
                    )}
                  </div>
                </div>

                {/* Lock button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id);
                  }}
                  className={`p-1 rounded-md transition ${
                    layer.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={layer.locked ? 'Desbloquear camada' : 'Bloquear camada'}
                >
                  {layer.locked ? <Lock size={15} /> : <Unlock size={15} />}
                </button>

                {/* Settings collapse button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedLayerId(isExpanded ? null : layer.id);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200"
                  title="Configurações da camada"
                >
                  <Sliders size={15} />
                </button>
              </div>

              {/* Collapsible Layer Settings & Actions */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-[#262f3e] bg-[#141923] space-y-2.5 text-xs">
                  {/* Opacity slider */}
                  <div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
                      <span>Opacidade</span>
                      <span className="font-mono text-slate-200">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(layer.opacity * 100)}
                      onChange={(e) => onChangeOpacity(layer.id, Number(e.target.value) / 100)}
                      className="w-full accent-violet-500 h-1.5 bg-[#252d3d] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Blend mode select */}
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Modo de Mesclagem</span>
                    <select
                      value={layer.blendMode}
                      onChange={(e) => onChangeBlendMode(layer.id, e.target.value as BlendMode)}
                      className="w-full bg-[#1b202c] border border-[#2d3545] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    >
                      {BLEND_MODES.map((bm) => (
                        <option key={bm.id} value={bm.id}>
                          {bm.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alpha Lock toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-slate-300 font-medium">Bloqueio Alfa (Alpha Lock)</div>
                      <div className="text-[10px] text-slate-500">Pinta apenas onde já há arte</div>
                    </div>
                    <button
                      onClick={() => onToggleAlphaLock(layer.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                        layer.alphaLocked
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#212735] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {layer.alphaLocked ? 'Ativo' : 'Desativado'}
                    </button>
                  </div>

                  {/* Action buttons: Move, Duplicate, Merge Down, Clear, Delete */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#262f3e]">
                    <button
                      onClick={() => onMoveLayer(layer.id, 'up')}
                      disabled={actualIndex === layers.length - 1}
                      className="p-1.5 rounded-lg bg-[#202735] hover:bg-[#283244] disabled:opacity-40 text-slate-300 text-[10px] flex items-center justify-center gap-1 font-medium transition"
                      title="Subir Camada"
                    >
                      ▲ Cima
                    </button>
                    <button
                      onClick={() => onMoveLayer(layer.id, 'down')}
                      disabled={actualIndex === 0}
                      className="p-1.5 rounded-lg bg-[#202735] hover:bg-[#283244] disabled:opacity-40 text-slate-300 text-[10px] flex items-center justify-center gap-1 font-medium transition"
                      title="Descer Camada"
                    >
                      ▼ Baixo
                    </button>
                    <button
                      onClick={() => onDuplicateLayer(layer.id)}
                      className="p-1.5 rounded-lg bg-[#202735] hover:bg-[#283244] text-slate-300 text-[10px] flex items-center justify-center gap-1 font-medium transition"
                      title="Duplicar Camada"
                    >
                      <Copy size={12} />
                      <span>Copiar</span>
                    </button>
                    <button
                      onClick={() => onMergeDown(layer.id)}
                      disabled={actualIndex === 0}
                      className="p-1.5 rounded-lg bg-[#202735] hover:bg-[#283244] disabled:opacity-40 text-slate-300 text-[10px] flex items-center justify-center gap-1 font-medium transition"
                      title="Mesclar para baixo"
                    >
                      <ArrowDown size={12} />
                      <span>Mesclar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => onClearLayer(layer.id)}
                      className="p-1.5 rounded-lg bg-[#241c22] hover:bg-[#33222d] text-amber-300 text-[10px] flex items-center justify-center gap-1 font-medium transition"
                      title="Limpar desenho desta camada"
                    >
                      <Eraser size={12} />
                      <span>Limpar Camada</span>
                    </button>
                    <button
                      onClick={() => onDeleteLayer(layer.id)}
                      disabled={layers.length <= 1}
                      className="p-1.5 rounded-lg bg-[#2b181c] hover:bg-[#3d1e24] disabled:opacity-40 text-red-300 text-[10px] flex items-center justify-center gap-1 font-medium transition"
                      title="Excluir Camada"
                    >
                      <Trash2 size={12} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
