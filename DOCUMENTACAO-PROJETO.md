# DOCUMENTAÇÃO TÉCNICA E ARQUITETURAL DO PROJETO
**FreeNote Studio - Procreate Web & Caderno Digital**

> ⚠️ **DIRETIVA OBRIGATÓRIA PARA A INTELIGÊNCIA ARTIFICIAL:**
> Antes de executar **qualquer alteração** no código ou adicionar qualquer funcionalidade:
> 1. Você **DEVE LER** este arquivo (`DOCUMENTACAO-PROJETO.md`) para compreender o estado real da aplicação, a organização dos módulos e os padrões técnicos adotados.
> 2. **NUNCA** faça suposições sobre arquivos existentes ou comportamentos sem consultar este documento e os arquivos de código.
> 3. Ao finalizar **qualquer alteração**, você **DEVE ATUALIZAR** este arquivo na seção **Histórico de Alterações (Changelog)** e revisar as seções correspondentes caso novos módulos ou fluxos tenham sido criados.

---

## 1. Visão Geral do Projeto

O **FreeNote Studio** é uma aplicação web progressiva de pintura digital, ilustração e caderno de anotações inspirada na experiência minimalista, tátil e focada em gestos do **Apple Procreate**, combinada com os recursos práticos de produtividade do **FreeNote** (papéis pautados, quadriculados, isométricos, guias de simetria, régua e animação quadro a quadro).

### Pilares Fundamentais:
- **Interface Fiel ao Procreate**: Barra superior minimalista, barra lateral com sliders verticais de pílula (tamanho e opacidade), botão modificador quadrado central, gestos multitoque e menus flutuantes.
- **Desenho Suave e Preciso**: Motor baseado em HTML5 Canvas com interpolação Bézier, sensibilidade à pressão (Pointers e Stylus/Apple Pencil), estabilização dinâmica (*Streamline*) e detecção de formas rápidas (*QuickShape*).
- **ColorDrop Intuitivo**: Arrastar a cor ativa do círculo superior e soltar no desenho para preencher formas instantaneamente (Flood Fill).
- **Persistência Completa**: Sistema de armazenamento assíncrono via IndexedDB/LocalStorage para gerenciar múltiplos projetos, camadas completas, metadados e miniaturas na Galeria.

---

## 2. Stack Tecnológica

- **Frontend**: React 19 (`react`, `react-dom`)
- **Linguagem**: TypeScript 5.8
- **Estilização**: Tailwind CSS v4 (`@tailwindcss/vite`), classes utilitárias modernas
- **Ícones**: `lucide-react` (ícones oficiais padronizados)
- **Animações e Transições**: `motion` (`motion/react`)
- **Bundler & Dev Server**: Vite 6 configurado na porta 3000 (`0.0.0.0`)
- **Renderização Gráfica**: HTML5 2D Canvas multicamadas com otimização por memória virtual

---

## 3. Estrutura de Diretórios e Arquivos

```
/
├── index.html                   # Entry-point HTML com viewport mobile/touch-friendly e Google Fonts
├── metadata.json                # Metadados do app para o ambiente AI Studio
├── package.json                 # Dependências e scripts de execução
├── tsconfig.json                # Configuração do compilador TypeScript
├── vite.config.ts               # Configuração do Vite com Tailwind CSS e React plugins
├── DOCUMENTACAO-PROJETO.md      # Este documento mestre (leitura obrigatória)
├── AGENTS.md                    # Instruções persistentes injetadas no agente AI
├── src/
│   ├── main.tsx                 # Ponto de montagem React
│   ├── App.tsx                  # Componente orquestrador central e gerenciador de estado
│   ├── index.css                # Importação do Tailwind CSS e regras globais
│   ├── types.ts                 # Definições centrais de tipos e interfaces TypeScript
│   ├── components/              # Componentes de interface e overlays
│   │   ├── CanvasViewport.tsx           # Viewport principal com suporte a gestos, zoom e desenho
│   │   ├── ProcreateHeader.tsx          # Barra de topo estilo Procreate
│   │   ├── ProcreateSidebar.tsx         # Barra lateral flutuante com sliders verticais
│   │   ├── ProcreateBrushLibrary.tsx    # Biblioteca de pincéis por categoria
│   │   ├── ProcreateColorPicker.tsx     # Seletor de cores com 5 modos (Disco, Harmonia, etc.)
│   │   ├── ProcreateLayersPanel.tsx     # Painel flutuante de camadas
│   │   ├── ProcreateActionsMenu.tsx     # Menu de Ações (Chave inglesa)
│   │   ├── ProcreateAdjustmentsMenu.tsx # Menu de Ajustes (Varinha mágica)
│   │   ├── ProcreateQuickMenu.tsx       # Menu radial com 6 atalhos rápidos
│   │   ├── ProcreateSelectionBar.tsx    # Barra contextual inferior de seleção
│   │   ├── ProcreateTransformBar.tsx    # Barra contextual de transformação/rotação
│   │   ├── ProcreateAnimationAssist.tsx # Painel inferior de Assistente de Animação
│   │   ├── ProcreateReferenceWindow.tsx # Janela flutuante Picture-in-Picture de referência
│   │   ├── ProcreateGallery.tsx         # Modal de Galeria de obras e novos formatos
│   │   ├── FreeNoteRuler.tsx            # Ferramenta de régua interativa FreeNote
│   │   └── Toolbar.tsx                  # Barra de suporte auxiliar
│   └── utils/                   # Motores lógicos e utilitários
│       ├── drawingEngine.ts     # Traçado, Bézier, sensibilidade, Flood Fill (ColorDrop)
│       ├── filterEngine.ts      # Filtros de imagem (brilho, contraste, desfoque, ruído, etc.)
│       ├── paperRenderer.ts     # Renderizador de texturas e padrões de papel FreeNote
│       ├── storage.ts           # Gerenciamento de projetos no IndexedDB / LocalStorage
│       └── constants.ts         # Presets de pincéis Procreate e presets de telas
```

