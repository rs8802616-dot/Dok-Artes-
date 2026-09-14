import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Layer,
  ToolType,
  BrushPresetId,
  ShapeType,
  PaperTemplate,
  SymmetryMode,
  Point,
  TextObject,
  TransformSelection,
  AnimationFrameData,
  QuickShapeData
} from '../types';
import {
  drawBrushSegment,
  drawEraserSegment,
  drawSmudgeSegment,
  getSymmetricPoints,
  floodFill,
  drawShape,
  detectQuickShape,
  QuickShapeResult
} from '../utils/drawingEngine';
import { renderPaperBackground } from '../utils/paperRenderer';

interface CanvasViewportProps {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  currentTool: ToolType;
  brushPresetId: BrushPresetId;
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  smoothing: number;
  pressureEnabled: boolean;
  paperTemplate: PaperTemplate;
  backgroundColor: string;
  symmetryMode: SymmetryMode;
  showGrid: boolean;
  activeShape: ShapeType;
  zoom: number;
  panOffset: { x: number; y: number };
  onUpdatePanZoom: (pan: { x: number; y: number }, zoom: number) => void;
  onPickColor: (hex: string) => void;
  onCommitStroke: () => void;
  onionSkinEnabled?: boolean;
  frames?: AnimationFrameData[];
  currentFrameIndex?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleZen?: () => void;
  onQuickShapeDetected?: (shapeName: string, shapeData?: QuickShapeData) => void;
}

