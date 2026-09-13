import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProjectData,
  ProjectMeta,
  Layer,
  ToolType,
  BrushPresetId,
  BrushPreset,
  ShapeType,
  PaperTemplate,
  SymmetryMode,
  BlendMode,
  AnimationFrameData
} from './types';
import { BRUSH_PRESETS, CANVAS_PRESETS } from './utils/constants';
import {
  getAllProjects,
  getProjectById,
  saveProject,
  deleteProject,
  duplicateProject,
  createNewDefaultProject
} from './utils/storage';
import { floodFill } from './utils/drawingEngine';
import {
  applyImageAdjustments,
  applyCurves,
  applyColorBalance,
  applyGradientMap,
  applyNoise,
  applySharpen,
} from './utils/filterEngine';

import { CanvasViewport } from './components/CanvasViewport';
import { ProcreateHeader } from './components/ProcreateHeader';
import { ProcreateSidebar } from './components/ProcreateSidebar';
import { ProcreateBrushLibrary } from './components/ProcreateBrushLibrary';
import { ProcreateColorPicker } from './components/ProcreateColorPicker';
import { ProcreateLayersPanel } from './components/ProcreateLayersPanel';
import { ProcreateActionsMenu } from './components/ProcreateActionsMenu';
import { ProcreateAdjustmentsMenu } from './components/ProcreateAdjustmentsMenu';
import { ProcreateQuickMenu } from './components/ProcreateQuickMenu';
import { ProcreateSelectionBar } from './components/ProcreateSelectionBar';
import { ProcreateTransformBar } from './components/ProcreateTransformBar';
import { ProcreateAnimationAssist } from './components/ProcreateAnimationAssist';
import { ProcreateReferenceWindow } from './components/ProcreateReferenceWindow';
import { ProcreateGallery } from './components/ProcreateGallery';
import { ProcreateBrushStudio } from './components/ProcreateBrushStudio';
import { ProcreateAdjustmentModal } from './components/ProcreateAdjustmentModal';
import { Procreate3DViewer } from './components/Procreate3DViewer';
import { ProcreateTimelapseModal } from './components/ProcreateTimelapseModal';
import { ProcreateMiniPalette } from './components/ProcreateMiniPalette';