---

## 4. Arquitetura e Módulos Principais

### 4.1. Orquestrador Central (`src/App.tsx`)
Responsável pelo estado global da aplicação:
- **Camadas (`layers`)**: Array de objetos `Layer` em memória, cada qual contendo sua própria instância de `HTMLCanvasElement` e `CanvasRenderingContext2D`.
- **Ferramentas Ativas (`currentTool`, `activeBrushId`)**: Alternância entre Pincel (`brush`), Dedo/Esfuminho (`smudge`), Borracha (`eraser`), Seleção (`select`), Transformação (`transform`), Texto (`text`) e Conta-gotas (`eyedropper`).
- **Histórico (Undo / Redo)**: Pilhas de snapshots em string (DataURL da camada ativa) com suporte a atalhos de teclado (`Ctrl+Z`, `Ctrl+Shift+Z`) e gestos de toque.
- **Persistência**: Salvamento automático através de `saveProject(ProjectData)` sempre que traços ou modificações estruturais são concluídos.
- **ColorDrop**: Manipulador `handleColorDrop(clientX, clientY)` que calcula a projeção matemática de coordenadas do viewport para a resolução nativa do canvas e executa o `floodFill`.

### 4.2. Viewport e Motor Gráfico (`src/components/CanvasViewport.tsx`)
O coração visual e interativo da aplicação:
- **Stack de Renderização**:
  1. *Fundo de Papel*: Renderizado com `paperRenderer.ts` (liso, pautado, quadriculado, pontilhado, isométrico, pergaminho).
  2. *Camadas do Usuário*: Iteradas respeitando opacidade (`opacity`) e modo de mesclagem (`blendMode`).
  3. *Onion-Skinning (Animação)*: Quadros anteriores e posteriores translúcidos quando o Assistente de Animação estiver ativo.
  4. *Camada de Pré-visualização (`previewCanvas`)*: Onde o traço atual é desenhado em tempo real antes de ser consolidado na camada ativa.
- **Gestos Multitoque**:
  - Toque com **2 dedos rápido**: Desfazer (*Undo*).
  - Toque com **3 dedos rápido**: Refazer (*Redo*).
  - Toque com **4 dedos**: Alternar Modo Zen / Tela cheia.
  - Pinça com **2 dedos contínua**: Zoom suave (escala 0.1x a 10x) e pan de deslocamento.
- **QuickShape**: Ao desenhar uma linha reta, círculo ou retângulo e manter o ponteiro parado por mais de 450ms, o traço bruto é substituído pela forma geométrica vetorizada correspondente, exibindo notificação no topo.
- **Simetria em Tempo Real**: Suporte a eixos vertical, horizontal, quádruplo e radial.

### 4.3. Barra Superior (`src/components/ProcreateHeader.tsx`)
Interface minimalista superior:
- **Esquerda**: Botão "Galeria" para retornar aos projetos, botão de Ações (chave inglesa), Ajustes (varinha mágica), Seleção (fita em S) e Transformação (seta de vetor).
- **Centro**: Nome do projeto editável inline, acompanhado por badges contextuais (notificação de QuickShape e slider de ajuste ativo).
- **Direita**: Pincel, Esfuminho, Borracha, Camadas e o Círculo de Cor com histórico da cor anterior.
- **ColorDrop Origin**: O círculo de cor atua como ponto de arrasto para o ColorDrop.