export function CanvasViewport({
  width,
  height,
  layers,
  activeLayerId,
  currentTool,
  brushPresetId,
  brushSize,
  brushOpacity,
  brushColor,
  smoothing,
  pressureEnabled,
  paperTemplate,
  backgroundColor,
  symmetryMode,
  showGrid,
  activeShape,
  zoom,
  panOffset,
  onUpdatePanZoom,
  onPickColor,
  onCommitStroke,
  onionSkinEnabled,
  frames,
  currentFrameIndex = 0,
  onUndo,
  onRedo,
  onToggleZen,
  onQuickShapeDetected,
}: CanvasViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Gesture tracking
  const touchState = useRef<{
    startDist: number;
    startZoom: number;
    startPan: { x: number; y: number };
    startMid: { x: number; y: number };
    touchCount: number;
    touchStartTime: number;
    didMove: boolean;
  }>({
    startDist: 0,
    startZoom: 1,
    startPan: { x: 0, y: 0 },
    startMid: { x: 0, y: 0 },
    touchCount: 0,
    touchStartTime: 0,
    didMove: false,
  });

  // Stroke tracking
  const isDrawing = useRef(false);
  const isPanning = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const currentStrokePoints = useRef<Point[]>([]);
  const strokeStartTime = useRef<number>(0);
  const quickShapeTimer = useRef<NodeJS.Timeout | null>(null);

  // QuickShape Procreate hold & snap tracking
  const preStrokeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const quickShapeActive = useRef<boolean>(false);
  const activeQuickShapeData = useRef<QuickShapeResult | null>(null);
  const stationaryAnchor = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // High-performance canvas rendering refs (reusable offscreen canvas & RAF throttling)
  const clipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeRafId = useRef<number | null>(null);

  // Text Tool State
  const [activeText, setActiveText] = useState<TextObject | null>(null);

  // Transform / Selection State
  const [selection, setSelection] = useState<TransformSelection>({
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    offsetX: 0,
    offsetY: 0,
    isFloating: false,
  });

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // Render Paper Background
  useEffect(() => {
    const canvas = paperCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderPaperBackground(ctx, width, height, paperTemplate, backgroundColor);
  }, [width, height, paperTemplate, backgroundColor]);

  // Composite Layers onto the display canvas
  const compositeLayers = useCallback(() => {
    const compositeCanvas = compositeCanvasRef.current;
    if (!compositeCanvas) return;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Render Onion Skinning if enabled and animation frames exist
    if (onionSkinEnabled && frames && frames.length > 1) {
      // Previous frame in ghost red
      const prevIdx = currentFrameIndex > 0 ? currentFrameIndex - 1 : frames.length - 1;
      const prevSnap = frames[prevIdx]?.layerSnapshots;
      if (prevSnap) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        Object.values(prevSnap).forEach((dataUrl) => {
          const img = new Image();
          img.src = dataUrl;
          if (img.complete && img.naturalWidth) {
            ctx.drawImage(img, 0, 0);
          }
        });
        ctx.restore();
      }
    }

    // Render layers in stack order (layer 0 is bottom, layer N is top)
    layers.forEach((layer, idx) => {
      if (!layer.visible) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;

      // Procreate Clipping Mask: mask pixels against base layer below
      if (layer.clippingMask && idx > 0) {
        const baseLayer = layers
          .slice(0, idx)
          .reverse()
          .find((l) => !l.clippingMask && l.visible);

        if (baseLayer) {
          if (!clipCanvasRef.current) {
            clipCanvasRef.current = document.createElement('canvas');
          }
          const tempCanvas = clipCanvasRef.current;
          if (tempCanvas.width !== width || tempCanvas.height !== height) {
            tempCanvas.width = width;
            tempCanvas.height = height;
          }
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
            tCtx.clearRect(0, 0, width, height);
            tCtx.drawImage(layer.canvas, 0, 0);
            tCtx.globalCompositeOperation = 'destination-in';
            tCtx.drawImage(baseLayer.canvas, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
          }
        } else {
          ctx.drawImage(layer.canvas, 0, 0);
        }
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }

      ctx.restore();
    });
  }, [layers, width, height, onionSkinEnabled, frames, currentFrameIndex]);

  // Throttled composite request via requestAnimationFrame for silky-smooth 60/120fps stylus drawing
  const requestComposite = useCallback(() => {
    if (compositeRafId.current === null) {
      compositeRafId.current = requestAnimationFrame(() => {
        compositeLayers();
        compositeRafId.current = null;
      });
    }
  }, [compositeLayers]);

  useEffect(() => {
    compositeLayers();
    return () => {
      if (compositeRafId.current !== null) {
        cancelAnimationFrame(compositeRafId.current);
        compositeRafId.current = null;
      }
    };
  }, [compositeLayers]);

  // Convert client viewport coordinates to Canvas coordinates
  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();

    // Center of container
    const centerX = rect.width / 2 + panOffset.x;
    const centerY = rect.height / 2 + panOffset.y;

    // Relative to canvas center
    const relX = (clientX - rect.left - centerX) / zoom + width / 2;
    const relY = (clientY - rect.top - centerY) / zoom + height / 2;

    return { x: relX, y: relY };
  };

  // Eyedropper sampling
  const sampleColorAt = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    const composite = compositeCanvasRef.current;
    const paper = paperCanvasRef.current;
    if (!composite || !paper) return;

    const x = Math.floor(coords.x);
    const y = Math.floor(coords.y);
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    // Sample from combined canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1;
    tempCanvas.height = 1;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(paper, -x, -y);
      tCtx.drawImage(composite, -x, -y);
      const pixel = tCtx.getImageData(0, 0, 1, 1).data;
      const hex =
        '#' +
        [pixel[0], pixel[1], pixel[2]]
          .map((c) => c.toString(16).padStart(2, '0'))
          .join('');
      onPickColor(hex);
    }
  };

  // Procreate QuickShape snap trigger
  const triggerQuickShapeSnap = useCallback(() => {
    if (!isDrawing.current || currentTool !== 'brush' || currentStrokePoints.current.length < 8) return;
    if (!activeLayer || activeLayer.locked) return;

    const detected = detectQuickShape(currentStrokePoints.current);
    if (!detected) return;

    quickShapeActive.current = true;
    activeQuickShapeData.current = detected;

    // 1. Erase the crooked stroke from activeLayer.ctx completely!
    if (preStrokeCanvasRef.current) {
      activeLayer.ctx.clearRect(0, 0, width, height);
      activeLayer.ctx.drawImage(preStrokeCanvasRef.current, 0, 0);
      compositeLayers();
    }

    // 2. Render clean shape guide on previewCanvas
    const pCanvas = previewCanvasRef.current;
    if (pCanvas) {
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        pCtx.clearRect(0, 0, width, height);
        drawShape(
          pCtx,
          detected.type === 'circle'
            ? 'circle'
            : detected.type === 'square'
            ? 'square'
            : detected.type === 'ellipse'
            ? 'ellipse'
            : detected.type === 'line'
            ? 'line'
            : detected.type === 'triangle'
            ? 'triangle'
            : 'rect',
          detected.p1.x,
          detected.p1.y,
          detected.p2.x,
          detected.p2.y,
          brushColor,
          brushSize,
          false
        );
      }
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (_) {}
    }

    const shapeName =
      detected.type === 'line'
        ? 'Linha Criada'
        : detected.type === 'circle'
        ? 'Círculo Criado'
        : detected.type === 'ellipse'
        ? 'Elipse Criada'
        : detected.type === 'square'
        ? 'Quadrado Criado'
        : detected.type === 'triangle'
        ? 'Triângulo Criado'
        : 'Retângulo Criado';

    onQuickShapeDetected?.(shapeName, {
      type: detected.type,
      p1: detected.p1,
      p2: detected.p2,
      center: detected.center,
      radius: detected.radius,
      color: brushColor,
      lineWidth: brushSize,
      extraPoints: detected.extraPoints,
    });
  }, [activeLayer, brushColor, brushSize, compositeLayers, currentTool, height, onQuickShapeDetected, width]);

  // Bake active text onto layer
  const commitTextToLayer = () => {
    if (!activeText || !activeLayer || !activeText.text.trim()) {
      setActiveText(null);
      return;
    }
    const ctx = activeLayer.ctx;
    ctx.save();
    ctx.font = `${activeText.bold ? 'bold ' : ''}${activeText.italic ? 'italic ' : ''}${activeText.fontSize}px ${activeText.fontFamily}`;
    ctx.fillStyle = activeText.color;
    ctx.textBaseline = 'top';

    const lines = activeText.text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, activeText.x, activeText.y + i * (activeText.fontSize * 1.25));
    });

    ctx.restore();
    setActiveText(null);
    compositeLayers();
    onCommitStroke();
  };

  // Pointer Down handler
  const handlePointerDown = (e: React.PointerEvent) => {
    const isPen = e.pointerType === 'pen';
    const rawPressure = isPen || pressureEnabled ? e.pressure || 0.5 : 0.8;

    // Hand tool or middle mouse or spacebar -> Pan
    if (currentTool === 'hand' || e.button === 1) {
      isPanning.current = true;
      lastPoint.current = { x: e.clientX, y: e.clientY, pressure: 1 };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Eyedropper tool
    if (currentTool === 'eyedropper') {
      sampleColorAt(e.clientX, e.clientY);
      return;
    }

    // Text tool
    if (currentTool === 'text') {
      if (activeText) commitTextToLayer();
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setActiveText({
        id: 'txt_' + Date.now(),
        x: coords.x,
        y: coords.y,
        text: 'Anotação FreeNote',
        fontSize: Math.max(16, brushSize * 1.5),
        fontFamily: 'Plus Jakarta Sans',
        color: brushColor,
        bold: false,
        italic: false,
      });
      return;
    }

    // Selection tool
    if (currentTool === 'select') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      // If clicking inside active selection, start dragging it
      if (
        selection.active &&
        coords.x >= Math.min(selection.startX, selection.endX) + selection.offsetX &&
        coords.x <= Math.max(selection.startX, selection.endX) + selection.offsetX &&
        coords.y >= Math.min(selection.startY, selection.endY) + selection.offsetY &&
        coords.y <= Math.max(selection.startY, selection.endY) + selection.offsetY
      ) {
        setSelection((prev) => ({
          ...prev,
          dragStartX: coords.x,
          dragStartY: coords.y,
          isFloating: true,
        }));
      } else {
        // Start new selection box
        setSelection({
          active: true,
          startX: coords.x,
          startY: coords.y,
          endX: coords.x,
          endY: coords.y,
          offsetX: 0,
          offsetY: 0,
          isFloating: false,
        });
      }
      isDrawing.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    if (!activeLayer || activeLayer.locked) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    const startPt: Point = {
      x: coords.x,
      y: coords.y,
      pressure: rawPressure,
      time: Date.now(),
    };

    // Flood Fill
    if (currentTool === 'fill') {
      floodFill(activeLayer.ctx, coords.x, coords.y, brushColor);
      compositeLayers();
      onCommitStroke();
      return;
    }

    // Save clean active layer snapshot before stroke begins
    if (!preStrokeCanvasRef.current) {
      preStrokeCanvasRef.current = document.createElement('canvas');
    }
    preStrokeCanvasRef.current.width = width;
    preStrokeCanvasRef.current.height = height;
    const preCtx = preStrokeCanvasRef.current.getContext('2d');
    if (preCtx && activeLayer) {
      preCtx.clearRect(0, 0, width, height);
      preCtx.drawImage(activeLayer.canvas, 0, 0);
    }

    quickShapeActive.current = false;
    activeQuickShapeData.current = null;
    stationaryAnchor.current = { x: coords.x, y: coords.y, time: Date.now() };

    isDrawing.current = true;
    lastPoint.current = startPt;
    currentStrokePoints.current = [startPt];
    strokeStartTime.current = Date.now();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Initial dot for brush or eraser
    if (currentTool === 'brush') {
      activeLayer.ctx.globalCompositeOperation = activeLayer.alphaLocked ? 'source-atop' : 'source-over';
      const symPoints = getSymmetricPoints(startPt, width, height, symmetryMode);
      symPoints.forEach((pt) => {
        drawBrushSegment(
          activeLayer.ctx,
          pt,
          { ...pt, x: pt.x + 0.1, y: pt.y + 0.1 },
          brushPresetId,
          brushColor,
          brushSize,
          brushOpacity
        );
      });
      compositeLayers();
    } else if (currentTool === 'eraser') {
      const symPoints = getSymmetricPoints(startPt, width, height, symmetryMode);
      symPoints.forEach((pt) => {
        drawEraserSegment(
          activeLayer.ctx,
          pt,
          { ...pt, x: pt.x + 0.1, y: pt.y + 0.1 },
          brushSize,
          brushOpacity
        );
      });
      compositeLayers();
    }

    // QuickShape timer: if holding stationary for 480ms, detect and snap shape!
    if (quickShapeTimer.current) clearTimeout(quickShapeTimer.current);
    if (currentTool === 'brush') {
      quickShapeTimer.current = setTimeout(() => {
        triggerQuickShapeSnap();
      }, 480);
    }
  };

  // Pointer Move handler
  const handlePointerMove = (e: React.PointerEvent) => {
    // Panning
    if (isPanning.current && lastPoint.current) {
      const dx = e.clientX - lastPoint.current.x;
      const dy = e.clientY - lastPoint.current.y;
      onUpdatePanZoom({ x: panOffset.x + dx, y: panOffset.y + dy }, zoom);
      lastPoint.current = { x: e.clientX, y: e.clientY, pressure: 1 };
      return;
    }

    if (!isDrawing.current) return;

    // Selection tool dragging
    if (currentTool === 'select') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      if (selection.isFloating && selection.dragStartX !== undefined && selection.dragStartY !== undefined) {
        const dx = coords.x - selection.dragStartX;
        const dy = coords.y - selection.dragStartY;
        setSelection((prev) => ({
          ...prev,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy,
          dragStartX: coords.x,
          dragStartY: coords.y,
        }));
      } else {
        setSelection((prev) => ({
          ...prev,
          endX: coords.x,
          endY: coords.y,
        }));
      }
      return;
    }

    if (!activeLayer || activeLayer.locked) return;

    const isPen = e.pointerType === 'pen';
    const rawPressure = isPen || pressureEnabled ? e.pressure || 0.5 : 0.8;
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // Apply smoothing / streamline
    let pt: Point = {
      x: coords.x,
      y: coords.y,
      pressure: rawPressure,
      time: Date.now(),
    };

    if (smoothing > 0 && lastPoint.current) {
      const factor = 1 - Math.min(0.9, smoothing);
      pt.x = lastPoint.current.x + (coords.x - lastPoint.current.x) * factor;
      pt.y = lastPoint.current.y + (coords.y - lastPoint.current.y) * factor;
      pt.pressure = lastPoint.current.pressure + (rawPressure - lastPoint.current.pressure) * factor;
    }

    currentStrokePoints.current.push(pt);

    // 1. IF QUICKSHAPE IS ACTIVE (Holding & Dragging to resize/orient shape):
    if (quickShapeActive.current && activeQuickShapeData.current) {
      const shape = activeQuickShapeData.current;
      const pCanvas = previewCanvasRef.current;
      if (!pCanvas) return;
      const pCtx = pCanvas.getContext('2d');
      if (!pCtx) return;

      if (shape.type === 'line') {
        let endX = coords.x;
        let endY = coords.y;
        const dx = coords.x - shape.p1.x;
        const dy = coords.y - shape.p1.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 15) {
          const angle = Math.atan2(dy, dx);
          const deg = ((angle * 180) / Math.PI + 360) % 360;
          const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
          for (const sa of snapAngles) {
            if (Math.abs(deg - sa) < 6 || Math.abs(deg - (sa - 360)) < 6) {
              const rad = (sa * Math.PI) / 180;
              endX = shape.p1.x + Math.cos(rad) * dist;
              endY = shape.p1.y + Math.sin(rad) * dist;
              break;
            }
          }
        }
        shape.p2 = { x: endX, y: endY };
      } else if (shape.type === 'circle') {
        const center = shape.center || {
          x: (shape.p1.x + shape.p2.x) / 2,
          y: (shape.p1.y + shape.p2.y) / 2,
        };
        const currentDist = Math.hypot(coords.x - center.x, coords.y - center.y);
        const newRadius = Math.max(6, currentDist);
        shape.radius = newRadius;
        shape.p1 = { x: center.x - newRadius, y: center.y - newRadius };
        shape.p2 = { x: center.x + newRadius, y: center.y + newRadius };
      } else if (shape.type === 'ellipse') {
        const center = shape.center || {
          x: (shape.p1.x + shape.p2.x) / 2,
          y: (shape.p1.y + shape.p2.y) / 2,
        };
        const rx = Math.max(6, Math.abs(coords.x - center.x));
        const ry = Math.max(6, Math.abs(coords.y - center.y));
        shape.p1 = { x: center.x - rx, y: center.y - ry };
        shape.p2 = { x: center.x + rx, y: center.y + ry };
      } else if (shape.type === 'square') {
        const center = shape.center || {
          x: (shape.p1.x + shape.p2.x) / 2,
          y: (shape.p1.y + shape.p2.y) / 2,
        };
        const side = Math.max(8, Math.max(Math.abs(coords.x - center.x), Math.abs(coords.y - center.y)));
        shape.p1 = { x: center.x - side, y: center.y - side };
        shape.p2 = { x: center.x + side, y: center.y + side };
      } else if (shape.type === 'rect') {
        shape.p2 = { x: coords.x, y: coords.y };
      } else if (shape.type === 'triangle') {
        shape.p2 = { x: coords.x, y: coords.y };
      }

      // Live redraw on preview canvas
      pCtx.clearRect(0, 0, width, height);
      drawShape(
        pCtx,
        shape.type === 'circle'
          ? 'circle'
          : shape.type === 'square'
          ? 'square'
          : shape.type === 'ellipse'
          ? 'ellipse'
          : shape.type === 'line'
          ? 'line'
          : shape.type === 'triangle'
          ? 'triangle'
          : 'rect',
        shape.p1.x,
        shape.p1.y,
        shape.p2.x,
        shape.p2.y,
        brushColor,
        brushSize,
        false
      );
      return;
    }

    // 2. CHECK HOLD TIMER FOR QUICKSHAPE:
    // If movement is detected, reset stationaryAnchor and refresh the 480ms hold timer
    const distFromAnchor = Math.hypot(coords.x - stationaryAnchor.current.x, coords.y - stationaryAnchor.current.y);
    if (distFromAnchor > 8) {
      stationaryAnchor.current = { x: coords.x, y: coords.y, time: Date.now() };
      if (quickShapeTimer.current) clearTimeout(quickShapeTimer.current);
      if (currentTool === 'brush') {
        quickShapeTimer.current = setTimeout(() => {
          triggerQuickShapeSnap();
        }, 480);
      }
    }

    // Live preview for Shapes
    if (currentTool === 'shapes') {
      const start = currentStrokePoints.current[0];
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const pCtx = previewCanvas.getContext('2d');
        if (pCtx) {
          pCtx.clearRect(0, 0, width, height);
          drawShape(
            pCtx,
            activeShape,
            start.x,
            start.y,
            pt.x,
            pt.y,
            brushColor,
            brushSize,
            false
          );
        }
      }
      return;
    }

    if (!lastPoint.current) {
      lastPoint.current = pt;
      return;
    }

    // Brush drawing
    if (currentTool === 'brush') {
      activeLayer.ctx.globalCompositeOperation = activeLayer.alphaLocked ? 'source-atop' : 'source-over';
      const last = lastPoint.current;
      const symLast = getSymmetricPoints(last, width, height, symmetryMode);
      const symCurrent = getSymmetricPoints(pt, width, height, symmetryMode);

      for (let i = 0; i < symLast.length; i++) {
        drawBrushSegment(
          activeLayer.ctx,
          symLast[i],
          symCurrent[i],
          brushPresetId,
          brushColor,
          brushSize,
          brushOpacity
        );
      }
      requestComposite();
    } else if (currentTool === 'eraser') {
      const last = lastPoint.current;
      const symLast = getSymmetricPoints(last, width, height, symmetryMode);
      const symCurrent = getSymmetricPoints(pt, width, height, symmetryMode);

      for (let i = 0; i < symLast.length; i++) {
        drawEraserSegment(activeLayer.ctx, symLast[i], symCurrent[i], brushSize, brushOpacity);
      }
      requestComposite();
    } else if (currentTool === 'smudge') {
      drawSmudgeSegment(activeLayer.ctx, lastPoint.current, pt, brushSize, brushOpacity);
      requestComposite();
    }

    lastPoint.current = pt;
  };

  // Pointer Up handler
  const handlePointerUp = (e: React.PointerEvent) => {
    if (quickShapeTimer.current) clearTimeout(quickShapeTimer.current);
    if (compositeRafId.current !== null) {
      cancelAnimationFrame(compositeRafId.current);
      compositeRafId.current = null;
    }

    if (isPanning.current) {
      isPanning.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      return;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Clear preview canvas
    const pCanvas = previewCanvasRef.current;
    if (pCanvas) {
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) pCtx.clearRect(0, 0, width, height);
    }

    if (currentTool === 'select') return;

    if (!activeLayer || activeLayer.locked) return;

    // IF QUICKSHAPE WAS TRIGGERED WHILE HOLDING:
    if (quickShapeActive.current && activeQuickShapeData.current) {
      // 1. Guarantee no crooked stroke trace by restoring preStroke canvas
      if (preStrokeCanvasRef.current) {
        activeLayer.ctx.clearRect(0, 0, width, height);
        activeLayer.ctx.drawImage(preStrokeCanvasRef.current, 0, 0);
      }

      // 2. Draw the final crisp geometric shape on activeLayer
      const finalShape = activeQuickShapeData.current;
      activeLayer.ctx.globalCompositeOperation = activeLayer.alphaLocked ? 'source-atop' : 'source-over';
      const shapeType =
        finalShape.type === 'circle'
          ? 'circle'
          : finalShape.type === 'square'
          ? 'square'
          : finalShape.type === 'ellipse'
          ? 'ellipse'
          : finalShape.type === 'line'
          ? 'line'
          : finalShape.type === 'triangle'
          ? 'triangle'
          : 'rect';

      const symP1 = getSymmetricPoints(finalShape.p1, width, height, symmetryMode);
      const symP2 = getSymmetricPoints(finalShape.p2, width, height, symmetryMode);
      for (let i = 0; i < symP1.length; i++) {
        drawShape(
          activeLayer.ctx,
          shapeType,
          symP1[i].x,
          symP1[i].y,
          symP2[i].x,
          symP2[i].y,
          brushColor,
          brushSize,
          false
        );
      }

      const shapeLabel =
        shapeType === 'circle'
          ? 'Círculo Criado'
          : shapeType === 'square'
          ? 'Quadrado Criado'
          : shapeType === 'ellipse'
          ? 'Elipse Criada'
          : shapeType === 'line'
          ? 'Linha Criada'
          : shapeType === 'triangle'
          ? 'Triângulo Criado'
          : 'Retângulo Criado';
      onQuickShapeDetected?.(shapeLabel, finalShape);

      quickShapeActive.current = false;
      activeQuickShapeData.current = null;
      currentStrokePoints.current = [];
      lastPoint.current = null;
      compositeLayers();
      onCommitStroke();
      return;
    }

    // IF SHAPES TOOL:
    const points = currentStrokePoints.current;
    if (currentTool === 'shapes' && points.length > 0) {
      const start = points[0];
      const end = points[points.length - 1];
      drawShape(
        activeLayer.ctx,
        activeShape,
        start.x,
        start.y,
        end.x,
        end.y,
        brushColor,
        brushSize,
        false
      );
    }

    // REGULAR FREEHAND STROKE (NO QuickShape hold):
    // Stroke is already drawn on activeLayer.ctx! Do not overwrite or replace!
    currentStrokePoints.current = [];
    lastPoint.current = null;
    compositeLayers();
    onCommitStroke();
  };

  // Mouse wheel for zoom & trackpad pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom with wheel
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.max(0.1, Math.min(10, zoom * zoomFactor));
      onUpdatePanZoom(panOffset, newZoom);
    } else {
      // Pan with trackpad
      onUpdatePanZoom(
        { x: panOffset.x - e.deltaX, y: panOffset.y - e.deltaY },
        zoom
      );
    }
  };

  // Touch Gesture Recognition (2-finger tap undo, 3-finger tap redo, 4-finger tap zen, pinch zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches;
    touchState.current.touchCount = touches.length;
    touchState.current.touchStartTime = Date.now();
    touchState.current.didMove = false;

    if (touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      touchState.current.startDist = Math.hypot(dx, dy);
      touchState.current.startZoom = zoom;
      touchState.current.startPan = { ...panOffset };
      touchState.current.startMid = {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touches = e.touches;
    if (touches.length === 2 && touchState.current.startDist > 0) {
      touchState.current.didMove = true;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchState.current.startDist;
      const newZoom = Math.max(0.1, Math.min(10, touchState.current.startZoom * ratio));

      const midX = (touches[0].clientX + touches[1].clientX) / 2;
      const midY = (touches[0].clientY + touches[1].clientY) / 2;
      const panDx = midX - touchState.current.startMid.x;
      const panDy = midY - touchState.current.startMid.y;

      onUpdatePanZoom(
        {
          x: touchState.current.startPan.x + panDx,
          y: touchState.current.startPan.y + panDy,
        },
        newZoom
      );
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const duration = Date.now() - touchState.current.touchStartTime;
    const initialCount = touchState.current.touchCount;

    // If quick tap without significant pinch movement
    if (!touchState.current.didMove && duration < 350) {
      if (initialCount === 2) {
        onUndo?.();
      } else if (initialCount === 3) {
        onRedo?.();
      } else if (initialCount === 4) {
        onToggleZen?.();
      }
    }
    touchState.current.startDist = 0;
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-hidden bg-[#0a0c10] flex items-center justify-center select-none cursor-crosshair touch-none"
    >
      {/* Canvas Transform Wrapper */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        }}
        className="relative shrink-0 transition-transform duration-75"
      >
        {/* 1. Paper Background */}
        <canvas
          ref={paperCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 block w-full h-full"
        />

        {/* 2. Composited Drawing Layers */}
        <canvas
          ref={compositeCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 block w-full h-full pointer-events-none"
        />

        {/* 3. Live Shape / Stroke Preview */}
        <canvas
          ref={previewCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 block w-full h-full pointer-events-none"
        />

        {/* 4. Symmetry Guide Lines Overlay */}
        {symmetryMode !== 'none' && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {(symmetryMode === 'vertical' || symmetryMode === 'quad' || symmetryMode === 'radial') && (
              <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-indigo-500/60 -translate-x-1/2" />
            )}
            {(symmetryMode === 'horizontal' || symmetryMode === 'quad' || symmetryMode === 'radial') && (
              <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-indigo-500/60 -translate-y-1/2" />
            )}
            {symmetryMode === 'radial' && (
              <>
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-indigo-400/40 -translate-x-1/2"
                  style={{ transform: 'rotate(45deg)' }}
                />
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-indigo-400/40 -translate-x-1/2"
                  style={{ transform: 'rotate(-45deg)' }}
                />
              </>
            )}
          </div>
        )}

        {/* 5. Grid Guide Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* 6. Active Text Object Editing Box */}
        {activeText && (
          <div
            style={{
              left: `${activeText.x}px`,
              top: `${activeText.y}px`,
            }}
            className="absolute z-20 pointer-events-auto bg-[#161a24]/95 border-2 border-violet-500 p-2 rounded-xl shadow-2xl min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 mb-2">
              <input
                type="number"
                min="10"
                max="140"
                value={activeText.fontSize}
                onChange={(e) =>
                  setActiveText({ ...activeText, fontSize: Number(e.target.value) })
                }
                className="w-14 bg-[#202736] border border-[#2e374a] text-xs text-white px-1.5 py-0.5 rounded font-mono"
              />
              <button
                onClick={() => setActiveText({ ...activeText, bold: !activeText.bold })}
                className={`px-2 py-0.5 text-xs rounded font-bold ${
                  activeText.bold ? 'bg-violet-600 text-white' : 'bg-[#202736] text-slate-300'
                }`}
              >
                B
              </button>
              <button
                onClick={() => setActiveText({ ...activeText, italic: !activeText.italic })}
                className={`px-2 py-0.5 text-xs rounded italic font-serif ${
                  activeText.italic ? 'bg-violet-600 text-white' : 'bg-[#202736] text-slate-300'
                }`}
              >
                I
              </button>
              <button
                onClick={commitTextToLayer}
                className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded ml-auto"
              >
                Fixar
              </button>
            </div>
            <textarea
              value={activeText.text}
              onChange={(e) => setActiveText({ ...activeText, text: e.target.value })}
              autoFocus
              className="w-full bg-transparent text-slate-100 resize border border-[#2d3648] rounded p-1.5 text-sm focus:outline-none"
              rows={3}
              style={{
                fontSize: `${activeText.fontSize}px`,
                fontWeight: activeText.bold ? 'bold' : 'normal',
                fontStyle: activeText.italic ? 'italic' : 'normal',
                color: activeText.color,
              }}
            />
          </div>
        )}

        {/* 7. Selection Marquee Box */}
        {selection.active && (
          <div
            style={{
              left: `${Math.min(selection.startX, selection.endX) + selection.offsetX}px`,
              top: `${Math.min(selection.startY, selection.endY) + selection.offsetY}px`,
              width: `${Math.abs(selection.endX - selection.startX)}px`,
              height: `${Math.abs(selection.endY - selection.startY)}px`,
            }}
            className="absolute border-2 border-dashed border-teal-400 bg-teal-500/10 pointer-events-none z-20"
          >
            <div className="absolute -top-6 left-0 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
              {Math.round(Math.abs(selection.endX - selection.startX))} ×{' '}
              {Math.round(Math.abs(selection.endY - selection.startY))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
