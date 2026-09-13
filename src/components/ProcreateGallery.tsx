import React, { useState } from 'react';
import { Plus, Image as ImageIcon, FileUp, MoreVertical, Check, ArrowRight } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  dimensions: string;
  updatedAt: string;
  previewUrl?: string;
}

interface ProcreateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  currentArtworkName: string;
  currentArtworkPreview?: string;
  onSelectArtwork: (id: string) => void;
  onCreateNewCanvas: (preset: { name: string; width: number; height: number }) => void;
}

const CANVAS_PRESETS = [
  { name: 'Quadrado (2048 × 2048 px)', width: 2048, height: 2048 },
  { name: 'Tela 4K (3840 × 2160 px)', width: 3840, height: 2160 },
  { name: 'Papel A4 (2480 × 3508 px)', width: 2480, height: 3508 },
  { name: 'Caderno FreeNote (1920 × 1080 px)', width: 1920, height: 1080 },
  { name: 'Instagram Story (1080 × 1920 px)', width: 1080, height: 1920 },
];

export function ProcreateGallery({
  isOpen,
  onClose,
  currentArtworkName,
  currentArtworkPreview,
  onSelectArtwork,
  onCreateNewCanvas,
}: ProcreateGalleryProps) {
  const [showNewModal, setShowNewModal] = useState(false);

  // Simulated gallery items with current artwork as item 0
  const artworks: Artwork[] = [
    {
      id: 'current',
      title: currentArtworkName,
      dimensions: '2048 × 2048 px',
      updatedAt: 'Agora mesmo',
      previewUrl: currentArtworkPreview,
    },
    {
      id: 'demo-1',
      title: 'Esboço de Retrato',
      dimensions: '2048 × 2048 px',
      updatedAt: 'Ontem às 18:40',
    },
    {
      id: 'demo-2',
      title: 'Estudo de Paisagem Cyberpunk',
      dimensions: '3840 × 2160 px',
      updatedAt: '3 dias atrás',
    },
    {
      id: 'demo-3',
      title: 'Caderno de Anotações FreeNote',
      dimensions: '1920 × 1080 px',
      updatedAt: 'Semana passada',
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="procreate-gallery"
      className="fixed inset-0 z-50 bg-[#0f1115] flex flex-col select-none text-slate-200 animate-in fade-in duration-200"
    >
      {/* Gallery Header */}
      <div className="h-16 border-b border-[#212530] px-6 flex items-center justify-between bg-[#14161d]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            Procreate
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#202532] text-slate-400 font-mono">
            Galeria
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Novo Canvas</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#202532] hover:bg-[#2c3343] text-slate-200 text-xs font-semibold transition"
          >
            Voltar para a Tela
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((art) => {
              const isCurrent = art.id === 'current';
              return (
                <div
                  key={art.id}
                  onClick={() => {
                    if (isCurrent) {
                      onClose();
                    } else {
                      onSelectArtwork(art.id);
                      onClose();
                    }
                  }}
                  className="group bg-[#161820] border border-[#252a36] hover:border-sky-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-[#0c0d11] relative overflow-hidden flex items-center justify-center p-4">
                    {art.previewUrl ? (
                      <img
                        src={art.previewUrl}
                        alt={art.title}
                        className="w-full h-full object-contain rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full border border-dashed border-[#292f3d] rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2">
                        <ImageIcon size={32} />
                        <span className="text-xs">Arte Digital</span>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow">
                        Aberta
                      </div>
                    )}
                  </div>

                  {/* Info Footer */}
                  <div className="p-4 bg-[#14161d] border-t border-[#232734] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-sky-400 transition truncate max-w-[170px]">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {art.dimensions} • {art.updatedAt}
                      </p>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-slate-500 group-hover:text-sky-400 transition -translate-x-1 group-hover:translate-x-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Canvas Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161820] border border-[#2d3342] rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Novo Canvas Procreate</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    onCreateNewCanvas(p);
                    setShowNewModal(false);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-[#1d212b] hover:bg-[#252a36] border border-[#2c3240] hover:border-sky-500/50 flex items-center justify-between text-left transition"
                >
                  <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                  <span className="text-[11px] font-mono text-sky-400">Criar</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
