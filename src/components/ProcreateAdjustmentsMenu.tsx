import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Eye,
  Activity,
  Flame,
  Zap,
  Grid,
  Droplet,
  Waves,
  Sliders,
  X
} from 'lucide-react';

interface ProcreateAdjustmentsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAdjustment: (adjustmentId: string) => void;
}

const ADJUSTMENTS = [
  {
    id: 'curves',
    name: 'Curvas Tonal RGB',
    icon: Activity,
    desc: 'Controle preciso de histograma e curvas gama',
  },
  {
    id: 'color_balance',
    name: 'Balanço de Cores',
    icon: Sliders,
    desc: 'Ciano/Vermelho, Magenta/Verde, Amarelo/Azul',
  },
  {
    id: 'gradient_map',
    name: 'Mapeamento de Gradiente',
    icon: Sparkles,
    desc: 'Remapear luminâncias com paletas de gradiente',
  },
  {
    id: 'hsl',
    name: 'Matiz, Saturação e Brilho',
    icon: Sliders,
    desc: 'Equilíbrio tonal e intensidade cromática',
  },
  {
    id: 'gaussian',
    name: 'Desfoque Gaussiano',
    icon: Droplet,
    desc: 'Suavização difusa com slider no topo da tela',
  },
  {
    id: 'motion_blur',
    name: 'Desfoque de Movimento',
    icon: Waves,
    desc: 'Efeito cinético direcional linear',
  },
  {
    id: 'noise',
    name: 'Ruído',
    icon: Activity,
    desc: 'Granulado orgânico analógico',
  },
  {
    id: 'sharpen',
    name: 'Nitidez',
    icon: Eye,
    desc: 'Realce de bordas e detalhes microscópicos',
  },
  {
    id: 'bloom',
    name: 'Florescer (Bloom)',
    icon: Flame,
    desc: 'Difusão luminosa quente para luzes intensas',
  },
  {
    id: 'glitch',
    name: 'Falha Técnica (Glitch)',
    icon: Zap,
    desc: 'Distorção cromática digital VHS retrô',
  },
  {
    id: 'halftone',
    name: 'Meio-tom',
    icon: Grid,
    desc: 'Reticulado de impressão vintage e manga',
  },
  {
    id: 'liquify',
    name: 'Dissolver (Liquify)',
    icon: Sparkles,
    desc: 'Empurrar, rodopiar, expandir e encolher formas',
  },
  {
    id: 'invert',
    name: 'Inverter Cores',
    icon: Sun,
    desc: 'Inversão cromática instantânea dos canais RGB',
  },
];

export function ProcreateAdjustmentsMenu({
  isOpen,
  onClose,
  onSelectAdjustment,
}: ProcreateAdjustmentsMenuProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#adjustments-magic-wand-btn')
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
      id="procreate-adjustments-popover"
      className="fixed top-14 left-4 sm:left-24 w-[290px] sm:w-[320px] bg-[#16181d]/95 backdrop-blur-xl border border-[#2b2f3a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none text-slate-200"
    >
      <div className="h-11 border-b border-[#252934] px-4 flex items-center justify-between shrink-0 bg-[#121418]/60">
        <span className="text-xs font-semibold text-white tracking-wide">Ajustes</span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white transition"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-2 space-y-1 max-h-[440px] overflow-y-auto">
        {ADJUSTMENTS.map((adj) => {
          const Icon = adj.icon;
          return (
            <button
              key={adj.id}
              onClick={() => {
                onSelectAdjustment(adj.id);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#191d26]/80 hover:bg-[#222734] transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#121418] border border-[#262b37] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-500/40 transition shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {adj.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {adj.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
