import { BrushPreset, BrushCategory, PaperTemplate } from '../types';

export const BRUSH_CATEGORIES: { id: BrushCategory; name: string; icon: string }[] = [
  { id: 'esboço', name: 'Esboço', icon: '✏️' },
  { id: 'tinta', name: 'Tinta', icon: '🖋️' },
  { id: 'desenho', name: 'Desenho', icon: '🖍️' },
  { id: 'pintura', name: 'Pintura', icon: '🎨' },
  { id: 'artístico', name: 'Artístico', icon: '🖌️' },
  { id: 'aerógrafo', name: 'Aerógrafo', icon: '💨' },
  { id: 'caligrafia', name: 'Caligrafia', icon: '✒️' },
  { id: 'texturas', name: 'Texturas', icon: '🧱' },
  { id: 'luzes', name: 'Luzes', icon: '✨' },
];

export const BRUSH_PRESETS: BrushPreset[] = [
  // Esboço
  {
    id: 'pencil_6b',
    name: 'Lápis 6B',
    category: 'esboço',
    defaultSize: 5,
    defaultOpacity: 0.85,
    smoothing: 0.2,
    description: 'Grafite macio e texturizado com sensibilidade dinâmica à inclinação e pressão',
  },
  {
    id: 'pencil_hb',
    name: 'Lápis HB',
    category: 'esboço',
    defaultSize: 3,
    defaultOpacity: 0.9,
    smoothing: 0.25,
    description: 'Grafite duro e preciso ideal para traços de estrutura inicial e proporções',
  },
  {
    id: 'peppermint',
    name: 'Peppermint',
    category: 'esboço',
    defaultSize: 4,
    defaultOpacity: 0.8,
    smoothing: 0.3,
    description: 'Ponta de lápis de cor afilada excelente para esboços limpos e hachuras',
  },
  {
    id: 'technical_pencil',
    name: 'Lápis Técnico',
    category: 'esboço',
    defaultSize: 2,
    defaultOpacity: 0.95,
    smoothing: 0.4,
    description: 'Linhas finas, uniformes e consistentes para desenho mecânico e anatômico',
  },
  {
    id: 'charcoal',
    name: 'Carvão Willow',
    category: 'esboço',
    defaultSize: 18,
    defaultOpacity: 0.7,
    smoothing: 0.15,
    description: 'Textura granulada profunda e orgânica para sombreamento atmosférico',
  },

  // Tinta
  {
    id: 'studio_pen',
    name: 'Caneta de Estúdio',
    category: 'tinta',
    defaultSize: 6,
    defaultOpacity: 1.0,
    smoothing: 0.65,
    description: 'A caneta clássica do Procreate: fluxo ultra suave com conicidade perfeita',
  },
  {
    id: 'technical_pen',
    name: 'Caneta Técnica',
    category: 'tinta',
    defaultSize: 4,
    defaultOpacity: 1.0,
    smoothing: 0.5,
    description: 'Linha constante e sem variação de espessura, perfeita para quadrinhos e manga',
  },
  {
    id: 'syrup',
    name: 'Xarope (Syrup)',
    category: 'tinta',
    defaultSize: 8,
    defaultOpacity: 1.0,
    smoothing: 0.75,
    description: 'Bordas nítidas e líquidas com preenchimento sólido sem transparência intermediária',
  },
  {
    id: 'gel_pen',
    name: 'Caneta Gel',
    category: 'tinta',
    defaultSize: 4,
    defaultOpacity: 0.95,
    smoothing: 0.55,
    description: 'Caneta de tinta fluida e vibrante com traçado acetinado',
  },
  {
    id: 'dry_ink',
    name: 'Tinta Seca',
    category: 'tinta',
    defaultSize: 7,
    defaultOpacity: 0.9,
    smoothing: 0.35,
    description: 'Bordas ásperas e quebradiças simulando papel japonês com tinta nanquim',
  },

  // Desenho
  {
    id: 'blackburn',
    name: 'Blackburn',
    category: 'desenho',
    defaultSize: 14,
    defaultOpacity: 0.8,
    smoothing: 0.3,
    description: 'Crayon encorpado com textura rústica e resposta tátil',
  },
  {
    id: 'pastel',
    name: 'Giz Pastel Suave',
    category: 'desenho',
    defaultSize: 22,
    defaultOpacity: 0.75,
    smoothing: 0.25,
    description: 'Pigmento em pó fosco ideal para transições tonais ricas',
  },

  // Pintura
  {
    id: 'round_brush',
    name: 'Pincel Redondo',
    category: 'pintura',
    defaultSize: 18,
    defaultOpacity: 0.85,
    smoothing: 0.45,
    description: 'Pincel universal de cerdas macias para blocagem e acabamento de pintura',
  },
  {
    id: 'flat_brush',
    name: 'Pincel Chato',
    category: 'pintura',
    defaultSize: 24,
    defaultOpacity: 0.9,
    smoothing: 0.4,
    description: 'Pincel de ponta quadrada para pinceladas amplas e facetadas',
  },
  {
    id: 'wet_acrylic',
    name: 'Acrílico Úmido',
    category: 'pintura',
    defaultSize: 20,
    defaultOpacity: 0.75,
    smoothing: 0.5,
    description: 'Tinta fresca com mesclagem natural ao sobrepor camadas de cor',
  },
  {
    id: 'gouache',
    name: 'Gouache Seco',
    category: 'pintura',
    defaultSize: 16,
    defaultOpacity: 0.95,
    smoothing: 0.35,
    description: 'Tinta opaca aveludada com bordas nítidas e textura fosca vintage',
  },
  {
    id: 'oil_paint',
    name: 'Pincel a Óleo',
    category: 'pintura',
    defaultSize: 26,
    defaultOpacity: 0.85,
    smoothing: 0.4,
    description: 'Traço espesso com brilho de óleo e ranhuras expressivas de cerdas',
  },

  // Artístico
  {
    id: 'watercolour',
    name: 'Aquarela Fluida',
    category: 'artístico',
    defaultSize: 32,
    defaultOpacity: 0.4,
    smoothing: 0.5,
    description: 'Bordas de pigmento acumulado com sangramento aquoso translúcido',
  },

  // Aerógrafo
  {
    id: 'soft_airbrush',
    name: 'Aerógrafo Suave',
    category: 'aerógrafo',
    defaultSize: 45,
    defaultOpacity: 0.3,
    smoothing: 0.3,
    description: 'Gradiente perfeitamente difuso sem bordas perceptíveis para volumes e luz',
  },
  {
    id: 'hard_airbrush',
    name: 'Bocal Duro',
    category: 'aerógrafo',
    defaultSize: 20,
    defaultOpacity: 0.9,
    smoothing: 0.4,
    description: 'Spray denso com corte nítido de perímetro',
  },

  // Caligrafia
  {
    id: 'monoline',
    name: 'Linha Única (Monoline)',
    category: 'caligrafia',
    defaultSize: 10,
    defaultOpacity: 1.0,
    smoothing: 0.8,
    description: 'Ponta esférica perfeitamente circular com linha contínua ultra estabilizada',
  },
  {
    id: 'script',
    name: 'Pincelada Script',
    category: 'caligrafia',
    defaultSize: 14,
    defaultOpacity: 1.0,
    smoothing: 0.7,
    description: 'Contraste expressivo de traço fino na subida e grosso na descida',
  },
  {
    id: 'calligraphy',
    name: 'Pena Chanfrada',
    category: 'caligrafia',
    defaultSize: 12,
    defaultOpacity: 1.0,
    smoothing: 0.4,
    description: 'Ponta cortada a 45 graus para gótica, itálica e lettering clássico',
  },

  // Texturas
  {
    id: 'noise_brush',
    name: 'Granulado de Ruído',
    category: 'texturas',
    defaultSize: 28,
    defaultOpacity: 0.6,
    smoothing: 0.2,
    description: 'Partículas estocásticas de ruído para adicionar grão retrô e materialidade',
  },
  {
    id: 'halftone',
    name: 'Retícula Retrô',
    category: 'texturas',
    defaultSize: 36,
    defaultOpacity: 0.85,
    smoothing: 0.2,
    description: 'Padrão de pontos de retícula de impressão gráfica e manga clássico',
  },

  // Luzes
  {
    id: 'flare',
    name: 'Reflexo de Luz (Flare)',
    category: 'luzes',
    defaultSize: 30,
    defaultOpacity: 0.8,
    smoothing: 0.4,
    blendMode: 'screen',
    description: 'Brilho volumétrico ofuscante com dispersão de luz em modo tela',
  },
  {
    id: 'neon',
    name: 'Tubo Neon',
    category: 'luzes',
    defaultSize: 12,
    defaultOpacity: 1.0,
    smoothing: 0.6,
    blendMode: 'screen',
    description: 'Núcleo branco incandescente com halo colorido vibrante ao redor',
  },
  {
    id: 'lightpen',
    name: 'Caneta de Luz',
    category: 'luzes',
    defaultSize: 8,
    defaultOpacity: 0.95,
    smoothing: 0.5,
    blendMode: 'screen',
    description: 'Traço fino luminoso com aura suave para efeitos mágicos e cyber',
  },

  // Aliases for compatibility
  {
    id: 'pencil',
    name: 'Lápis 6B',
    category: 'esboço',
    defaultSize: 5,
    defaultOpacity: 0.85,
    smoothing: 0.2,
    description: 'Lápis clássico de esboço',
  },
  {
    id: 'pen',
    name: 'Caneta de Estúdio',
    category: 'tinta',
    defaultSize: 6,
    defaultOpacity: 1.0,
    smoothing: 0.65,
    description: 'Caneta de estúdio suave',
  },
  {
    id: 'ink',
    name: 'Tinta Seca',
    category: 'tinta',
    defaultSize: 7,
    defaultOpacity: 0.9,
    smoothing: 0.35,
    description: 'Nanquim texturizado',
  },
  {
    id: 'watercolor',
    name: 'Aquarela Fluida',
    category: 'artístico',
    defaultSize: 32,
    defaultOpacity: 0.4,
    smoothing: 0.5,
    description: 'Aquarela translúcida',
  },
  {
    id: 'oil',
    name: 'Pincel a Óleo',
    category: 'pintura',
    defaultSize: 26,
    defaultOpacity: 0.85,
    smoothing: 0.4,
    description: 'Tinta a óleo espessa',
  },
  {
    id: 'airbrush',
    name: 'Aerógrafo Suave',
    category: 'aerógrafo',
    defaultSize: 45,
    defaultOpacity: 0.3,
    smoothing: 0.3,
    description: 'Spray suave difuso',
  },
  {
    id: 'ballpoint',
    name: 'Caneta Técnica',
    category: 'tinta',
    defaultSize: 4,
    defaultOpacity: 1.0,
    smoothing: 0.5,
    description: 'Linha técnica constante',
  },
  {
    id: 'highlighter',
    name: 'Marcador Translúcido',
    category: 'tinta',
    defaultSize: 25,
    defaultOpacity: 0.5,
    smoothing: 0.5,
    blendMode: 'multiply',
    description: 'Marcador sem cobrir fundo',
  },
];

