import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Clock,
  Search,
  Upload,
  Sparkles,
  FileText,
  X,
  Check,
  Smartphone,
  Monitor,
  Square
} from 'lucide-react';
import { ProjectMeta, PaperTemplate } from '../types';
import { CANVAS_PRESETS } from '../utils/constants';

interface GalleryModalProps {
  projects: ProjectMeta[];
  currentProjectId: string;
  onOpenProject: (id: string) => void;
  onCreateProject: (
    name: string,
    width: number,
    height: number,
    template: PaperTemplate,
    bgColor: string
  ) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onImportImageAsProject: (file: File) => void;
  onClose: () => void;
}

export function GalleryModal({
  projects,
  currentProjectId,
  onOpenProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onImportImageAsProject,
  onClose,
}: GalleryModalProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'new'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // New Project Form state
  const [newTitle, setNewTitle] = useState('Meu Desenho');
  const [selectedPresetId, setSelectedPresetId] = useState('freenote_a4');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [customTemplate, setCustomTemplate] = useState<PaperTemplate>('ruled');
  const [customBgColor, setCustomBgColor] = useState('#fafafa');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPresetId === 'custom') {
      onCreateProject(
        newTitle.trim() || 'Sem Título',
        customWidth,
        customHeight,
        customTemplate,
        customBgColor
      );
    } else {
      const preset = CANVAS_PRESETS.find((p) => p.id === selectedPresetId);
      if (preset) {
        onCreateProject(
          newTitle.trim() || preset.name,
          preset.width,
          preset.height,
          preset.template,
          preset.template === 'ruled' ? '#fafafa' : '#ffffff'
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#131720] border border-[#273042] rounded-3xl shadow-2xl max-w-4xl w-full h-[88vh] max-h-[850px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#232b3b] flex items-center justify-between bg-[#11141c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <FolderOpen size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>FreeNote Studio</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-violet-950/80 text-violet-300 border border-violet-800/80 px-2 py-0.5 rounded-full">
                  100% Gratuito
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Seus cadernos, ilustrações e pranchetas digitais salvos localmente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('new')}
              className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Novo Projeto</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#1e2535] rounded-xl transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-nav & Search */}
        <div className="px-6 py-2.5 border-b border-[#212836] bg-[#141924] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'recent'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2736]'
              }`}
            >
              Meus Projetos ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'new'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2736]'
              }`}
            >
              Criar Prancheta
            </button>
          </div>

          {activeTab === 'recent' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Pesquisar projetos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1b2230] border border-[#2b3548] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Import image file button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#1b2230] hover:bg-[#252e42] border border-[#2b3548] text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0"
                title="Abrir imagem externa como novo projeto"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">Importar Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImportImageAsProject(file);
                }}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recent' ? (
            /* Recent Projects Grid */
            filteredProjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-3xl bg-[#1b2130] border border-[#2b3548] flex items-center justify-center text-violet-400 mb-3 shadow-inner">
                  <FileText size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1">
                  Nenhum projeto encontrado
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Crie sua primeira prancheta ou caderno para começar a desenhar e fazer anotações.
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Criar Novo Projeto</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProjects.map((p) => {
                  const isCurrent = p.id === currentProjectId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className={`group relative rounded-2xl border transition overflow-hidden cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'border-violet-500 bg-[#1b2130] ring-1 ring-violet-500/50'
                          : 'border-[#262f3e] bg-[#151a24] hover:border-slate-500 hover:bg-[#1a202c]'
                      }`}
                    >
                      {/* Thumbnail frame */}
                      <div className="relative w-full h-40 bg-[#0d1017] checkerboard-pattern overflow-hidden flex items-center justify-center">
                        {p.thumbnail ? (
                          <img
                            src={p.thumbnail}
                            alt=""
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="text-slate-600 text-xs font-mono">Prévia Indisponível</div>
                        )}

                        {isCurrent && (
                          <div className="absolute top-2 left-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            Em Edição
                          </div>
                        )}
                      </div>

                      {/* Info & action buttons */}
                      <div className="p-3 bg-[#131720] border-t border-[#232b3b]">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-xs text-slate-100 truncate max-w-[170px]">
                            {p.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-[#1d2433] px-1.5 py-0.5 rounded">
                            {p.width}x{p.height}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onDuplicateProject(p.id)}
                              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#222b3b] rounded transition"
                              title="Duplicar Projeto"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => onDeleteProject(p.id)}
                              disabled={projects.length <= 1}
                              className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition disabled:opacity-30"
                              title="Excluir Projeto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* New Project Form */
            <form onSubmit={handleCreateSubmit} className="max-w-2xl mx-auto space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Projeto / Caderno
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Anotações de Biologia, Ilustração Manga..."
                  className="w-full bg-[#1b2230] border border-[#2c374a] rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Formatos Recomendados & FreeNote
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CANVAS_PRESETS.map((p) => {
                    const isSelected = selectedPresetId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPresetId(p.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-violet-600/20 border-violet-500 shadow-md ring-1 ring-violet-500/50'
                            : 'bg-[#181e2b]/80 border-[#263040] hover:bg-[#1e2536]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-100">{p.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                          <div className="text-[10px] font-mono text-violet-400 mt-1">
                            {p.width} × {p.height} px
                          </div>
                        </div>
                        {isSelected && <Check size={18} className="text-violet-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })}

                  {/* Custom Option */}
                  <div
                    onClick={() => setSelectedPresetId('custom')}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedPresetId === 'custom'
                        ? 'bg-violet-600/20 border-violet-500 shadow-md ring-1 ring-violet-500/50'
                        : 'bg-[#181e2b]/80 border-[#263040] hover:bg-[#1e2536]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-100">Personalizado</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Defina largura, altura e estilo de papel
                      </div>
                    </div>
                    {selectedPresetId === 'custom' && (
                      <Check size={18} className="text-violet-400 shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Dimensions if selected */}
              {selectedPresetId === 'custom' && (
                <div className="p-4 bg-[#181e2b] border border-[#293447] rounded-2xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium block mb-1">
                        Largura (px)
                      </label>
                      <input
                        type="number"
                        min="200"
                        max="4096"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-full bg-[#121620] border border-[#2b3548] rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium block mb-1">
                        Altura (px)
                      </label>
                      <input
                        type="number"
                        min="200"
                        max="4096"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="w-full bg-[#121620] border border-[#2b3548] rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Padrão de Folha
                    </label>
                    <select
                      value={customTemplate}
                      onChange={(e) => setCustomTemplate(e.target.value as PaperTemplate)}
                      className="w-full bg-[#121620] border border-[#2b3548] rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="ruled">Caderno Pautado FreeNote</option>
                      <option value="blank">Branco Liso</option>
                      <option value="grid">Quadriculado Técnico</option>
                      <option value="dot">Pontilhado Bullet Journal</option>
                      <option value="isometric">Isométrico 3D</option>
                      <option value="parchment">Papel Pergaminho Antigo</option>
                      <option value="dark_ruled">Caderno Noturno Escuro</option>
                      <option value="transparent">Transparente (Sem fundo)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('recent')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#1e2536] transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Criar e Abrir Prancheta</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
