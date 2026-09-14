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
│   │   ├── ProcreateBrushStudio.tsx     # Estúdio avançado de pincéis (150+ parâmetros e scratchpad)
│   │   ├── ProcreateAdjustmentModal.tsx # Ajustes avançados (Curvas RGB, Equilíbrio de Cores, Mapa de Gradiente, etc.)
│   │   ├── Procreate3DViewer.tsx        # Estúdio 3D com Three.js para pintura em malhas e iluminação
│   │   ├── ProcreateTimelapseModal.tsx  # Reprodutor interativo de replay Time-lapse com scrubbing
│   │   ├── ProcreateMiniPalette.tsx     # Paleta compacta flutuante desacoplável com amostras rápidas
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
- **QuickShape Fiel ao Procreate**:
  - Ao desenhar uma forma à mão livre (círculo, elipse, retângulo, quadrado, triângulo ou linha) e manter o ponteiro parado por mais de 450ms, o QuickShape é ativado instantaneamente.
  - **Substituição Limpa do Traço Torto**: O motor restaura a camada a partir de um snapshot pré-traço em memória (`preStrokeCanvasRef`), eliminando 100% dos resíduos do traço irregular antes de desenhar a forma geométrica limpa.
  - **Redimensionamento e Rotação Dinâmica**: Enquanto o usuário mantém o toque ou a caneta pressionada após o snap, mover a ponta redimensiona a forma geometricamente (raio do círculo a partir do centro, proporção do quadrado ou orientação da linha reta com snap magnético a ângulos de 45° e 90°).
  - **Barra Flutuante de Edição de Forma**: Ao finalizar a forma, surge a notificação com o botão *"Editar Forma"*, permitindo alternar entre variações geométricas (ex: *Círculo Perfeito* vs *Elipse*, *Quadrado Perfeito* vs *Retângulo*).
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
- **Máscara de Recorte (Clipping Mask)**: Permite restringir o conteúdo visual de uma camada aos limites da camada inferior.
- **Inversão e Cópia de Camada**: Ações rápidas acessíveis diretamente pelas opções contextuais da camada.
- Seleção da cor de fundo da tela.

### 4.7. Estúdio Avançado de Pincéis (`src/components/ProcreateBrushStudio.tsx`)
- Configuração paramétrica completa de pincéis inspirada no Brush Studio do Procreate:
  - Propriedades de traçado (*Stroke path*): espaçamento (*spacing*), estabilização (*streamline*), jitter e falloff.
  - Forma (*Shape*) e Grão (*Grain*): rotação, dispersão (*scatter*), escala e profundidade do grão.
  - Dinâmica e Pressão: modulação de tamanho, opacidade e fluxo conforme a velocidade e pressão da caneta/stylus.
  - Bloco de desenho interativo (*Drawing Pad/Scratchpad*) para testar e limpar os traços em tempo real com botão de reset para configurações originais.

### 4.8. Ajustes Profissionais e Filtros (`src/components/ProcreateAdjustmentModal.tsx` & `src/utils/filterEngine.ts`)
- **Curvas Tonais RGB**: Controle de curvatura de luminância com manipulação de ponto médio e mapeamento de LUT de 256 níveis.
- **Equilíbrio de Cores**: Ajuste tricolor simultâneo (Ciano/Vermelho, Magenta/Verde, Amarelo/Azul).
- **Mapa de Gradiente**: Presets cromáticos selecionáveis (Sunset, Neon, Vintage, Noir e Cyber) mapeando faixas de luminância para paletas ricas.
- **Efeitos de Imagem**: Ruído gaussiano procedural (*Noise*), Nitidez convolutiva (*Sharpen*), Desfoque de movimento, Bloom e Desfoque Gaussiano com slider interativo em tempo real.

### 4.9. Estúdio 3D e Pintura de Malhas (`src/components/Procreate3DViewer.tsx`)
- Renderizador WebGL baseado em Three.js integrado diretamente ao ecossistema do app.
- Aplicação instantânea da arte 2D desenhada no canvas como textura UV projetada sobre modelos tridimensionais (Busto, Esfera, Caneca, Cubo, Skate).
- Quatro presets de iluminação realista (Estúdio, Luz Solar, Neon e Noturna), rotação automática e captura de render em alta resolução.

