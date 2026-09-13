import { Point, BrushPresetId, SymmetryMode, ShapeType } from '../types';

export function getEffectiveRadius(baseSize: number, pressure: number, presetId: BrushPresetId): number {
  const p = Math.max(0.15, Math.min(1.0, pressure));
  switch (presetId) {
    case 'pencil_6b':
    case 'pencil_hb':
    case 'peppermint':
    case 'pencil':
      return Math.max(1, (baseSize * (0.5 + 0.6 * p)) / 2);
    case 'technical_pencil':
    case 'technical_pen':
      return Math.max(1, baseSize / 2); // Constant width
    case 'studio_pen':
    case 'pen':
    case 'syrup':
    case 'gel_pen':
    case 'script':
      return Math.max(1, (baseSize * (0.2 + 1.1 * p)) / 2);
    case 'dry_ink':
    case 'ink':
      return Math.max(1, (baseSize * (0.3 + 0.9 * p)) / 2);
    case 'monoline':
      return Math.max(1, baseSize / 2);
    case 'highlighter':
      return baseSize / 2;
    case 'charcoal':
    case 'blackburn':
    case 'pastel':
    case 'watercolour':
    case 'watercolor':
    case 'oil_paint':
    case 'oil':
    case 'gouache':
    case 'wet_acrylic':
    case 'round_brush':
    case 'flat_brush':
      return Math.max(2, (baseSize * (0.4 + 0.7 * p)) / 2);
    case 'soft_airbrush':
    case 'hard_airbrush':
    case 'airbrush':
      return Math.max(2, (baseSize * (0.4 + 0.7 * p)) / 2);
    case 'calligraphy':
      return Math.max(2, (baseSize * (0.4 + 0.8 * p)) / 2);
    case 'neon':
    case 'lightpen':
    case 'flare':
      return Math.max(2, (baseSize * (0.3 + 0.9 * p)) / 2);
    default:
      return Math.max(1, (baseSize * (0.5 + 0.5 * p)) / 2);
  }
}

/**
 * Draw a continuous segment between p1 and p2 with brush styling
 */
export function drawBrushSegment(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  presetId: BrushPresetId,
  color: string,
  baseSize: number,
  opacity: number
) {
  ctx.save();

  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const steps = Math.max(1, Math.ceil(dist / 2));

  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  if (
    presetId === 'pencil_6b' ||
    presetId === 'pencil_hb' ||
    presetId === 'peppermint' ||
    presetId === 'pencil'
  ) {
    ctx.globalAlpha = opacity * 0.75;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      const p = p1.pressure + (p2.pressure - p1.pressure) * t;
      const rad = getEffectiveRadius(baseSize, p, presetId);

      // Graphite speckles
      const specks = Math.max(3, Math.floor(rad * 2.2));
      for (let s = 0; s < specks; s++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * rad;
        const jx = x + Math.cos(angle) * r;
        const jy = y + Math.sin(angle) * r;
        ctx.fillRect(jx, jy, 1.2, 1.2);
      }
    }
  } else if (presetId === 'charcoal' || presetId === 'blackburn' || presetId === 'pastel') {
    ctx.globalAlpha = opacity * 0.6;
    for (let i = 0; i <= steps; i += 2) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      const rad = getEffectiveRadius(baseSize, p1.pressure, presetId);

      const specks = Math.max(8, Math.floor(rad * 3));
      for (let s = 0; s < specks; s++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * rad;
        ctx.fillRect(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1.8, 1.8);
      }
    }
  } else if (presetId === 'noise_brush') {
    ctx.globalAlpha = opacity * 0.5;
    for (let i = 0; i <= steps; i += 3) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      const rad = getEffectiveRadius(baseSize, p1.pressure, presetId);
      for (let s = 0; s < rad * 4; s++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * rad;
        ctx.fillRect(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1.5, 1.5);
      }
    }
  } else if (presetId === 'soft_airbrush' || presetId === 'airbrush' || presetId === 'hard_airbrush') {
    for (let i = 0; i <= steps; i += 3) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      const rad = getEffectiveRadius(baseSize, p1.pressure, presetId);

      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalAlpha = opacity * (presetId === 'hard_airbrush' ? 0.2 : 0.08);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (presetId === 'watercolour' || presetId === 'watercolor') {
    for (let i = 0; i <= steps; i += 3) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      const rad = getEffectiveRadius(baseSize, p1.pressure, presetId);

      const grad = ctx.createRadialGradient(x, y, rad * 0.25, x, y, rad);
      grad.addColorStop(0, color);
      grad.addColorStop(0.85, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalAlpha = opacity * 0.12;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (presetId === 'neon' || presetId === 'lightpen' || presetId === 'flare') {
    // Glow effect
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const rad = getEffectiveRadius(baseSize, (p1.pressure + p2.pressure) / 2, presetId);

    // Outer glow
    ctx.save();
    ctx.globalAlpha = opacity * 0.35;
    ctx.lineWidth = rad * 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();

    // Inner bright core
    ctx.save();
    ctx.globalAlpha = opacity * 0.9;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, rad * 0.6);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  } else if (presetId === 'calligraphy') {
    ctx.globalAlpha = opacity;
    const rad = getEffectiveRadius(baseSize, p1.pressure, 'calligraphy');
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4); // 45 degree angle chisel
      ctx.fillRect(-rad, -rad * 0.2, rad * 2, rad * 0.4);
      ctx.restore();
    }
  } else if (presetId === 'flat_brush') {
    ctx.globalAlpha = opacity;
    const rad = getEffectiveRadius(baseSize, p1.pressure, 'flat_brush');
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      ctx.save();
      ctx.translate(x, y);
      ctx.fillRect(-rad, -rad * 0.3, rad * 2, rad * 0.6);
      ctx.restore();
    }
  } else {
    // Studio pen, syrup, technical pen, monoline, etc.
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const rad = getEffectiveRadius(baseSize, (p1.pressure + p2.pressure) / 2, presetId);
    ctx.lineWidth = rad * 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Eraser stroke
 */
export function drawEraserSegment(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  baseSize: number,
  opacity: number = 1
) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = opacity;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const rad = Math.max(1, (baseSize * (0.6 + 0.4 * p2.pressure)));
  ctx.lineWidth = rad;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Smudge tool: samples pixels and paints them softly along the direction of motion
 */
export function drawSmudgeSegment(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  baseSize: number,
  opacity: number
) {
  const rad = Math.max(4, Math.floor(baseSize / 2));
  const sampleX = Math.round(p1.x - rad);
  const sampleY = Math.round(p1.y - rad);
  const size = rad * 2;

  try {
    const imgData = ctx.getImageData(sampleX, sampleY, size, size);
    ctx.save();
    ctx.globalAlpha = Math.min(0.4, opacity * 0.5);

    // Create temp offscreen canvas to stamp the sampled image at p2
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(imgData, 0, 0);

      // Create soft mask
      tempCtx.globalCompositeOperation = 'destination-in';
      const grad = tempCtx.createRadialGradient(rad, rad, 0, rad, rad, rad);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      tempCtx.fillStyle = grad;
      tempCtx.fillRect(0, 0, size, size);

      ctx.drawImage(tempCanvas, p2.x - rad, p2.y - rad);
    }
    ctx.restore();
  } catch (e) {
    // Ignore bounds error
  }
}

