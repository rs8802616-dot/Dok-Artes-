export function applyImageAdjustments(
  ctx: CanvasRenderingContext2D,
  adjustments: {
    brightness?: number; // -100 to 100, 0 default
    contrast?: number; // -100 to 100, 0 default
    saturation?: number; // -100 to 100, 0 default
    blur?: number; // 0 to 20
    invert?: boolean;
    grayscale?: boolean;
    sepia?: boolean;
    pixelate?: number; // 1 to 20
  }
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const brightness = adjustments.brightness ?? 0;
  const contrast = adjustments.contrast ?? 0;
  const saturation = adjustments.saturation ?? 0;
  const invert = adjustments.invert ?? false;
  const grayscale = adjustments.grayscale ?? false;
  const sepia = adjustments.sepia ?? false;

  const bFactor = brightness * 2.55;
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const sFactor = (saturation + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // Brightness
    r += bFactor;
    g += bFactor;
    b += bFactor;

    // Contrast
    r = cFactor * (r - 128) + 128;
    g = cFactor * (g - 128) + 128;
    b = cFactor * (b - 128) + 128;

    // Saturation
    if (sFactor !== 1) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;
    }

    // Invert
    if (adjustments.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // Grayscale
    if (adjustments.grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // Sepia
    if (adjustments.sepia) {
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = tr;
      g = tg;
      b = tb;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Pixelate effect if > 1
  if (adjustments.pixelate > 1) {
    const size = adjustments.pixelate;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.max(1, Math.floor(w / size));
    tempCanvas.height = Math.max(1, Math.floor(h / size));
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(ctx.canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(tempCanvas, 0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
    }
  }

  // Blur effect if > 0
  if (adjustments.blur > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.filter = `blur(${adjustments.blur}px)`;
      tCtx.drawImage(ctx.canvas, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }
}

/**
 * Procreate Curves Adjustment
 * Map RGB input values using parametric Bezier or control point transfer functions
 */
export function applyCurves(
  ctx: CanvasRenderingContext2D,
  curveMap: {
    r: number[]; // 256 values
    g: number[];
    b: number[];
  }
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = curveMap.r[data[i]] ?? data[i];
    data[i + 1] = curveMap.g[data[i + 1]] ?? data[i + 1];
    data[i + 2] = curveMap.b[data[i + 2]] ?? data[i + 2];
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Procreate Color Balance (Sombras, Meios-Tons, Realces)
 */
export function applyColorBalance(
  ctx: CanvasRenderingContext2D,
  cyanRed: number, // -100 to 100
  magentaGreen: number, // -100 to 100
  yellowBlue: number // -100 to 100
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const cr = cyanRed * 0.8;
  const mg = magentaGreen * 0.8;
  const yb = yellowBlue * 0.8;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    let r = data[i] + cr;
    let g = data[i + 1] + mg;
    let b = data[i + 2] + yb;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Procreate Gradient Map (Mapeamento de Gradiente)
 */
export function applyGradientMap(
  ctx: CanvasRenderingContext2D,
  colorStops: { pos: number; r: number; g: number; b: number }[]
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Precompute 256-step gradient lookup table
  const lutR = new Uint8Array(256);
  const lutG = new Uint8Array(256);
  const lutB = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let stop1 = colorStops[0];
    let stop2 = colorStops[colorStops.length - 1];

    for (let s = 0; s < colorStops.length - 1; s++) {
      if (t >= colorStops[s].pos && t <= colorStops[s + 1].pos) {
        stop1 = colorStops[s];
        stop2 = colorStops[s + 1];
        break;
      }
    }

    const range = Math.max(0.001, stop2.pos - stop1.pos);
    const factor = (t - stop1.pos) / range;

    lutR[i] = Math.round(stop1.r + (stop2.r - stop1.r) * factor);
    lutG[i] = Math.round(stop1.g + (stop2.g - stop1.g) * factor);
    lutB[i] = Math.round(stop1.b + (stop2.b - stop1.b) * factor);
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = lutR[lum];
    data[i + 1] = lutG[lum];
    data[i + 2] = lutB[lum];
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Procreate Noise (Ruído)
 */
export function applyNoise(ctx: CanvasRenderingContext2D, amount: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const factor = amount * 2.55;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const noise = (Math.random() - 0.5) * factor;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Procreate Sharpen (Nitidez via unsharp mask)
 */
export function applySharpen(ctx: CanvasRenderingContext2D, amount: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;

  const strength = (amount / 100) * 1.5;
  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0,
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (src[idx + 3] === 0) continue;

      let r = 0, g = 0, b = 0;
      let k = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pIdx = ((y + ky) * w + (x + kx)) * 4;
          const wgt = kernel[k++];
          r += src[pIdx] * wgt;
          g += src[pIdx + 1] * wgt;
          b += src[pIdx + 2] * wgt;
        }
      }
      dst[idx] = Math.max(0, Math.min(255, r));
      dst[idx + 1] = Math.max(0, Math.min(255, g));
      dst[idx + 2] = Math.max(0, Math.min(255, b));
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Procreate Liquify (Dissolver)
 * Modes: 'push' | 'twirlCW' | 'twirlCCW' | 'pinch' | 'expand' | 'reconstruct'
 */
export function applyLiquify(
  ctx: CanvasRenderingContext2D,
  mode: 'push' | 'twirlCW' | 'twirlCCW' | 'pinch' | 'expand' | 'reconstruct',
  centerX: number,
  centerY: number,
  radius: number,
  strength: number,
  deltaX: number = 0,
  deltaY: number = 0
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const startX = Math.max(0, Math.floor(centerX - radius));
  const startY = Math.max(0, Math.floor(centerY - radius));
  const endX = Math.min(w, Math.ceil(centerX + radius));
  const endY = Math.min(h, Math.ceil(centerY + radius));
  const patchW = endX - startX;
  const patchH = endY - startY;
  if (patchW <= 0 || patchH <= 0) return;

  const imgData = ctx.getImageData(startX, startY, patchW, patchH);
  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;

  const rSq = radius * radius;

  for (let py = 0; py < patchH; py++) {
    const gy = startY + py;
    const dy = gy - centerY;
    for (let px = 0; px < patchW; px++) {
      const gx = startX + px;
      const dx = gx - centerX;
      const distSq = dx * dx + dy * dy;

      if (distSq > rSq) continue;

      const dist = Math.sqrt(distSq);
      const falloff = Math.pow(1 - dist / radius, 2) * (strength / 100);

      let sampleX = gx;
      let sampleY = gy;

      if (mode === 'push') {
        sampleX -= deltaX * falloff * 1.5;
        sampleY -= deltaY * falloff * 1.5;
      } else if (mode === 'pinch') {
        sampleX += dx * falloff * 0.5;
        sampleY += dy * falloff * 0.5;
      } else if (mode === 'expand') {
        sampleX -= dx * falloff * 0.5;
        sampleY -= dy * falloff * 0.5;
      } else if (mode === 'twirlCW' || mode === 'twirlCCW') {
        const angle = (mode === 'twirlCW' ? 1 : -1) * falloff * Math.PI * 0.5;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        sampleX = centerX + dx * cosA - dy * sinA;
        sampleY = centerY + dx * sinA + dy * cosA;
      }

      const sPx = Math.round(sampleX - startX);
      const sPy = Math.round(sampleY - startY);

      if (sPx >= 0 && sPx < patchW && sPy >= 0 && sPy < patchH) {
        const dIdx = (py * patchW + px) * 4;
        const sIdx = (sPy * patchW + sPx) * 4;
        dst[dIdx] = src[sIdx];
        dst[dIdx + 1] = src[sIdx + 1];
        dst[dIdx + 2] = src[sIdx + 2];
        dst[dIdx + 3] = src[sIdx + 3];
      }
    }
  }

  ctx.putImageData(imgData, startX, startY);
}