### 4.10. Repetidor Time-lapse Interativo (`src/components/ProcreateTimelapseModal.tsx`)
- Captura de snapshots a cada traço consolidado no desenho.
- Player interativo com reprodução/pausa, scrubbing temporal na timeline, indicador de quadros e opção de exportação do vídeo do processo artístico.

### 4.11. Paleta de Cores Mini Flutuante (`src/components/ProcreateMiniPalette.tsx`)
- Mini paleta flutuante desacoplável do Color Picker que pode ser mantida sobre o viewport para acesso imediato a cores recentes e amostras favoritas durante a ilustração.

### 4.12. Motor de Armazenamento (`src/utils/storage.ts`)
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

### [2026-09-14] - Auditoria de Recursos Procreate e Conexão de Filtros de Ajuste Avançados
- **Auditoria Comparativa Fiel ao Procreate**:
  - Verificação completa de todos os 10 módulos centrais do Procreate (Canvas, Pincéis, Camadas, Cores, Seleção, Transformação, Ajustes, Vídeo, Animação e 3D).
- **Conexão de Filtros de Ajustes no Motor Gráfico**:
  - Implementação e ligação direta no `filterEngine.ts` e `ProcreateAdjustmentModal.tsx` de:
    - *Desfoque de Movimento* (`applyMotionBlur`): Desfoque cinético linear direcional multipasse.
    - *Florescer / Bloom* (`applyBloom`): Difusão de altas luzes em modo `screen`.
    - *Glitch / Falha Técnica* (`applyGlitch`): Deslocamento de canais RGB cromático e linhas horizontais de interferência VHS.
    - *Meio-tom / Halftone* (`applyHalftone`): Reticulado pontilhado estilo serigrafia vintage e retículas de mangá.
- **Transparência Técnica de Limitações Web vs Nativo iPadOS**:
  - Mapeadas as diferenças inerentes a um aplicativo web PWA em relação ao app nativo de iPadOS da Apple (Valkyrie Engine em Metal vs Canvas 2D/WebGL, arquivos proprietários `.brushset` e árvore aninhada de pastas de camadas).