### 4.4. Barra Lateral Estilo Procreate (`src/components/ProcreateSidebar.tsx`)
- Sliders verticais táteis de pílula para ajuste contínuo de **Tamanho** e **Opacidade** do pincel.
- Botão quadrado central modificador para acionar o **QuickMenu Radial** ou o Conta-gotas.
- Botões inferiores rápidos de Desfazer e Refazer.
- Suporte a modo canhoto (posiciona a barra no lado direito da tela).

### 4.5. Sistema de Cores (`src/components/ProcreateColorPicker.tsx`)
Oferece 5 modos de trabalho:
1. **Disco**: Roda cromática externa com triângulo/quadrado de saturação e brilho interno.
2. **Clássico**: Painel retangular de saturação/brilho com sliders de matiz.
3. **Harmonia**: Roda de cores com esquemas complementares, análogos e triádicos.
4. **Valores**: Entradas numéricas precisas para RGB, HSB e código Hexadecimal.
5. **Paletas**: Paletas predefinidas e salvamento de novas amostras de cor.

### 4.6. Camadas e Composição (`src/components/ProcreateLayersPanel.tsx`)
- Adição, exclusão, duplicação e mesclagem para baixo (*Merge Down*).
- Miniaturas dinâmicas atualizadas após cada traço.
- Modos de mesclagem completos (`source-over`, `multiply`, `screen`, `overlay`, etc.).
- Bloqueio de edição e **Alpha Lock** (permite pintar exclusivamente sobre os pixels já existentes na camada).
- Seleção da cor de fundo da tela.

### 4.7. Motor de Armazenamento (`src/utils/storage.ts`)
- Utiliza **IndexedDB** como armazenamento prioritário com fallback para **LocalStorage**.
- Serialização de camadas em DataURL PNG de alta fidelidade.
- Presets padrão: Quadrado (2048x2048), 4K UHD, Papel A4, Papel Carta e Story (9:16).

---

## 5. Como Estender e Adicionar Funcionalidades

Quando o usuário solicitar novas funcionalidades, siga as regras abaixo:
1. **Verificar dependências**: Antes de importar novos pacotes, verifique o `package.json`. Se necessário, utilize as ferramentas apropriadas do ambiente.
2. **Respeitar o Design Procreate**: Mantenha a identidade visual minimalista, escura (`#0a0c10`, `#181b22`, `#262a34`), sem elementos excessivos e sem quebrar a ergonomia para telas sensíveis ao toque.
3. **Desempenho no Canvas**: Operações que manipulam pixels (`getImageData`, `putImageData`) devem ser executadas em canvases isolados e somente quando estritamente necessário.
4. **Tipagem Estrita**: Adicione ou atualize sempre as interfaces correspondentes em `src/types.ts`.
5. **Atualização do Documento**: Registre toda e qualquer adição na seção de Changelog abaixo.

---

## 6. Histórico de Alterações (Changelog)

### [2026-09-13] - Criação da Documentação Mestre e Arquitetura Procreate Completa
- **Documentação do Projeto**: Criação deste arquivo `DOCUMENTACAO-PROJETO.md` para guiar todas as interações e desenvolvimentos futuros da IA.
- **Configuração de Agente**: Criação do arquivo `AGENTS.md` para instruir o sistema da IA a sempre carregar este documento antes de agir e atualizá-lo ao terminar.
- **Interface Procreate 1:1**:
  - Implantação do `ProcreateHeader` com ferramentas de Galeria, Ações, Ajustes, Seleção, Transformação, Pincel, Dedo, Borracha, Camadas e Cor.
  - Implantação do `ProcreateSidebar` com sliders de pílula para tamanho e opacidade, botão modificador quadrado, atalhos de Undo/Redo e suporte a modo canhoto.
  - Implantação do `ProcreateColorPicker` completo com 5 abas de seleção de cor.
  - Implantação da biblioteca `ProcreateBrushLibrary` com categorias de pincéis, sliders de textura e streamline.
  - Implantação do painel `ProcreateLayersPanel` com suporte a Alpha Lock, mesclagem e miniaturas.
  - Implantação de ColorDrop com arrastar e soltar do círculo de cor para preenchimento com Flood Fill.
  - Suporte a gestos multitoque (2 dedos: Undo, 3 dedos: Redo, 4 dedos: Modo Zen, pinça para zoom e pan contínuo).
  - Reconhecimento de formas automáticas com *QuickShape*.
  - Menus flutuantes contextuais: `ProcreateActionsMenu`, `ProcreateAdjustmentsMenu`, `ProcreateQuickMenu`, `ProcreateSelectionBar`, `ProcreateTransformBar`, `ProcreateAnimationAssist`, `ProcreateReferenceWindow` e `ProcreateGallery`.
