import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  PlusCircle,
  Maximize2,
  FileDown,
  Film,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  Type,
  Copy,
  Scissors,
  FlipHorizontal,
  FlipVertical,
  Grid,
  Sparkles,
  Check,
  Eye,
  X,
  Play,
  Share2,
  Sliders,
  Palette,
  Download
} from 'lucide-react';
import { PaperTemplate, SymmetryMode } from '../types';

interface ProcreateActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // Canvas actions
  showAnimationAssist: boolean;
  onToggleAnimationAssist: () => void;
  showReference: boolean;
  onToggleReference: () => void;
  showDrawingGuide: boolean;
  onToggleDrawingGuide: () => void;
  paperTemplate: PaperTemplate;
  onChangePaperTemplate: (template: PaperTemplate) => void;
  symmetryMode: SymmetryMode;
  onChangeSymmetryMode: (mode: SymmetryMode) => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onAddText: () => void;
  onInsertImage: (file: File) => void;
  onExport: (format: 'png' | 'jpeg' | 'webp' | 'json' | 'video') => void;
  isLeftHanded: boolean;
  onToggleLeftHanded: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpen3DViewer?: () => void;
  onOpenTimelapse?: () => void;
  onOpenInstallModal?: () => void;
}

type ActionTab = 'add' | 'canvas' | 'share' | 'video' | 'prefs' | 'help';

