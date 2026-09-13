import { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  Undo2,
  Redo2,
  ZoomIn,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  Image as ImageIcon,
  Download,
  Film,
  Grid3X3,
  SplitSquareVertical,
  Compass,
  Maximize2,
  Minimize2,
  Check,
  Play
} from 'lucide-react';
import { PaperTemplate, SymmetryMode } from '../types';
import { PAPER_CONFIGS } from '../utils/constants';

interface HeaderProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onResetZoom: () => void;
  onOpenGallery: () => void;
  paperTemplate: PaperTemplate;
  onChangePaperTemplate: (template: PaperTemplate) => void;
  symmetryMode: SymmetryMode;
  onChangeSymmetryMode: (mode: SymmetryMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRuler: boolean;
  onToggleRuler: () => void;
  showAnimationTimeline: boolean;
  onToggleAnimationTimeline: () => void;
  onOpenFilters: () => void;
  onToggleReference: () => void;
  showReference: boolean;
  onExport: (format: 'png' | 'jpeg' | 'webp' | 'json' | 'video') => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function Header({
  projectName,
  onRenameProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onResetZoom,
  onOpenGallery,
  paperTemplate,
  onChangePaperTemplate,
  symmetryMode,
  onChangeSymmetryMode,
  showGrid,
  onToggleGrid,
  showRuler,
  onToggleRuler,
  showAnimationTimeline,
  onToggleAnimationTimeline,
  onOpenFilters,
  onToggleReference,
  showReference,
  onExport,
  onToggleFullscreen,
  isFullscreen,
}: HeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [showPaperMenu, setShowPaperMenu] = useState(false);
  const [showSymmetryMenu, setShowSymmetryMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const symmetryRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempName(projectName);
  }, [projectName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (paperRef.current && !paperRef.current.contains(e.target as Node)) {
        setShowPaperMenu(false);
      }
      if (symmetryRef.current && !symmetryRef.current.contains(e.target as Node)) {
        setShowSymmetryMenu(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFinishRename = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      onRenameProject(tempName.trim());
    } else {
      setTempName(projectName);
    }
  };

  return (
    <header className="h-14 bg-[#11141a]/95 backdrop-blur border-b border-[#222733] px-3 sm:px-4 flex items-center justify-between select-none z-30 relative shrink-0">
      {/* Left side: Gallery + Title + Undo/Redo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="gallery-btn"
          onClick={onOpenGallery}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1f29] hover:bg-[#232a38] text-slate-200 border border-[#2d3444] transition text-xs font-semibold"
          title="Galeria de Projetos e Cadernos"
        >
          <FolderOpen size={16} className="text-violet-400" />
          <span className="hidden md:inline">Galeria</span>
        </button>

        <div className="h-5 w-[1px] bg-[#2a3040]" />

        {/* Project Name editable */}
        {isEditingName ? (
          <input
            id="project-name-input"
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleFinishRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishRename();
              if (e.key === 'Escape') {
                setTempName(projectName);
                setIsEditingName(false);
              }
            }}
            autoFocus
            className="bg-[#1c222e] text-slate-100 px-2 py-1 text-sm font-semibold rounded border border-violet-500 focus:outline-none max-w-[140px] sm:max-w-[200px]"
          />
        ) : (
          <button
            id="edit-project-name-btn"
            onClick={() => setIsEditingName(true)}
            className="text-slate-200 hover:text-violet-400 font-semibold text-xs sm:text-sm px-2 py-1 rounded hover:bg-[#1a1f29] transition truncate max-w-[130px] sm:max-w-[190px] text-left"
            title="Clique para renomear"
          >
            {projectName}
          </button>
        )}

        <div className="h-5 w-[1px] bg-[#2a3040] hidden sm:block" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#151922] p-0.5 rounded-lg border border-[#232836]">
          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition ${
              canUndo
                ? 'text-slate-200 hover:bg-[#232a38] hover:text-violet-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            id="redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition ${
              canRedo
                ? 'text-slate-200 hover:bg-[#232a38] hover:text-violet-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Zoom indicator */}
        <button
          id="reset-zoom-btn"
          onClick={onResetZoom}
          className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 bg-[#151922] px-2 py-1 rounded-md border border-[#232836] transition"
          title="Ajustar tela (100%)"
        >
          <span>{Math.round(zoom * 100)}%</span>
          <RotateCcw size={11} className="text-slate-500" />
        </button>
      </div>

      {/* Right side: FreeNote Tools, Symmetry, Paper, Animation, Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Paper Template selector */}
        <div className="relative" ref={paperRef}>
          <button
            id="paper-template-btn"
            onClick={() => setShowPaperMenu(!showPaperMenu)}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              paperTemplate !== 'blank'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#1a1f29] border-[#2d3444] text-slate-300 hover:bg-[#232a38]'
            }`}
            title="Tipo de Folha (Pautado FreeNote, Quadriculado, etc)"
          >
            <FileText size={15} />
            <span className="hidden md:inline">Papel</span>
          </button>

          {showPaperMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#181d26] border border-[#2e3646] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1 border-b border-[#282f3d]">
                Modelos de Papel FreeNote
              </div>
              <div className="space-y-1">
                {PAPER_CONFIGS.map((cfg) => (
                  <button
                    key={cfg.id}
                    onClick={() => {
                      onChangePaperTemplate(cfg.id);
                      setShowPaperMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left ${
                      paperTemplate === cfg.id
                        ? 'bg-violet-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-[#242b38]'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{cfg.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[190px]">
                        {cfg.description}
                      </div>
                    </div>
                    {paperTemplate === cfg.id && <Check size={14} className="shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FreeNote Interactive Ruler Button */}
        <button
          id="ruler-toggle-btn"
          onClick={onToggleRuler}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
            showRuler
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-[#1a1f29] border-[#2d3444] text-slate-300 hover:bg-[#232a38]'
          }`}
          title="Régua Interativa FreeNote (Gire e trace linhas perfeitas)"
        >
          <Compass size={15} />
          <span className="hidden xl:inline">Régua</span>
        </button>

        {/* Symmetry Menu */}
        <div className="relative" ref={symmetryRef}>
          <button
            id="symmetry-menu-btn"
            onClick={() => setShowSymmetryMenu(!showSymmetryMenu)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
              symmetryMode !== 'none'
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-[#1a1f29] border-[#2d3444] text-slate-300 hover:bg-[#232a38]'
            }`}
            title="Simetria / Espelhamento em tempo real"
          >
            <SplitSquareVertical size={15} />
            <span className="hidden xl:inline">Simetria</span>
          </button>

          {showSymmetryMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#181d26] border border-[#2e3646] rounded-xl shadow-2xl p-1.5 z-50">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-[#282f3d] mb-1">
                Eixo de Simetria
              </div>
              {[
                { id: 'none', label: 'Desativada' },
                { id: 'vertical', label: 'Vertical (Espelho Y)' },
                { id: 'horizontal', label: 'Horizontal (Espelho X)' },
                { id: 'quad', label: '4 Quadrantes' },
                { id: 'radial', label: 'Radial Mandala (8 eixos)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onChangeSymmetryMode(m.id as SymmetryMode);
                    setShowSymmetryMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    symmetryMode === m.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-[#242b38]'
                  }`}
                >
                  <span>{m.label}</span>
                  {symmetryMode === m.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid toggle */}
        <button
          id="grid-toggle-btn"
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg border transition ${
            showGrid
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
              : 'bg-[#1a1f29] border-[#2d3444] text-slate-400 hover:bg-[#232a38] hover:text-slate-200'
          }`}
          title="Grade de Alinhamento / Guias"
        >
          <Grid3X3 size={16} />
        </button>

        {/* 2D Animation Timeline toggle */}
        <button
          id="animation-timeline-btn"
          onClick={onToggleAnimationTimeline}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
            showAnimationTimeline
              ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
              : 'bg-[#1a1f29] border-[#2d3444] text-slate-300 hover:bg-[#232a38]'
          }`}
          title="Animação 2D Quadro a Quadro (Timeline & Onion Skin)"
        >
          <Film size={15} />
          <span className="hidden lg:inline">Animação</span>
        </button>

        {/* Reference Image toggle */}
        <button
          id="reference-toggle-btn"
          onClick={onToggleReference}
          className={`p-1.5 rounded-lg border transition ${
            showReference
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
              : 'bg-[#1a1f29] border-[#2d3444] text-slate-400 hover:bg-[#232a38] hover:text-slate-200'
          }`}
          title="Janela Flutuante de Referência Visual"
        >
          <ImageIcon size={16} />
        </button>

        {/* Filters & Adjustments Modal */}
        <button
          id="filters-modal-btn"
          onClick={onOpenFilters}
          className="p-1.5 rounded-lg bg-[#1a1f29] border border-[#2d3444] text-slate-300 hover:bg-[#232a38] hover:text-slate-100 transition"
          title="Ajustes e Filtros de Imagem"
        >
          <Sliders size={16} />
        </button>

        {/* Fullscreen */}
        <button
          id="fullscreen-toggle-btn"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg bg-[#1a1f29] border border-[#2d3444] text-slate-400 hover:text-slate-200 hover:bg-[#232a38] transition hidden sm:block"
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            id="export-menu-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#181d26] border border-[#2e3646] rounded-xl shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-[#282f3d] mb-1">
                Exportar Arte / Projeto
              </div>
              <button
                onClick={() => {
                  onExport('png');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#242b38] transition flex items-center justify-between"
              >
                <span>Imagem PNG (Transparência)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                  Alta Res
                </span>
              </button>
              <button
                onClick={() => {
                  onExport('jpeg');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#242b38] transition flex items-center justify-between"
              >
                <span>Imagem JPEG (Com Fundo)</span>
                <span className="text-[10px] text-slate-400">Padrão</span>
              </button>
              <button
                onClick={() => {
                  onExport('webp');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#242b38] transition flex items-center justify-between"
              >
                <span>Imagem WebP (Compacta)</span>
                <span className="text-[10px] text-slate-400">Web</span>
              </button>
              <div className="my-1 border-t border-[#282f3d]" />
              <button
                onClick={() => {
                  onExport('json');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#242b38] transition flex items-center justify-between"
              >
                <span>Projeto FreeNote (.JSON)</span>
                <span className="text-[10px] bg-violet-950 text-violet-400 px-1.5 py-0.5 rounded border border-violet-800">
                  Camadas
                </span>
              </button>
              {showAnimationTimeline && (
                <button
                  onClick={() => {
                    onExport('video');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-pink-300 hover:bg-pink-950/40 transition flex items-center justify-between"
                >
                  <span>Gravar Animação (.WebM)</span>
                  <span className="text-[10px] bg-pink-900/50 text-pink-300 px-1.5 py-0.5 rounded">
                    Vídeo
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