export const PAPER_CONFIGS: {
  id: PaperTemplate;
  name: string;
  bgColor: string;
  lineColor: string;
  description: string;
}[] = [
  {
    id: 'blank',
    name: 'Branco Liso',
    bgColor: '#ffffff',
    lineColor: 'transparent',
    description: 'Superfície limpa clássica para ilustração e pintura',
  },
  {
    id: 'ruled',
    name: 'Caderno Pautado',
    bgColor: '#fafafa',
    lineColor: '#cbd5e1',
    description: 'Linhas pautadas horizontais clássicas do FreeNote para escrita e estudos',
  },
  {
    id: 'grid',
    name: 'Quadriculado',
    bgColor: '#f8fafc',
    lineColor: '#e2e8f0',
    description: 'Grade milimetrada para desenhos técnicos, geometria e diagramas',
  },
  {
    id: 'dot',
    name: 'Pontilhado (Bullet)',
    bgColor: '#fafaf9',
    lineColor: '#d6d3d1',
    description: 'Matriz discreta de pontos para bullet journaling e layout livre',
  },
  {
    id: 'isometric',
    name: 'Isométrico 3D',
    bgColor: '#f8fafc',
    lineColor: '#e2e8f0',
    description: 'Grade triangular isométrica para desenho de perspectiva e arquitetura',
  },
  {
    id: 'parchment',
    name: 'Papel Envelhecido',
    bgColor: '#f4ebd0',
    lineColor: '#dfcca2',
    description: 'Tom quente pergaminho artesanal suave para ilustrações vintage',
  },
  {
    id: 'dark_ruled',
    name: 'Caderno Noturno',
    bgColor: '#15181d',
    lineColor: '#2b313c',
    description: 'Tema escuro relaxante com pauta sutil para anotações noturnas',
  },
  {
    id: 'transparent',
    name: 'Transparente (PNG)',
    bgColor: 'transparent',
    lineColor: 'transparent',
    description: 'Fundo alfa xadrez transparente para recorte e assets sem fundo',
  },
];

