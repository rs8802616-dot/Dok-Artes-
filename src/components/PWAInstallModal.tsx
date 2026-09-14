import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Share,
  PlusSquare,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Palette
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isTablet, isMobile, isDesktop, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="pwa-install-modal-card"
        className="w-full max-w-lg bg-[#14161c] border border-[#262b38] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-[#eef2f6]"
      >
        {/* Header with gradient banner */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#222736] bg-gradient-to-b from-[#1c202a] to-[#14161c]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252a38] transition"
            title="Fechar"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#121418] rounded-[10px] flex items-center justify-center">
                <Palette size={24} className="text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Baixar FreeNote Studio
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  App Nativo / PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instale no seu Celular, Tablet (iPad / Android) ou Computador
              </p>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Target devices pill bar */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`flex flex-col items-center p-3 rounded-xl border transition ${
                isTablet
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-[#181b24] border-[#262c3b] text-slate-400'
              }`}
            >
              <Tablet size={22} className="mb-1 text-cyan-400" />
              <span className="text-xs font-semibold">Tablet</span>
              <span className="text-[10px] text-slate-400">iPad & Android</span>
            </div>

            <div
              className={`flex flex-col items-center p-3 rounded-xl border transition ${
                isMobile
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-[#181b24] border-[#262c3b] text-slate-400'
              }`}
            >
              <Smartphone size={22} className="mb-1 text-blue-400" />
              <span className="text-xs font-semibold">Celular</span>
              <span className="text-[10px] text-slate-400">iPhone & Android</span>
            </div>

            <div
              className={`flex flex-col items-center p-3 rounded-xl border transition ${
                isDesktop
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-[#181b24] border-[#262c3b] text-slate-400'
              }`}
            >
              <Monitor size={22} className="mb-1 text-fuchsia-400" />
              <span className="text-xs font-semibold">PC & Mac</span>
              <span className="text-[10px] text-slate-400">Chrome & Edge</span>
            </div>
          </div>

          {/* Value highlights */}
          <div className="bg-[#181b24]/70 border border-[#232838] rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Vantagens de instalar o aplicativo:
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 pl-5 list-disc marker:text-cyan-400">
              <li>
                <strong className="text-slate-200">Tela cheia sem barras do navegador:</strong> layout 1:1 idêntico ao Procreate original no tablet.
              </li>
              <li>
                <strong className="text-slate-200">Apple Pencil e Stylus de alta precisão:</strong> latência mínima e resposta a pressão sem interferência de zoom do navegador.
              </li>
              <li>
                <strong className="text-slate-200">Funciona Offline:</strong> crie ilustrações e anotações a qualquer momento, mesmo sem internet.
              </li>
            </ul>
          </div>

          {/* Installation Instructions / Buttons */}
          {installedSuccess || isInstalled ? (
            <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 text-emerald-300">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Aplicativo já instalado!</p>
                <p className="text-xs text-emerald-400/80">
                  O FreeNote Studio já está pronto na sua tela inicial para ser aberto como app nativo.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            /* Chromium 1-click install (Android, PC, Tablet) */
            <div className="space-y-3">
              <button
                id="pwa-direct-install-btn"
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                <Download size={18} />
                {installing ? 'Instalando...' : 'Instalar Aplicativo Agora'}
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Instalação instantânea pelo navegador Chrome, Edge ou Brave.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS / iPadOS Safari Guide */
            <div className="bg-[#181b24] border border-[#2b3142] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Tablet size={16} className="text-cyan-400" />
                Como instalar no iPad ou iPhone (Safari):
              </div>
              <ol className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Toque no botão de <strong>Compartilhar</strong>{' '}
                    <Share size={14} className="inline mx-1 text-sky-400" /> na barra do Safari (no topo do iPad ou na base do iPhone).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Role as opções para baixo e selecione{' '}
                    <strong className="text-white">"Adicionar à Tela de Início"</strong>{' '}
                    <PlusSquare size={14} className="inline mx-1 text-slate-300" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Toque em <strong className="text-cyan-400">"Adicionar"</strong> no canto superior direito. O ícone aparecerá junto aos seus outros apps!
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            /* Desktop / Other browsers guide */
            <div className="bg-[#181b24] border border-[#2b3142] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Download size={15} className="text-cyan-400" />
                  Instalar via Navegador
                </span>
                <button
                  onClick={handleOpenNewTab}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Abrir em nova aba <ExternalLink size={12} />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                No Chrome ou Edge, clique no ícone de <strong>Instalar</strong> <Download size={12} className="inline text-slate-300" /> localizado no lado direito da barra de endereços (URL), ou acesse o menu <strong>(⋯) &gt; Transmitir, Salvar e Compartilhar &gt; Instalar FreeNote Studio</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#111317] border-t border-[#202430] flex items-center justify-between text-xs text-slate-500">
          <span>Versão 1.2 Procreate Edition</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1e2330] text-slate-300 hover:text-white transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