/**
 * Get mirrored points for symmetry
 */
export function getSymmetricPoints(
  pt: Point,
  width: number,
  height: number,
  mode: SymmetryMode
): Point[] {
  if (mode === 'none') return [pt];

  const points: Point[] = [pt];
  const cx = width / 2;
  const cy = height / 2;

  if (mode === 'vertical') {
    points.push({ ...pt, x: width - pt.x });
  } else if (mode === 'horizontal') {
    points.push({ ...pt, y: height - pt.y });
  } else if (mode === 'quad') {
    points.push({ ...pt, x: width - pt.x });
    points.push({ ...pt, y: height - pt.y });
    points.push({ ...pt, x: width - pt.x, y: height - pt.y });
  } else if (mode === 'radial') {
    // 8-way radial symmetry
    const dx = pt.x - cx;
    const dy = pt.y - cy;
    const angles = [
      Math.PI / 4,
      Math.PI / 2,
      (3 * Math.PI) / 4,
      Math.PI,
      (5 * Math.PI) / 4,
      (3 * Math.PI) / 2,
      (7 * Math.PI) / 4,
    ];

    angles.forEach((a) => {
      const rx = dx * Math.cos(a) - dy * Math.sin(a);
      const ry = dx * Math.sin(a) + dy * Math.cos(a);
      points.push({ ...pt, x: cx + rx, y: cy + ry });
    });
  }

  return points;
}

