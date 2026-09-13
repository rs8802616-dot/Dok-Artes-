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
  AnimationFrameData
} from '../types';
import {
  drawBrushSegment,
  drawEraserSegment,
  drawSmudgeSegment,
  getSymmetricPoints,
  floodFill,
  drawShape,
  detectQuickShape
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
  onionSkinEnabled: boolean;
  frames?: AnimationFrameData[];
  currentFrameIndex?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleZen?: () => void;
  onQuickShapeDetected?: (shapeName: string) => void;
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
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
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

  useEffect(() => {
    compositeLayers();
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

    // QuickShape timer: if holding stationary for 650ms, detect shape!
    if (quickShapeTimer.current) clearTimeout(quickShapeTimer.current);
    quickShapeTimer.current = setTimeout(() => {
      if (isDrawing.current && currentStrokePoints.current.length > 8) {
        const detected = detectQuickShape(currentStrokePoints.current);
        if (detected) {
          // Render QuickShape guide on preview canvas
          const pCanvas = previewCanvasRef.current;
          if (pCanvas) {
            const pCtx = pCanvas.getContext('2d');
            if (pCtx) {
              pCtx.clearRect(0, 0, width, height);
              drawShape(
                pCtx,
                detected.type === 'line' ? 'line' : detected.type === 'circle' ? 'circle' : 'rect',
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
        }
      }
    }, 650);
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
      compositeLayers();
    } else if (currentTool === 'eraser') {
      const last = lastPoint.current;
      const symLast = getSymmetricPoints(last, width, height, symmetryMode);
      const symCurrent = getSymmetricPoints(pt, width, height, symmetryMode);

      for (let i = 0; i < symLast.length; i++) {
        drawEraserSegment(activeLayer.ctx, symLast[i], symCurrent[i], brushSize, brushOpacity);
      }
      compositeLayers();
    } else if (currentTool === 'smudge') {
      drawSmudgeSegment(activeLayer.ctx, lastPoint.current, pt, brushSize, brushOpacity);
      compositeLayers();
    }

    lastPoint.current = pt;
  };

  // Pointer Up handler
  const handlePointerUp = (e: React.PointerEvent) => {
    if (quickShapeTimer.current) clearTimeout(quickShapeTimer.current);

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

    // Check if QuickShape detected
    const points = currentStrokePoints.current;
    if (currentTool === 'brush' && points.length > 10) {
      const detected = detectQuickShape(points);
      if (detected) {
        drawShape(
          activeLayer.ctx,
          detected.type === 'line' ? 'line' : detected.type === 'circle' ? 'circle' : 'rect',
          detected.p1.x,
          detected.p1.y,
          detected.p2.x,
          detected.p2.y,
          brushColor,
          brushSize,
          false
        );
        const name =
          detected.type === 'line'
            ? 'Linha Criada'
            : detected.type === 'circle'
            ? 'Círculo Criado'
            : 'Retângulo Criado';
        onQuickShapeDetected?.(name);
      }
    } else if (currentTool === 'shapes' && points.length > 0) {
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