export const COLOR_PALETTES = [
  {
    name: 'FreeNote Clássico',
    colors: [
      '#111827', '#4b5563', '#dc2626', '#ea580c', '#f59e0b',
      '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#ffffff'
    ],
  },
  {
    name: 'Marca-Texto & Destaques',
    colors: [
      '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa',
      '#ddd6fe', '#a7f3d0', '#fecdd3', '#bae6fd', '#e9d5ff'
    ],
  },
  {
    name: 'Pintura & Pele',
    colors: [
      '#2d1d16', '#4a2f24', '#794d3a', '#ab7a60', '#d8a483',
      '#ecc3a6', '#fce2d0', '#ffd1b3', '#d97706', '#991b1b'
    ],
  },
  {
    name: 'Natureza & Paisagem',
    colors: [
      '#064e3b', '#047857', '#10b981', '#34d399', '#6ee7b7',
      '#0c4a6e', '#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd'
    ],
  },
  {
    name: 'Manga & Lineart',
    colors: [
      '#09090b', '#18181b', '#27272a', '#3f3f46', '#52525b',
      '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#fafafa'
    ],
  },
];

export const CANVAS_PRESETS = [
  {
    id: 'freenote_a4',
    name: 'Caderno FreeNote A4',
    width: 1240,
    height: 1754,
    dpi: 150,
    template: 'ruled' as PaperTemplate,
    desc: 'Formato vertical ideal para estudos e anotações pautadas',
  },
  {
    id: 'screen_fhd',
    name: 'Full HD (1920x1080)',
    width: 1920,
    height: 1080,
    dpi: 72,
    template: 'blank' as PaperTemplate,
    desc: 'Paisagem padrão para arte conceitual e telas digitais',
  },
  {
    id: 'square_art',
    name: 'Quadrado Pro (2048x2048)',
    width: 2048,
    height: 2048,
    dpi: 300,
    template: 'blank' as PaperTemplate,
    desc: 'Alta resolução para ilustrações e redes sociais',
  },
  {
    id: 'story_mobile',
    name: 'Stories / Mobile (1080x1920)',
    width: 1080,
    height: 1920,
    dpi: 72,
    template: 'blank' as PaperTemplate,
    desc: 'Formato vertical otimizado para celulares e reels',
  },
  {
    id: 'tech_grid',
    name: 'Prancheta Técnica Quadriculada',
    width: 1600,
    height: 1200,
    dpi: 150,
    template: 'grid' as PaperTemplate,
    desc: 'Perfeito para plantas, desenhos técnicos e infográficos',
  },
];
