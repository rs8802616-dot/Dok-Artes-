export type ToolType = 
  | 'brush'
  | 'smudge'
  | 'eraser'
  | 'select'
  | 'transform'
  | 'fill'
  | 'shapes'
  | 'text'
  | 'eyedropper'
  | 'hand'
  | 'liquify'
  | 'clone';

export type BrushCategory = 
  | 'esboço' 
  | 'tinta' 
  | 'desenho' 
  | 'pintura' 
  | 'artístico' 
  | 'aerógrafo' 
  | 'caligrafia' 
  | 'texturas' 
  | 'luzes';

export type BrushPresetId = 
  | 'pencil_6b'
  | 'pencil_hb'
  | 'peppermint'
  | 'technical_pencil'
  | 'studio_pen'
  | 'technical_pen'
  | 'syrup'
  | 'gel_pen'
  | 'dry_ink'
  | 'charcoal'
  | 'blackburn'
  | 'pastel'
  | 'round_brush'
  | 'flat_brush'
  | 'wet_acrylic'
  | 'gouache'
  | 'oil_paint'
  | 'watercolour'
  | 'soft_airbrush'
  | 'hard_airbrush'
  | 'monoline'
  | 'script'
  | 'calligraphy'
  | 'noise_brush'
  | 'halftone'
  | 'flare'
  | 'neon'
  | 'lightpen'
  // Legacy aliases
  | 'pencil'
  | 'pen'
  | 'ballpoint'
  | 'highlighter'
  | 'ink'
  | 'watercolor'
  | 'oil'
  | 'airbrush';

export interface BrushStudioSettings {
  spacing: number;       // 0.05 to 1.5
  streamline: number;    // 0 to 0.95
  jitter: number;        // 0 to 1
  falloff: number;       // 0 to 1
  scatter: number;       // 0 to 1
  rotation: number;      // 0 to 360
  grainScale: number;    // 0.2 to 2
  grainDepth: number;    // 0 to 1
  grainTexture: 'paper' | 'canvas' | 'rough' | 'noise' | 'chalk';
  speedSize: number;     // -1 to 1
  speedOpacity: number;  // -1 to 1
  pressureSize: number;  // 0 to 2
  pressureOpacity: number; // 0 to 1
  dualBrushEnabled: boolean;
  secondBrushId?: BrushPresetId;
  dualBlendMode: 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
}

export interface BrushPreset {
  id: BrushPresetId;
  name: string;
  category: BrushCategory;
  defaultSize: number;
  defaultOpacity: number;
  smoothing: number;
  blendMode?: GlobalCompositeOperation;
  description: string;
  studioSettings?: BrushStudioSettings;
}

export type ShapeType = 'line' | 'arrow' | 'rect' | 'circle' | 'triangle' | 'star' | 'ellipse' | 'square';

export interface QuickShapeData {
  type: 'line' | 'circle' | 'ellipse' | 'rect' | 'square' | 'triangle' | 'arc';
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  center?: { x: number; y: number };
  radius?: number;
  color: string;
  lineWidth: number;
  extraPoints?: { x: number; y: number }[];
}

export type PaperTemplate = 
  | 'blank'
  | 'ruled'
  | 'grid'
  | 'dot'
  | 'isometric'
  | 'parchment'
  | 'dark_ruled'
  | 'transparent';

export type SymmetryMode = 'none' | 'vertical' | 'horizontal' | 'quad' | 'radial';

export type BlendMode = 
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'lighter'
  | 'copy'
  | 'luminosity';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  alphaLocked: boolean;
  clippingMask?: boolean;
  groupId?: string;
  isGroup?: boolean;
  collapsed?: boolean;
  opacity: number; // 0 to 1
  blendMode: BlendMode;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface AnimationFrameData {
  id: string;
  name: string;
  layerSnapshots: { [layerId: string]: string }; // dataURLs
}

export interface ProjectMeta {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  paperTemplate: PaperTemplate;
  backgroundColor: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  isFavorite?: boolean;
}

export interface ProjectData extends ProjectMeta {
  layers: {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    alphaLocked: boolean;
    clippingMask?: boolean;
    opacity: number;
    blendMode: BlendMode;
    dataUrl: string;
  }[];
  activeLayerId: string;
  frames?: AnimationFrameData[];
}

export interface Point {
  x: number;
  y: number;
  pressure: number;
  tiltX?: number;
  tiltY?: number;
  time?: number;
}

export interface TextObject {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface TransformSelection {
  active: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  dragStartX?: number;
  dragStartY?: number;
  imageData?: ImageData;
  offsetX: number;
  offsetY: number;
  isFloating: boolean;
}
