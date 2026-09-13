import { PaperTemplate } from '../types';

export function renderPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: PaperTemplate,
  customBgColor?: string
) {
  ctx.save();

  if (template === 'transparent') {
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  // Base background fill
  let bgColor = customBgColor || '#ffffff';
  let lineColor = '#e2e8f0';

  if (template === 'ruled') {
    bgColor = '#fcfcfc';
    lineColor = '#cbd5e1';
  } else if (template === 'grid') {
    bgColor = '#fcfcfc';
    lineColor = '#e2e8f0';
  } else if (template === 'dot') {
    bgColor = '#fafafa';
    lineColor = '#94a3b8';
  } else if (template === 'isometric') {
    bgColor = '#f8fafc';
    lineColor = '#e2e8f0';
  } else if (template === 'parchment') {
    bgColor = '#f7f1e1';
    lineColor = '#d9cbaf';
  } else if (template === 'dark_ruled') {
    bgColor = '#14171d';
    lineColor = '#2b313c';
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Pattern overlays
  if (template === 'ruled' || template === 'dark_ruled') {
    const lineSpacing = 36;
    const topMargin = 72;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    // Draw horizontal ruled lines
    for (let y = topMargin; y < height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Red left margin line (classic FreeNote/notebook margin)
    const marginX = 80;
    ctx.strokeStyle = template === 'dark_ruled' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, 0);
    ctx.lineTo(marginX, height);
    ctx.stroke();
  } else if (template === 'grid') {
    const gridSize = 28;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.8;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (template === 'dot') {
    const dotSpacing = 30;
    ctx.fillStyle = lineColor;
    const radius = 1.2;

    for (let x = dotSpacing; x < width; x += dotSpacing) {
      for (let y = dotSpacing; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (template === 'isometric') {
    const isoSize = 32;
    const h = isoSize * Math.sqrt(3);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.7;

    // Horizontal lines
    for (let y = 0; y < height; y += h) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Diagonal lines 60 degrees
    const diagCount = Math.ceil(width / isoSize) + Math.ceil(height / h) * 2;
    for (let i = -diagCount; i < diagCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * isoSize, 0);
      ctx.lineTo(i * isoSize + height / Math.sqrt(3), height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i * isoSize, 0);
      ctx.lineTo(i * isoSize - height / Math.sqrt(3), height);
      ctx.stroke();
    }
  } else if (template === 'parchment') {
    // Subtle organic vignette on parchment
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.3,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(180, 140, 90, 0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}