export default function App() {
  // Projects Storage
  const [projectsList, setProjectsList] = useState<ProjectMeta[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Layers in memory
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');

  // Procreate Tool States
  const [currentTool, setCurrentTool] = useState<ToolType>('brush');
  const [activeBrushId, setActiveBrushId] = useState<BrushPresetId>('pencil_6b');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [brushOpacity, setBrushOpacity] = useState<number>(1.0);
  const [smoothing, setSmoothing] = useState<number>(0.35);
  const [pressureEnabled, setPressureEnabled] = useState<boolean>(true);

  // Color management
  const [primaryColor, setPrimaryColor] = useState<string>('#1a1a1a');
  const [previousColor, setPreviousColor] = useState<string>('#3b82f6');

  // Canvas Transform
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Guides & Paper
  const [paperTemplate, setPaperTemplate] = useState<PaperTemplate>('blank');
  const [symmetryMode, setSymmetryMode] = useState<SymmetryMode>('none');
  const [showDrawingGuide, setShowDrawingGuide] = useState<boolean>(false);
  const [isLeftHanded, setIsLeftHanded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Floating Popovers & Menus
  const [showBrushLibrary, setShowBrushLibrary] = useState<boolean>(false);
  const [brushLibraryTarget, setBrushLibraryTarget] = useState<'Pincel' | 'Dedo' | 'Borracha'>('Pincel');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
  const [showActionsMenu, setShowActionsMenu] = useState<boolean>(false);
  const [showAdjustmentsMenu, setShowAdjustmentsMenu] = useState<boolean>(false);
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);

  // Contextual Bars & Features
  const [isSelectionActive, setIsSelectionActive] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<'freehand' | 'rect' | 'circle'>('freehand');
  const [isTransformActive, setIsTransformActive] = useState<boolean>(false);
  const [transformMode, setTransformMode] = useState<'free' | 'uniform' | 'distort'>('free');
  const [showAnimationAssist, setShowAnimationAssist] = useState<boolean>(false);
  const [showReference, setShowReference] = useState<boolean>(false);

  // Adjustments & QuickShape State
  const [activeAdjustment, setActiveAdjustment] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0.15);
  const [quickShapeNotification, setQuickShapeNotification] = useState<string | null>(null);
  const [colorDropThreshold, setColorDropThreshold] = useState<number | null>(null);

  // Animation frames
  const [frames, setFrames] = useState<AnimationFrameData[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);

  // Procreate Extended Studio & Modals
  const [showBrushStudio, setShowBrushStudio] = useState<boolean>(false);
  const [editingBrush, setEditingBrush] = useState<BrushPreset | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);
  const [selectedAdjustmentType, setSelectedAdjustmentType] = useState<string>('curves');
  const [show3DViewer, setShow3DViewer] = useState<boolean>(false);
  const [showTimelapseModal, setShowTimelapseModal] = useState<boolean>(false);
  const [showMiniPalette, setShowMiniPalette] = useState<boolean>(false);
  const [timelapseSnapshots, setTimelapseSnapshots] = useState<string[]>([]);

  // Helper to create memory canvas
  const createLayerCanvas = (
    w: number,
    h: number,
    initialDataUrl?: string
  ): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialDataUrl;
    }
    return { canvas, ctx };
  };

  // Load project
  const loadProject = async (proj: ProjectData) => {
    setCurrentProject(proj);
    setPaperTemplate(proj.paperTemplate || 'blank');

    const memLayers: Layer[] = proj.layers.map((l) => {
      const { canvas, ctx } = createLayerCanvas(proj.width, proj.height, l.dataUrl);
      return {
        id: l.id,
        name: l.name,
        visible: l.visible,
        locked: l.locked,
        alphaLocked: l.alphaLocked,
        clippingMask: l.clippingMask || false,
        opacity: l.opacity,
        blendMode: l.blendMode,
        canvas,
        ctx,
      };
    });

    setLayers(memLayers);
    setActiveLayerId(proj.activeLayerId || memLayers[0]?.id || '');

    if (proj.frames && proj.frames.length > 0) {
      setFrames(proj.frames);
    } else {
      setFrames([{ id: 'frame_1', name: 'Quadro 1', layerSnapshots: {} }]);
    }
    setCurrentFrameIndex(0);

    setUndoStack([]);
    setRedoStack([]);
    fitCanvasToScreen(proj.width, proj.height);
  };

  // Initialize DB & load initial canvas
  useEffect(() => {
    async function init() {
      try {
        const list = await getAllProjects();
        setProjectsList(list);
        if (list.length > 0) {
          const first = await getProjectById(list[0].id);
          if (first) {
            await loadProject(first);
            return;
          }
        }
        // Default Procreate Square Artwork (2048 x 2048)
        const defaultProj = createNewDefaultProject(
          'Sem Título',
          2048,
          2048,
          'blank',
          '#ffffff'
        );
        await saveProject(defaultProj);
        const updatedList = await getAllProjects();
        setProjectsList(updatedList);
        await loadProject(defaultProj);
      } catch (err) {
        console.error('Error initializing project storage:', err);
      }
    }
    init();
  }, []);

  // Fit canvas into viewport
  const fitCanvasToScreen = (cw?: number, ch?: number) => {
    const w = cw || currentProject?.width || 2048;
    const h = ch || currentProject?.height || 2048;
    const availW = window.innerWidth - 60;
    const availH = window.innerHeight - 80;
    const scale = Math.min(availW / w, availH / h) * 0.94;
    setZoom(Math.max(0.1, Math.min(3, scale)));
    setPanOffset({ x: 0, y: 0 });
  };

  // Capture canvas state snapshot for Undo
  const pushUndoSnapshot = () => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active) return;
    try {
      const snap = active.canvas.toDataURL('image/png');
      setUndoStack((prev) => [...prev.slice(-30), snap]);
      setRedoStack([]);
    } catch (_) {}
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active) return;

    const currentData = active.canvas.toDataURL('image/png');
    setRedoStack((prev) => [...prev, currentData]);

    const previousData = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    const img = new Image();
    img.onload = () => {
      active.ctx.clearRect(0, 0, active.canvas.width, active.canvas.height);
      active.ctx.drawImage(img, 0, 0);
      setLayers([...layers]);
    };
    img.src = previousData;
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active) return;

    const currentData = active.canvas.toDataURL('image/png');
    setUndoStack((prev) => [...prev, currentData]);

    const nextData = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    const img = new Image();
    img.onload = () => {
      active.ctx.clearRect(0, 0, active.canvas.width, active.canvas.height);
      active.ctx.drawImage(img, 0, 0);
      setLayers([...layers]);
    };
    img.src = nextData;
  };

  // Auto-save project
  const persistCurrentProject = useCallback(async () => {
    if (!currentProject || layers.length === 0) return;
    try {
      const topLayer = layers.find((l) => l.visible) || layers[0];
      const thumbnail = topLayer?.canvas.toDataURL('image/jpeg', 0.6) || '';

      const updatedProj: ProjectData = {
        ...currentProject,
        paperTemplate,
        activeLayerId,
        thumbnail,
        updatedAt: Date.now(),
        layers: layers.map((l) => ({
          id: l.id,
          name: l.name,
          visible: l.visible,
          locked: l.locked,
          alphaLocked: l.alphaLocked,
          clippingMask: l.clippingMask || false,
          opacity: l.opacity,
          blendMode: l.blendMode,
          dataUrl: l.canvas.toDataURL('image/png'),
        })),
        frames,
      };

      await saveProject(updatedProj);
      const list = await getAllProjects();
      setProjectsList(list);
    } catch (e) {
      console.warn('Autosave warning:', e);
    }
  }, [currentProject, layers, paperTemplate, activeLayerId, frames]);

  const handleCommitStroke = () => {
    pushUndoSnapshot();
    persistCurrentProject();

    // Capture time-lapse frame for Procreate interactive replay
    if (layers.length > 0) {
      const topVisible = layers.find((l) => l.visible);
      if (topVisible) {
        try {
          const snap = topVisible.canvas.toDataURL('image/jpeg', 0.6);
          setTimelapseSnapshots((prev) => [...prev.slice(-180), snap]);
        } catch (_) {}
      }
    }
  };

  // Color change (with previous color tracking)
  const handleChangeColor = (newColor: string) => {
    if (newColor !== primaryColor) {
      setPreviousColor(primaryColor);
      setPrimaryColor(newColor);
    }
  };

  // Procreate ColorDrop Handler
  const handleColorDrop = (clientX: number, clientY: number) => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked || !currentProject) return;

    const availW = window.innerWidth;
    const availH = window.innerHeight;
    const centerX = availW / 2 + panOffset.x;
    const centerY = availH / 2 + panOffset.y;

    const canvasX = Math.round((clientX - centerX) / zoom + currentProject.width / 2);
    const canvasY = Math.round((clientY - centerY) / zoom + currentProject.height / 2);

    if (
      canvasX >= 0 &&
      canvasX < currentProject.width &&
      canvasY >= 0 &&
      canvasY < currentProject.height
    ) {
      pushUndoSnapshot();
      floodFill(active.ctx, canvasX, canvasY, primaryColor);
      setLayers([...layers]);
      handleCommitStroke();
    }
  };

  // QuickShape Notification
  const handleQuickShapeDetected = (shapeName: string) => {
    setQuickShapeNotification(shapeName);
    setTimeout(() => {
      setQuickShapeNotification(null);
    }, 2800);
  };

  // Layer Actions
  const handleAddLayer = () => {
    if (!currentProject) return;
    const newId = 'layer_' + Date.now();
    const { canvas, ctx } = createLayerCanvas(currentProject.width, currentProject.height);
    const newLayer: Layer = {
      id: newId,
      name: `Camada ${layers.length + 1}`,
      visible: true,
      locked: false,
      alphaLocked: false,
      opacity: 1,
      blendMode: 'source-over',
      canvas,
      ctx,
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newId);
    persistCurrentProject();
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const remaining = layers.filter((l) => l.id !== id);
    setLayers(remaining);
    if (activeLayerId === id) {
      setActiveLayerId(remaining[remaining.length - 1].id);
    }
    persistCurrentProject();
  };

  const handleDuplicateLayer = (id: string) => {
    const original = layers.find((l) => l.id === id);
    if (!original || !currentProject) return;
    const newId = 'layer_' + Date.now();
    const data = original.canvas.toDataURL('image/png');
    const { canvas, ctx } = createLayerCanvas(currentProject.width, currentProject.height, data);
    const duplicate: Layer = {
      ...original,
      id: newId,
      name: `${original.name} (Cópia)`,
      canvas,
      ctx,
    };
    const idx = layers.findIndex((l) => l.id === id);
    const newLayers = [...layers];
    newLayers.splice(idx + 1, 0, duplicate);
    setLayers(newLayers);
    setActiveLayerId(newId);
    persistCurrentProject();
  };

  const handleMergeDown = (id: string) => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    const upper = layers[idx];
    const lower = layers[idx - 1];

    lower.ctx.save();
    lower.ctx.globalAlpha = upper.opacity;
    lower.ctx.globalCompositeOperation = upper.blendMode;
    lower.ctx.drawImage(upper.canvas, 0, 0);
    lower.ctx.restore();

    const newLayers = layers.filter((l) => l.id !== upper.id);
    setLayers(newLayers);
    setActiveLayerId(lower.id);
    persistCurrentProject();
  };

  const handleClearLayer = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer || layer.locked) return;
    pushUndoSnapshot();
    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    setLayers([...layers]);
    persistCurrentProject();
  };

  const handleFillLayer = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer || layer.locked) return;
    pushUndoSnapshot();
    layer.ctx.fillStyle = primaryColor;
    layer.ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
    setLayers([...layers]);
    persistCurrentProject();
  };

  const handleToggleVisibility = (id: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const handleToggleLock = (id: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
  };

  const handleToggleAlphaLock = (id: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, alphaLocked: !l.alphaLocked } : l)));
  };

  const handleToggleClippingMask = (id: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, clippingMask: !l.clippingMask } : l)));
  };

  const handleInvertLayer = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer || layer.locked) return;
    pushUndoSnapshot();
    applyImageAdjustments(layer.ctx, { invert: true });
    setLayers([...layers]);
    persistCurrentProject();
  };

  const handleCopyLayer = (id: string) => {
    handleDuplicateLayer(id);
  };

  const handleChangeLayerOpacity = (id: string, opacity: number) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, opacity } : l)));
  };

  const handleChangeBlendMode = (id: string, blendMode: BlendMode) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, blendMode } : l)));
  };

  const handleRenameLayer = (id: string, name: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, name } : l)));
  };

  const handleApplyFilters = (adjustments: any) => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked) return;
    pushUndoSnapshot();
    applyImageAdjustments(active.ctx, adjustments);
    setLayers([...layers]);
    persistCurrentProject();
  };

  // Advanced Procreate Filter Application
  const handleApplyAdjustmentModal = (type: string, value: number, options?: any) => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked) return;
    pushUndoSnapshot();

    const ctx = active.ctx;
    const w = active.canvas.width;
    const h = active.canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);

    if (type === 'curves') {
      applyCurves(imgData, options?.channel || 'rgb', options?.curvePoints || []);
      ctx.putImageData(imgData, 0, 0);
    } else if (type === 'color_balance') {
      applyColorBalance(
        imgData,
        options?.cyanRed || 0,
        options?.magentaGreen || 0,
        options?.yellowBlue || 0
      );
      ctx.putImageData(imgData, 0, 0);
    } else if (type === 'gradient_map') {
      applyGradientMap(imgData, options?.stops || []);
      ctx.putImageData(imgData, 0, 0);
    } else if (type === 'noise') {
      applyNoise(imgData, value * 100);
      ctx.putImageData(imgData, 0, 0);
    } else if (type === 'sharpen') {
      applySharpen(imgData, value * 5);
      ctx.putImageData(imgData, 0, 0);
    } else if (type === 'hsl') {
      applyImageAdjustments(ctx, {
        hue: (options?.hue || 0) * 180,
        saturation: (options?.saturation || 0) * 100,
        brightness: (options?.brightness || 0) * 100,
      });
    } else if (type === 'gaussian') {
      applyImageAdjustments(ctx, { blur: value * 30 });
    } else if (type === 'bloom') {
      applyImageAdjustments(ctx, { bloom: value });
    } else if (type === 'glitch') {
      applyImageAdjustments(ctx, { glitch: value });
    } else if (type === 'halftone') {
      applyImageAdjustments(ctx, { halftone: value });
    }

    setLayers([...layers]);
    persistCurrentProject();
  };

  // Canvas Flips
  const handleFlipHorizontal = () => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked || !currentProject) return;
    pushUndoSnapshot();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = currentProject.width;
    tempCanvas.height = currentProject.height;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.drawImage(active.canvas, 0, 0);

    active.ctx.clearRect(0, 0, currentProject.width, currentProject.height);
    active.ctx.save();
    active.ctx.translate(currentProject.width, 0);
    active.ctx.scale(-1, 1);
    active.ctx.drawImage(tempCanvas, 0, 0);
    active.ctx.restore();

    setLayers([...layers]);
    persistCurrentProject();
  };

  const handleFlipVertical = () => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked || !currentProject) return;
    pushUndoSnapshot();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = currentProject.width;
    tempCanvas.height = currentProject.height;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.drawImage(active.canvas, 0, 0);

    active.ctx.clearRect(0, 0, currentProject.width, currentProject.height);
    active.ctx.save();
    active.ctx.translate(0, currentProject.height);
    active.ctx.scale(1, -1);
    active.ctx.drawImage(tempCanvas, 0, 0);
    active.ctx.restore();

    setLayers([...layers]);
    persistCurrentProject();
  };

  // Insert Image onto active layer
  const handleInsertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const active = layers.find((l) => l.id === activeLayerId);
        if (!active || !currentProject) return;
        pushUndoSnapshot();
        const maxW = currentProject.width * 0.8;
        const maxH = currentProject.height * 0.8;
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const startX = (currentProject.width - drawW) / 2;
        const startY = (currentProject.height - drawH) / 2;

        active.ctx.drawImage(img, startX, startY, drawW, drawH);
        setLayers([...layers]);
        persistCurrentProject();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Export Artwork
  const handleExport = (format: 'png' | 'jpeg' | 'webp' | 'json' | 'video') => {
    if (!currentProject) return;

    if (format === 'json') {
      const projJson = JSON.stringify(currentProject, null, 2);
      const blob = new Blob([projJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '_')}.procreate`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = currentProject.width;
    exportCanvas.height = currentProject.height;
    const ctx = exportCanvas.getContext('2d')!;

    if (format === 'jpeg' || paperTemplate !== 'transparent') {
      ctx.fillStyle = currentProject.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    layers.forEach((l) => {
      if (!l.visible) return;
      ctx.save();
      ctx.globalAlpha = l.opacity;
      ctx.globalCompositeOperation = l.blendMode;
      ctx.drawImage(l.canvas, 0, 0);
      ctx.restore();
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = exportCanvas.toDataURL(mime, 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${currentProject.name.replace(/\s+/g, '_')}.${format}`;
    a.click();
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts (Procreate style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (e.key.toLowerCase() === 'b') {
        setCurrentTool('brush');
      } else if (e.key.toLowerCase() === 'e') {
        setCurrentTool('eraser');
      } else if (e.key.toLowerCase() === 's') {
        setIsSelectionActive((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v') {
        setIsTransformActive((prev) => !prev);
      } else if (e.key.toLowerCase() === 'q') {
        setShowQuickMenu((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, layers, activeLayerId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0c10] select-none text-slate-100 font-sans">
      {/* 1. Authentic Procreate Top Bar */}
      <ProcreateHeader
        projectName={currentProject?.name || 'Sem Título'}
        onRenameProject={(name) => {
          if (currentProject) {
            setCurrentProject({ ...currentProject, name });
            persistCurrentProject();
          }
        }}
        onOpenGallery={() => setShowGallery(true)}
        // Left Actions & Adjustments
        onToggleActions={() => {
          setShowActionsMenu(!showActionsMenu);
          setShowAdjustmentsMenu(false);
          setShowBrushLibrary(false);
          setShowColorPicker(false);
          setShowLayersPanel(false);
        }}
        showActions={showActionsMenu}
        onToggleAdjustments={() => {
          setShowAdjustmentsMenu(!showAdjustmentsMenu);
          setShowActionsMenu(false);
          setShowBrushLibrary(false);
          setShowColorPicker(false);
          setShowLayersPanel(false);
        }}
        showAdjustments={showAdjustmentsMenu}
        isSelectionActive={isSelectionActive}
        onToggleSelection={() => {
          setIsSelectionActive(!isSelectionActive);
          if (!isSelectionActive) setCurrentTool('select');
          else setCurrentTool('brush');
        }}
        isTransformActive={isTransformActive}
        onToggleTransform={() => {
          setIsTransformActive(!isTransformActive);
        }}
        // Right Tools (Brush, Smudge, Eraser, Layers, Color)
        currentTool={currentTool}
        onSelectTool={(tool) => {
          setCurrentTool(tool);
          setIsSelectionActive(false);
          setIsTransformActive(false);
        }}
        onToggleBrushLibrary={(targetTool) => {
          setBrushLibraryTarget(targetTool);
          setShowBrushLibrary(!showBrushLibrary);
          setShowColorPicker(false);
          setShowLayersPanel(false);
          setShowActionsMenu(false);
          setShowAdjustmentsMenu(false);
        }}
        showBrushLibrary={showBrushLibrary}
        onToggleLayers={() => {
          setShowLayersPanel(!showLayersPanel);
          setShowBrushLibrary(false);
          setShowColorPicker(false);
          setShowActionsMenu(false);
          setShowAdjustmentsMenu(false);
        }}
        showLayers={showLayersPanel}
        onToggleColorPicker={() => {
          setShowColorPicker(!showColorPicker);
          setShowBrushLibrary(false);
          setShowLayersPanel(false);
          setShowActionsMenu(false);
          setShowAdjustmentsMenu(false);
        }}
        showColorPicker={showColorPicker}
        primaryColor={primaryColor}
        previousColor={previousColor}
        onColorDrop={handleColorDrop}
        // Banner info
        activeAdjustment={activeAdjustment}
        adjustmentValue={adjustmentValue}
        onChangeAdjustmentValue={setAdjustmentValue}
        onApplyAdjustment={() => {
          if (activeAdjustment) {
            handleApplyFilters({ [activeAdjustment]: adjustmentValue });
            setActiveAdjustment(null);
          }
        }}
        onCancelAdjustment={() => setActiveAdjustment(null)}
        quickShapeNotification={quickShapeNotification}
        colorDropThreshold={colorDropThreshold}
        onChangeColorDropThreshold={setColorDropThreshold}
      />

      {/* 2. Main Workspace Canvas & Viewport */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        {currentProject && (
          <CanvasViewport
            width={currentProject.width}
            height={currentProject.height}
            layers={layers}
            activeLayerId={activeLayerId}
            currentTool={currentTool}
            brushPresetId={activeBrushId}
            brushSize={brushSize}
            brushOpacity={brushOpacity}
            brushColor={primaryColor}
            smoothing={smoothing}
            pressureEnabled={pressureEnabled}
            paperTemplate={paperTemplate}
            backgroundColor={currentProject.backgroundColor}
            symmetryMode={symmetryMode}
            showGrid={showDrawingGuide}
            activeShape="rect"
            zoom={zoom}
            panOffset={panOffset}
            onUpdatePanZoom={(pan, z) => {
              setPanOffset(pan);
              setZoom(z);
            }}
            onPickColor={handleChangeColor}
            onCommitStroke={handleCommitStroke}
            onionSkinEnabled={true}
            frames={frames}
            currentFrameIndex={currentFrameIndex}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onToggleZen={handleToggleFullscreen}
            onQuickShapeDetected={handleQuickShapeDetected}
          />
        )}

        {/* 3. The Iconic Procreate Left-Edge Floating Pill Slider Bar */}
        <ProcreateSidebar
          brushSize={brushSize}
          brushOpacity={brushOpacity}
          onChangeSize={setBrushSize}
          onChangeOpacity={setBrushOpacity}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onTriggerQuickMenu={() => setShowQuickMenu(true)}
          onActivateEyedropper={() => setCurrentTool('eyedropper')}
          isLeftHanded={isLeftHanded}
        />

        {/* 4. Procreate Brush Library Popover */}
        <ProcreateBrushLibrary
          isOpen={showBrushLibrary}
          onClose={() => setShowBrushLibrary(false)}
          activeBrushId={activeBrushId}
          onSelectBrush={(id) => {
            setActiveBrushId(id);
            const preset = BRUSH_PRESETS.find((b) => b.id === id);
            if (preset) {
              setBrushSize(preset.defaultSize);
              setBrushOpacity(preset.defaultOpacity);
              setSmoothing(preset.smoothing);
            }
          }}
          targetToolName={brushLibraryTarget}
          smoothing={smoothing}
          onChangeSmoothing={setSmoothing}
          onOpenBrushStudio={(brush) => {
            setEditingBrush(brush);
            setShowBrushStudio(true);
          }}
        />

        {/* 5. Procreate 5-Tab Color Disc Popover */}
        <ProcreateColorPicker
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          currentColor={primaryColor}
          onChangeColor={handleChangeColor}
          previousColor={previousColor}
          onDetachPalette={() => setShowMiniPalette(true)}
        />

        {/* 6. Procreate Layers Panel Popover */}
        <ProcreateLayersPanel
          isOpen={showLayersPanel}
          onClose={() => setShowLayersPanel(false)}
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onToggleAlphaLock={handleToggleAlphaLock}
          onToggleClippingMask={handleToggleClippingMask}
          onInvertLayer={handleInvertLayer}
          onCopyLayer={handleCopyLayer}
          onChangeOpacity={handleChangeLayerOpacity}
          onChangeBlendMode={handleChangeBlendMode}
          onMergeDown={handleMergeDown}
          onDuplicateLayer={handleDuplicateLayer}
          onClearLayer={handleClearLayer}
          onFillLayer={handleFillLayer}
          onRenameLayer={handleRenameLayer}
          backgroundColor={currentProject?.backgroundColor || '#ffffff'}
          onChangeBackgroundColor={(color) => {
            if (currentProject) {
              setCurrentProject({ ...currentProject, backgroundColor: color });
              persistCurrentProject();
            }
          }}
        />

        {/* 7. Procreate Actions Menu (Wrench) */}
        <ProcreateActionsMenu
          isOpen={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          showAnimationAssist={showAnimationAssist}
          onToggleAnimationAssist={() => setShowAnimationAssist(!showAnimationAssist)}
          showReference={showReference}
          onToggleReference={() => setShowReference(!showReference)}
          showDrawingGuide={showDrawingGuide}
          onToggleDrawingGuide={() => setShowDrawingGuide(!showDrawingGuide)}
          paperTemplate={paperTemplate}
          onChangePaperTemplate={setPaperTemplate}
          symmetryMode={symmetryMode}
          onChangeSymmetryMode={setSymmetryMode}
          onFlipHorizontal={handleFlipHorizontal}
          onFlipVertical={handleFlipVertical}
          onAddText={() => setCurrentTool('text')}
          onInsertImage={handleInsertImage}
          onExport={handleExport}
          isLeftHanded={isLeftHanded}
          onToggleLeftHanded={() => setIsLeftHanded(!isLeftHanded)}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          onOpen3DViewer={() => setShow3DViewer(true)}
          onOpenTimelapse={() => setShowTimelapseModal(true)}
        />

        {/* 8. Procreate Adjustments Menu (Magic Wand) */}
        <ProcreateAdjustmentsMenu
          isOpen={showAdjustmentsMenu}
          onClose={() => setShowAdjustmentsMenu(false)}
          onSelectAdjustment={(adjId) => {
            if (adjId === 'invert') {
              handleInvertLayer(activeLayerId);
              setShowAdjustmentsMenu(false);
            } else {
              setSelectedAdjustmentType(adjId);
              setShowAdjustmentModal(true);
              setShowAdjustmentsMenu(false);
            }
          }}
        />

        {/* 9. Procreate QuickMenu (Radial 6-Slots) */}
        <ProcreateQuickMenu
          isOpen={showQuickMenu}
          onClose={() => setShowQuickMenu(false)}
          onNewLayer={handleAddLayer}
          onCopyCanvas={() => handleExport('png')}
          onToggleFullscreen={handleToggleFullscreen}
          onClearLayer={() => handleClearLayer(activeLayerId)}
          onInvertColor={() => {
            const active = layers.find((l) => l.id === activeLayerId);
            if (active && !active.locked) {
              pushUndoSnapshot();
              applyImageAdjustments(active.ctx, { invert: true });
              setLayers([...layers]);
              handleCommitStroke();
            }
          }}
          onFlipHorizontal={handleFlipHorizontal}
        />

        {/* 10. Selection Floating Bar */}
        {isSelectionActive && (
          <ProcreateSelectionBar
            selectionMode={selectionMode}
            onChangeSelectionMode={setSelectionMode}
            onInvertSelection={() => {}}
            onCopyAndPaste={() => handleDuplicateLayer(activeLayerId)}
            onFillSelection={() => handleFillLayer(activeLayerId)}
            onClearSelection={() => handleClearLayer(activeLayerId)}
            onClose={() => {
              setIsSelectionActive(false);
              setCurrentTool('brush');
            }}
          />
        )}

        {/* 11. Transform Floating Bar */}
        {isTransformActive && (
          <ProcreateTransformBar
            transformMode={transformMode}
            onChangeTransformMode={setTransformMode}
            onFlipHorizontal={handleFlipHorizontal}
            onFlipVertical={handleFlipVertical}
            onRotate45={() => {
              const active = layers.find((l) => l.id === activeLayerId);
              if (!active || !currentProject) return;
              pushUndoSnapshot();
              const temp = document.createElement('canvas');
              temp.width = currentProject.width;
              temp.height = currentProject.height;
              temp.getContext('2d')!.drawImage(active.canvas, 0, 0);

              active.ctx.clearRect(0, 0, currentProject.width, currentProject.height);
              active.ctx.save();
              active.ctx.translate(currentProject.width / 2, currentProject.height / 2);
              active.ctx.rotate((45 * Math.PI) / 180);
              active.ctx.drawImage(
                temp,
                -currentProject.width / 2,
                -currentProject.height / 2
              );
              active.ctx.restore();
              setLayers([...layers]);
              handleCommitStroke();
            }}
            onFitToCanvas={() => fitCanvasToScreen()}
            onReset={() => {
              setZoom(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            onApply={() => setIsTransformActive(false)}
          />
        )}

        {/* 12. Animation Assist Bottom Tray */}
        <ProcreateAnimationAssist
          isOpen={showAnimationAssist}
          onClose={() => setShowAnimationAssist(false)}
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onAddFrame={handleAddLayer}
        />

        {/* 13. Reference Floating Window */}
        <ProcreateReferenceWindow
          isOpen={showReference}
          onClose={() => setShowReference(false)}
          canvasPreviewUrl={
            layers.find((l) => l.id === activeLayerId)?.canvas.toDataURL()
          }
          onPickColor={handleChangeColor}
        />

        {/* 14. Floating Mini Color Palette */}
        <ProcreateMiniPalette
          isOpen={showMiniPalette}
          onClose={() => setShowMiniPalette(false)}
          currentColor={primaryColor}
          onSelectColor={handleChangeColor}
          onActivateEyedropper={() => setCurrentTool('eyedropper')}
          recentColors={[primaryColor, previousColor]}
        />
      </main>

      {/* 15. Procreate Brush Studio (150+ settings & scratchpad) */}
      <ProcreateBrushStudio
        isOpen={showBrushStudio}
        onClose={() => setShowBrushStudio(false)}
        initialPreset={
          editingBrush ||
          BRUSH_PRESETS.find((b) => b.id === activeBrushId) ||
          BRUSH_PRESETS[0]
        }
        onSavePreset={(preset) => {
          if (preset.id === activeBrushId) {
            setBrushSize(preset.defaultSize);
            setBrushOpacity(preset.defaultOpacity);
            setSmoothing(preset.smoothing);
          }
          setShowBrushStudio(false);
        }}
      />

      {/* 16. Procreate Advanced Adjustment Modal (Curves, Color Balance, Gradient Map, etc.) */}
      <ProcreateAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        adjustmentType={selectedAdjustmentType}
        onApply={handleApplyAdjustmentModal}
        previewCanvas={layers.find((l) => l.id === activeLayerId)?.canvas}
      />

      {/* 17. Procreate 3D Model Painting Studio */}
      <Procreate3DViewer
        isOpen={show3DViewer}
        onClose={() => setShow3DViewer(false)}
        currentColor={primaryColor}
        currentBrushSize={brushSize}
        activeCanvasTexture={layers.find((l) => l.visible)?.canvas.toDataURL()}
      />

      {/* 18. Procreate Interactive Time-lapse Player */}
      <ProcreateTimelapseModal
        isOpen={showTimelapseModal}
        onClose={() => setShowTimelapseModal(false)}
        snapshots={timelapseSnapshots}
      />

      {/* 19. Procreate Gallery Modal */}
      <ProcreateGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        currentArtworkName={currentProject?.name || 'Sem Título'}
        currentArtworkPreview={
          layers.find((l) => l.visible)?.canvas.toDataURL()
        }
        onSelectArtwork={async (id) => {
          const p = await getProjectById(id);
          if (p) {
            await loadProject(p);
          }
        }}
        onCreateNewCanvas={async (preset) => {
          const newProj = createNewDefaultProject(
            preset.name.split(' (')[0],
            preset.width,
            preset.height,
            'blank',
            '#ffffff'
          );
          await saveProject(newProj);
          const list = await getAllProjects();
          setProjectsList(list);
          await loadProject(newProj);
        }}
      />
    </div>
  );
}