/**
 * Flood fill with tolerance
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance: number = 32
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Convert hex to rgb
  const hex = fillColorHex.replace('#', '');
  const fr = parseInt(hex.substring(0, 2), 16) || 0;
  const fg = parseInt(hex.substring(2, 4), 16) || 0;
  const fb = parseInt(hex.substring(4, 6), 16) || 0;
  const fa = 255;

  const startPos = (Math.floor(startY) * width + Math.floor(startX)) * 4;
  const sr = data[startPos];
  const sg = data[startPos + 1];
  const sb = data[startPos + 2];
  const sa = data[startPos + 3];

  // If already matches fill color, return
  if (
    Math.abs(sr - fr) <= 3 &&
    Math.abs(sg - fg) <= 3 &&
    Math.abs(sb - fb) <= 3 &&
    Math.abs(sa - fa) <= 3
  ) {
    return;
  }

  function colorMatch(pos: number): boolean {
    const r = data[pos];
    const g = data[pos + 1];
    const b = data[pos + 2];
    const a = data[pos + 3];
    return (
      Math.abs(r - sr) <= tolerance &&
      Math.abs(g - sg) <= tolerance &&
      Math.abs(b - sb) <= tolerance &&
      Math.abs(a - sa) <= tolerance
    );
  }

  const queue: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
  const visited = new Uint8Array(width * height);

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pos = idx * 4;
    if (!colorMatch(pos)) continue;

    data[pos] = fr;
    data[pos + 1] = fg;
    data[pos + 2] = fb;
    data[pos + 3] = fa;

    if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
    if (x < width - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
    if (y > 0 && !visited[idx - width]) queue.push([x, y - 1]);
    if (y < height - 1 && !visited[idx + width]) queue.push([x, y + 1]);
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Geometric shape rendering
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeType,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth: number,
  fill: boolean = false
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();

  if (shape === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  } else if (shape === 'arrow') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLen = Math.max(12, lineWidth * 3.5);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowLen * Math.cos(angle - Math.PI / 6),
      y2 - arrowLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - arrowLen * Math.cos(angle + Math.PI / 6),
      y2 - arrowLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  } else if (shape === 'rect') {
    const rx = Math.min(x1, x2);
    const ry = Math.min(y1, y2);
    const rw = Math.abs(x2 - x1);
    const rh = Math.abs(y2 - y1);
    if (fill) ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);
  } else if (shape === 'circle') {
    const rx = Math.min(x1, x2);
    const ry = Math.min(y1, y2);
    const rw = Math.abs(x2 - x1);
    const rh = Math.abs(y2 - y1);
    const cx = rx + rw / 2;
    const cy = ry + rh / 2;
    ctx.ellipse(cx, cy, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    if (fill) ctx.fill();
    ctx.stroke();
  } else if (shape === 'triangle') {
    const cx = (x1 + x2) / 2;
    ctx.moveTo(cx, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
  } else if (shape === 'star') {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const outerR = Math.hypot(x2 - x1, y2 - y1) / 2;
    const innerR = outerR * 0.45;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / points - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export interface QuickShapeResult {
  type: 'line' | 'circle' | 'ellipse' | 'rect' | 'triangle' | 'arc';
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  extraPoints?: { x: number; y: number }[];
}

/**
 * QuickShape detection algorithm: recognizes line, circle, ellipse, rect, triangle, arc
 */
export function detectQuickShape(points: Point[]): QuickShapeResult | null {
  if (points.length < 8) return null;

  const start = points[0];
  const end = points[points.length - 1];
  const startEndDist = Math.hypot(end.x - start.x, end.y - start.y);

  // Compute total path length
  let totalLength = 0;
  let minX = points[0].x, maxX = points[0].x;
  let minY = points[0].y, maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    totalLength += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    minX = Math.min(minX, points[i].x);
    maxX = Math.max(maxX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxY = Math.max(maxY, points[i].y);
  }

  // 1. Line detection: ratio of start-to-end distance to total stroke length is close to 1
  if (totalLength > 30 && startEndDist / totalLength > 0.88) {
    return {
      type: 'line',
      p1: { x: start.x, y: start.y },
      p2: { x: end.x, y: end.y },
    };
  }

  // 2. Arc detection: open stroke with curved trajectory
  if (totalLength > 40 && startEndDist / totalLength > 0.55 && startEndDist / totalLength < 0.88) {
    return {
      type: 'arc',
      p1: { x: start.x, y: start.y },
      p2: { x: end.x, y: end.y },
      extraPoints: [{ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }],
    };
  }

  // 3. Closed shape detection (start & end are close together)
  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  const isClosed = startEndDist < Math.max(bboxW, bboxH) * 0.38;

  if (isClosed && bboxW > 20 && bboxH > 20) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = bboxW / 2;
    const ry = bboxH / 2;

    let circleError = 0;
    for (let i = 0; i < points.length; i++) {
      const normX = (points[i].x - cx) / Math.max(1, rx);
      const normY = (points[i].y - cy) / Math.max(1, ry);
      const distFrom1 = Math.abs(Math.hypot(normX, normY) - 1);
      circleError += distFrom1;
    }
    circleError /= points.length;

    // Circle or Ellipse
    if (circleError < 0.24) {
      const aspectRatio = Math.min(bboxW, bboxH) / Math.max(bboxW, bboxH);
      return {
        type: aspectRatio > 0.82 ? 'circle' : 'ellipse',
        p1: { x: minX, y: minY },
        p2: { x: maxX, y: maxY },
      };
    }

    // Triangle detection: check for 3 major directional turns
    let directionChanges = 0;
    for (let i = 2; i < points.length - 2; i += 2) {
      const v1x = points[i].x - points[i - 2].x;
      const v1y = points[i].y - points[i - 2].y;
      const v2x = points[i + 2].x - points[i].x;
      const v2y = points[i + 2].y - points[i].y;
      const angle = Math.abs(Math.atan2(v2y, v2x) - Math.atan2(v1y, v1x));
      if (angle > 0.8 && angle < 2.5) {
        directionChanges++;
      }
    }

    if (directionChanges >= 2 && directionChanges <= 5) {
      return {
        type: 'triangle',
        p1: { x: cx, y: minY },
        p2: { x: maxX, y: maxY },
        extraPoints: [{ x: minX, y: maxY }],
      };
    }

    // Default to Rectangle
    return {
      type: 'rect',
      p1: { x: minX, y: minY },
      p2: { x: maxX, y: maxY },
    };
  }

  return null;
}