### [2026-09-14] - Suporte Completo a PWA (Instalar no Tablet, Celular e PC) e Fidelidade Ergonômica Procreate para Tablet
- **Instalação PWA Nativa (Celular, Tablet e PC)**:
  - Integração do `vite-plugin-pwa` no `vite.config.ts` com cache offline via Service Worker, manifesto de aplicativo (`manifest.webmanifest`) com orientação `landscape-primary`, display `standalone` e tema Procreate `#0a0c10`.
  - Geração de pacote completo de ícones PWA (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png` e `icon.svg`).
  - Criação do hook `usePWAInstall` com detecção inteligente de plataforma (iOS/iPadOS vs Android vs Desktop/Chrome) e captura do evento `beforeinstallprompt`.
  - Criação do componente `PWAInstallModal.tsx` com guia passo a passo ilustrado para instalar no iPad/iPhone (Compartilhar -> Adicionar à Tela de Início), Android e Computador (botão Instalar direto no navegador).
  - Adicionado botão "Baixar App" no `ProcreateHeader` e opções dedicadas nas abas de Compartilhar e Preferências do `ProcreateActionsMenu`.
- **Fidelidade Ergonômica de Tablet (Procreate iPadOS 1:1)**:
  - **Rejeição de Palma Inteligente (Palm Rejection)**: Detecção do tipo de ponteiro (`pointerType === 'pen'`) no `CanvasViewport.tsx`, bloqueando toques acidentais da mão e repouso de palma sobre a tela do tablet durante a pintura com caneta stylus/Apple Pencil.
  - **Barra Lateral Ajustável Verticalmente**: O botão modificador do `ProcreateSidebar` agora permite arrastar a barra para cima ou para baixo para ajustar ergonomicamente à altura do polegar do usuário no tablet.
  - **Alvos de Toque Aprimorados**: Aumento das dimensões dos controles da barra lateral (`w-10 sm:w-11`, sliders `h-38 sm:h-44`, botões `10x10 / 11x11`), permitindo toque preciso com dedos ou caneta.
  - **HUD de Gestos na Tela**: Notificação flutuante elegante ao acionar gestos com 2 dedos (Desfazer), 3 dedos (Refazer) e 4 dedos (Modo Cinema).

### [2026-09-14] - Correção de Detecção Quadrado vs Círculo e Otimização Extrema de Renderização (Anti-Lag)
- **Correção da Detecção de Quadrado (QuickShape)**:
  - Implementado classificador geométrico com análise de cantos vivos (*sharp corners*, detecção de 4 quebras de direção tangencial de ~90°) e proximidade com os 4 vértices do bounding box.
  - Corrigida falha onde a baixa variância radial de um quadrado era erroneamente interpretada como círculo. Agora, um quadrado é detectado com precisão como `square` e retângulos como `rect`. Círculos e elipses são acionados apenas para contornos suaves sem vértices ortogonais.
- **Otimização de Renderização e Eliminação de Travamentos (Latência Zero da Caneta)**:
  - **Compositing via `requestAnimationFrame`**: A renderização das camadas (`compositeLayers`) durante o desenho foi convertida para um scheduler via RAF (`requestComposite`), limitando a taxa ao display (60/120Hz) e evitando o congelamento da fila de eventos de ponteiro (*pen lag*).
  - **Reutilização de Canvas de Clipping**: Substituída a alocação contínua de canvas de 2048x2048 por uma referência em memória (`clipCanvasRef`), eliminando pausas por Garbage Collection.
  - **Auto-save Desacoplado e Debounced**: O salvamento no IndexedDB (`persistCurrentProject`), que convertia todas as camadas em strings PNG síncronas a cada final de traço, agora opera com debounce de 1500ms.
  - **Time-lapse Assíncrono com Miniatura**: Captura de snapshots do time-lapse agora processa em background sobre miniatura de 320x320, liberando instantaneamente o ciclo de desenho para o próximo traço.

### [2026-09-14] - Correção e Aprimoramento Completo do Motor QuickShape (Procreate-like)
- **Substituição do Traço Torto**: Implementado snapshot de camada pré-traço (`preStrokeCanvasRef`). Ao ativar o QuickShape segurando o ponteiro por mais de 450ms, o traço irregular é completamente revertido e substituído pela forma geométrica limpa.
- **Detecção e Cálculo Acurado de Tamanho**:
  - **Círculos**: Centro geométrico e raio calculados com base na média radial real dos pontos traçados pelo usuário, mantendo exatamente o tamanho e proporção pretendidos.
  - **Quadrados e Retângulos**: Detecção precisa da proporção de aspecto (aspect ratio ~1.0 detecta quadrado perfeito; outras proporções geram retângulos limpos).
  - **Linhas Retas**: Detecção com tolerância de desvio, cálculo da reta entre o início e o ponto de parada e snap magnético inteligente a múltiplos de 45° ao segurar e arrastar.
- **Manipulação Interativa ao Segurar**: Enquanto o usuário mantiver o ponteiro pressionado após o snap, arrastar a ponta redimensiona e ajusta a orientação da forma em tempo real na camada de preview.
- **Barra Contextual "Editar Forma"**: Notificação com link para abrir a barra flutuante superior de edição de forma, permitindo ao usuário alternar com 1 toque entre *Círculo Perfeito* e *Elipse*, ou entre *Quadrado Perfeito* e *Retângulo*.

### [2026-09-14] - Suíte Procreate Pro: Brush Studio, Ajustes Avançados, Estúdio 3D e Time-lapse
- **Brush Studio Completo**: Implementado modal profissional com abas para ajuste de Stroke, Shape, Grain, Dynamics, Dual Brush, Properties e About, com scratchpad de teste integrado e persistência de streamline e ajustes.
- **Ajustes Profissionais**: Implementado modal de ajustes com manipulação em tempo real para Curvas RGB paramétricas, Equilíbrio de Cores, Mapa de Gradiente com presets (Sunset, Neon, Vintage, Noir, Cyber), Ruído, Nitidez e Desfoque.
- **Estúdio 3D com Three.js**: Implementado visualizador tridimensional com projeção da textura pintada 2D na malha de objetos 3D, controle de iluminação de estúdio e exportação de captura.
- **Replay Time-lapse Interativo**: Captura de snapshots do histórico de desenho e modal interativo com player, scrubbing e controle de velocidade.
- **Paleta Flutuante Desacoplável**: Suporte a desacoplar a paleta de cores como uma barra compacta flutuante com amostras de cor e atalho de conta-gotas.
- **Recursos de Camadas Estendidos**: Suporte a Máscara de Recorte (*Clipping Mask*), Inversão de Camada e duplicação direta de camadas no menu contextual.
- **Correção de Tipagens e Compilação**: Adequação total de tipos no `src/types.ts` e orquestração limpa e reativa no `src/App.tsx`.

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