export function ProcreateActionsMenu({
  isOpen,
  onClose,
  showAnimationAssist,
  onToggleAnimationAssist,
  showReference,
  onToggleReference,
  showDrawingGuide,
  onToggleDrawingGuide,
  paperTemplate,
  onChangePaperTemplate,
  symmetryMode,
  onChangeSymmetryMode,
  onFlipHorizontal,
  onFlipVertical,
  onAddText,
  onInsertImage,
  onExport,
  isLeftHanded,
  onToggleLeftHanded,
  onToggleFullscreen,
  isFullscreen,
  onOpen3DViewer,
  onOpenTimelapse,
  onOpenInstallModal,
}: ProcreateActionsMenuProps) {
  const [activeTab, setActiveTab] = useState<ActionTab>('canvas');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#action-wrench-btn')
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

  return (
    <div
      ref={popoverRef}
      id="procreate-actions-popover"
      className="fixed top-14 left-4 sm:left-14 w-[330px] sm:w-[380px] bg-[#16181d]/95 backdrop-blur-xl border border-[#2b2f3a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none text-slate-200"
    >
      {/* Top Tabs Bar */}
      <div className="h-11 border-b border-[#252934] bg-[#121418] px-2 flex items-center justify-between shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('add')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            activeTab === 'add' ? 'bg-[#252a35] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Adicionar
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            activeTab === 'canvas' ? 'bg-[#252a35] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tela
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            activeTab === 'share' ? 'bg-[#252a35] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Compartilhar
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            activeTab === 'video' ? 'bg-[#252a35] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Vídeo
        </button>

        <button
          onClick={() => setActiveTab('prefs')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            activeTab === 'prefs' ? 'bg-[#252a35] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pref.
        </button>

        <button
          onClick={() => setActiveTab('help')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            activeTab === 'help' ? 'bg-[#252a35] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ajuda
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white transition ml-1 shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onInsertImage(e.target.files[0]);
            onClose();
          }
        }}
      />

      {/* Tab Contents */}
      <div className="p-3.5 space-y-1.5 max-h-[460px] overflow-y-auto">
        {/* TAB 1: ADICIONAR */}
        {activeTab === 'add' && (
          <div className="space-y-1 text-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon size={16} className="text-sky-400" />
                <span className="font-medium text-slate-200">Inserir uma foto</span>
              </div>
              <span className="text-[11px] text-slate-500">JPG, PNG</span>
            </button>

            <button
              onClick={() => {
                onAddText();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <Type size={16} className="text-sky-400" />
                <span className="font-medium text-slate-200">Adicionar texto</span>
              </div>
              <span className="text-[11px] text-slate-500">Tipografia</span>
            </button>

            <div className="pt-2 border-t border-[#252934] mt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                Ações de Recorte
              </span>
              <button
                onClick={() => {
                  onExport('png');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
              >
                <Copy size={16} className="text-slate-400" />
                <span className="font-medium text-slate-200">Copiar tela</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TELA */}
        {activeTab === 'canvas' && (
          <div className="space-y-1.5 text-xs">
            {/* Guia de Desenho (Toggle + Options) */}
            <div className="p-2.5 rounded-xl bg-[#1a1d24] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid size={16} className="text-sky-400" />
                  <span className="font-medium text-slate-200">Guia de Desenho</span>
                </div>
                <button
                  onClick={onToggleDrawingGuide}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    showDrawingGuide ? 'bg-sky-500' : 'bg-[#2c3342]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showDrawingGuide ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {showDrawingGuide && (
                <div className="pt-2 border-t border-[#252a35] grid grid-cols-3 gap-1 animate-in fade-in duration-100">
                  <button
                    onClick={() => onChangePaperTemplate('grid')}
                    className={`p-1.5 rounded-lg text-[11px] transition ${
                      paperTemplate === 'grid'
                        ? 'bg-sky-500 text-white font-semibold'
                        : 'bg-[#14161c] text-slate-300 hover:bg-[#222734]'
                    }`}
                  >
                    Grade 2D
                  </button>
                  <button
                    onClick={() => onChangePaperTemplate('isometric')}
                    className={`p-1.5 rounded-lg text-[11px] transition ${
                      paperTemplate === 'isometric'
                        ? 'bg-sky-500 text-white font-semibold'
                        : 'bg-[#14161c] text-slate-300 hover:bg-[#222734]'
                    }`}
                  >
                    Isométrica
                  </button>
                  <button
                    onClick={() => onChangePaperTemplate('ruled')}
                    className={`p-1.5 rounded-lg text-[11px] transition ${
                      paperTemplate === 'ruled'
                        ? 'bg-sky-500 text-white font-semibold'
                        : 'bg-[#14161c] text-slate-300 hover:bg-[#222734]'
                    }`}
                  >
                    Pautado
                  </button>
                </div>
              )}
            </div>

            {/* Simetria Guide */}
            <div className="p-2.5 rounded-xl bg-[#1a1d24] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">Guia de Simetria</span>
                <span className="text-[11px] text-sky-400 capitalize">{symmetryMode}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['none', 'vertical', 'horizontal', 'radial'] as SymmetryMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onChangeSymmetryMode(mode)}
                    className={`py-1 rounded text-[11px] transition ${
                      symmetryMode === mode
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-[#14161c] text-slate-300 hover:bg-[#222734]'
                    }`}
                  >
                    {mode === 'none'
                      ? 'Desligada'
                      : mode === 'vertical'
                      ? 'Vertical'
                      : mode === 'horizontal'
                      ? 'Horiz.'
                      : 'Radial'}
                  </button>
                ))}
              </div>
            </div>

            {/* Assistente de Animação Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24]">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-violet-400" />
                <span className="font-medium text-slate-200">Assistente de Animação</span>
              </div>
              <button
                onClick={onToggleAnimationAssist}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  showAnimationAssist ? 'bg-sky-500' : 'bg-[#2c3342]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    showAnimationAssist ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Janela de Referência Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24]">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-amber-400" />
                <span className="font-medium text-slate-200">Janela de Referência</span>
              </div>
              <button
                onClick={onToggleReference}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  showReference ? 'bg-sky-500' : 'bg-[#2c3342]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    showReference ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3D Model Painting */}
            {onOpen3DViewer && (
              <button
                onClick={() => {
                  onOpen3DViewer();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-sky-600/25 to-indigo-600/25 border border-sky-500/30 hover:border-sky-400 transition text-slate-200 group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-white">Estúdio 3D (Pintura de Modelos)</div>
                    <div className="text-[10px] text-slate-400">Pinte em tempo real em malhas 3D (USDZ / OBJ)</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                  3D
                </span>
              </button>
            )}

            {/* Canvas Flips */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={onFlipHorizontal}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-slate-200"
              >
                <FlipHorizontal size={15} />
                <span>Virar Horizontal</span>
              </button>
              <button
                onClick={onFlipVertical}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-slate-200"
              >
                <FlipVertical size={15} />
                <span>Virar Vertical</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: COMPARTILHAR */}
        {activeTab === 'share' && (
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
              Compartilhar Imagem
            </span>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => {
                  onExport('png');
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
              >
                <span className="font-semibold text-slate-200">PNG (Transparência Alta Qualidade)</span>
                <span className="text-[10px] text-sky-400">Recomendado</span>
              </button>

              <button
                onClick={() => {
                  onExport('jpeg');
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
              >
                <span className="font-semibold text-slate-200">JPEG (Comprimido)</span>
                <span className="text-[10px] text-slate-400">Padrão Web</span>
              </button>

              <button
                onClick={() => {
                  onExport('json');
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
              >
                <span className="font-semibold text-slate-200">Arquivo de Projeto (.procreate)</span>
                <span className="text-[10px] text-violet-400">Camadas + Histórico</span>
              </button>
            </div>

            {onOpenInstallModal && (
              <div className="pt-2 border-t border-[#252a35]">
                <button
                  onClick={() => {
                    onOpenInstallModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cyan-600/25 to-blue-600/25 border border-cyan-500/40 hover:border-cyan-400 text-white font-semibold transition group shadow-md shadow-cyan-500/10"
                >
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Baixar Aplicativo (PWA)</div>
                      <div className="text-[10px] text-slate-300">Instalar no Celular, Tablet ou PC</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40">
                    Instalar
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VÍDEO */}
        {activeTab === 'video' && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24]">
              <span className="font-medium text-slate-200">Gravação de Time-lapse</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Ativo
              </span>
            </div>

            {onOpenTimelapse && (
              <button
                onClick={() => {
                  onOpenTimelapse();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#202636] hover:bg-[#2c344a] text-white font-semibold transition border border-sky-500/20"
              >
                <div className="flex items-center gap-2">
                  <Play size={15} className="text-sky-400" />
                  <span>Repetição Time-lapse Interativa</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                  Player
                </span>
              </button>
            )}

            <button
              onClick={() => {
                onExport('video');
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] text-slate-200 font-medium transition"
            >
              <div className="flex items-center gap-2">
                <FileDown size={15} />
                <span>Exportar Vídeo Time-lapse</span>
              </div>
              <span className="text-[11px] opacity-80">MP4</span>
            </button>
          </div>
        )}

        {/* TAB 5: PREFERÊNCIAS */}
        {activeTab === 'prefs' && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24]">
              <div>
                <div className="font-medium text-slate-200">Interface para Canhotos</div>
                <div className="text-[10px] text-slate-400">Move os sliders para a direita</div>
              </div>
              <button
                onClick={onToggleLeftHanded}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  isLeftHanded ? 'bg-sky-500' : 'bg-[#2c3342]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isLeftHanded ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={onToggleFullscreen}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] transition text-left"
            >
              <div className="flex items-center gap-2">
                <Maximize2 size={16} className="text-slate-300" />
                <span className="font-medium text-slate-200">
                  {isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (Zen)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">4 dedos</span>
            </button>

            {onOpenInstallModal && (
              <button
                onClick={() => {
                  onOpenInstallModal();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d24] hover:bg-[#232834] border border-[#2c3344] transition text-left"
              >
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-cyan-400" />
                  <div>
                    <div className="font-medium text-slate-200">Instalar Aplicativo Nativo</div>
                    <div className="text-[10px] text-slate-400">Tablet, Celular ou PC (PWA)</div>
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold">Abrir</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 6: AJUDA & GESTOS */}
        {activeTab === 'help' && (
          <div className="space-y-2 text-xs text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
              Gestos Oficiais Procreate
            </span>
            <div className="space-y-1.5 bg-[#121418] p-2.5 rounded-xl border border-[#252934]">
              <div className="flex justify-between py-1 border-b border-[#20242f]">
                <span className="text-slate-400">Desfazer (Undo):</span>
                <span className="font-semibold text-white">Toque com 2 dedos</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#20242f]">
                <span className="text-slate-400">Refazer (Redo):</span>
                <span className="font-semibold text-white">Toque com 3 dedos</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#20242f]">
                <span className="text-slate-400">QuickShape:</span>
                <span className="font-semibold text-white">Desenhe e segure 0.5s</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#20242f]">
                <span className="text-slate-400">ColorDrop:</span>
                <span className="font-semibold text-white">Arraste o círculo de cor</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#20242f]">
                <span className="text-slate-400">QuickMenu:</span>
                <span className="font-semibold text-white">Toque no quadrado central</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Modo Zen:</span>
                <span className="font-semibold text-white">Toque com 4 dedos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
