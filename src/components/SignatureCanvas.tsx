import { useEffect, useRef, useCallback } from 'react';
import { Download } from 'lucide-react';

interface SignatureCanvasProps {
  luckyName: string;
  /** kept for backward compat; luckyName is always the displayed text */
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  glowColor?: string;
  showDownload?: boolean;
}

const DIMS = {
  sm: { w: 280, h: 100, fontSize: 32 },
  md: { w: 360, h: 130, fontSize: 46 },
  lg: { w: 460, h: 160, fontSize: 58 },
};

// Primary: Dancing Script; fallback: Great Vibes, then generic cursive
const FONT_FAMILY = "'Dancing Script', 'Great Vibes', cursive";

function drawSignature(
  canvas: HTMLCanvasElement,
  luckyName: string,
  size: 'sm' | 'md' | 'lg',
  glowColor: string,
) {
  const { w, h, fontSize } = DIMS[size];
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Size canvas for DPR
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const displayName = luckyName || 'Hoki';

  // ── NAME TEXT ──────────────────────────────────────────────
  const fontSpec = `${fontSize}px ${FONT_FAMILY}`;
  ctx.font = fontSpec;
  ctx.textBaseline = 'alphabetic';

  const metrics = ctx.measureText(displayName);
  const textW = metrics.width;

  // Position: leave room on right for the swoosh
  const swooshSpace = w * 0.28;
  const totalWidth = textW + swooshSpace;
  const startX = Math.max(12, (w - totalWidth) / 2);
  const baseY = h * 0.63;

  // Outer glow pass (larger blur, lower alpha)
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 28;
  ctx.fillStyle = glowColor;
  ctx.font = fontSpec;
  ctx.fillText(displayName, startX, baseY);
  ctx.restore();

  // Main text pass
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.fillStyle = glowColor;
  ctx.font = fontSpec;
  ctx.fillText(displayName, startX, baseY);
  ctx.restore();

  // ── UNDERLINE FLOURISH ─────────────────────────────────────
  const textEndX = startX + textW;
  const descenderY = baseY + fontSize * 0.14;

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = glowColor;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startX - 6, descenderY);
  ctx.quadraticCurveTo(
    startX + textW * 0.5,
    descenderY + 7,
    textEndX + 6,
    descenderY - 1,
  );
  ctx.stroke();
  ctx.restore();

  // ── UPWARD SWOOSH (Garis Hoki) ────────────────────────────
  // Starts at end of name text, sweeps steeply up to top-right corner.
  const swooshSX = textEndX + 6;
  const swooshSY = baseY - fontSize * 0.12;   // near cap-height
  const swooshEX = w - 10;
  const swooshEY = h * 0.08;                  // near top-right

  // Two-segment bezier: initial drift right, then steep upward arc
  const cp1x = swooshSX + (swooshEX - swooshSX) * 0.18;
  const cp1y = swooshSY + fontSize * 0.08;    // slight dip to create natural pen lift
  const cp2x = swooshSX + (swooshEX - swooshSX) * 0.55;
  const cp2y = swooshEY + (swooshSY - swooshEY) * 0.5;

  // Outer glow
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = glowColor;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(swooshSX, swooshSY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, swooshEX, swooshEY);
  ctx.stroke();
  ctx.restore();

  // Main stroke
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(swooshSX, swooshSY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, swooshEX, swooshEY);
  ctx.stroke();

  // Arrow dot at tip
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(swooshEX, swooshEY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Two small tick marks indicating direction ↗
  const tickAngle = -Math.PI * 0.3;
  const tickLen = 9;
  for (let t = 0; t < 2; t++) {
    const ox = swooshEX - (t + 1) * 7;
    const oy = swooshEY + (t + 1) * 4;
    ctx.beginPath();
    ctx.globalAlpha = 0.7 - t * 0.2;
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(tickAngle) * tickLen, oy + Math.sin(tickAngle) * tickLen);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

export default function SignatureCanvas({
  luckyName,
  size = 'md',
  glowColor = '#D4AF37',
  showDownload = false,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    if (!canvasRef.current) return;
    drawSignature(canvasRef.current, luckyName, size, glowColor);
  }, [luckyName, size, glowColor]);

  useEffect(() => {
    // Load Dancing Script explicitly before drawing
    Promise.all([
      document.fonts.load(`700 48px 'Dancing Script'`),
      document.fonts.load(`400 48px 'Dancing Script'`),
    ])
      .then(render)
      .catch(render); // fall back to system cursive if font fails
  }, [render]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Re-draw at 2x for high-quality export regardless of screen DPR
    const exportCanvas = document.createElement('canvas');
    const { w, h } = DIMS[size];
    const scale = 2;
    exportCanvas.width = w * scale;
    exportCanvas.height = h * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Dark background for the export
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Scale then draw
    ctx.scale(scale, scale);
    const tmp = document.createElement('canvas');
    drawSignature(tmp, luckyName, size, glowColor);
    // Copy from the offscreen canvas
    ctx.drawImage(tmp, 0, 0);

    const filename = `tanda-tangan-hoki-${(luckyName || 'hoki').toLowerCase().replace(/\s+/g, '-')}.png`;
    const url = exportCanvas.toDataURL('image/png', 1.0);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Initial placeholder dimensions so layout doesn't shift
  const { w, h } = DIMS[size];

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        style={{ width: w, height: h, display: 'block' }}
      />
      {showDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Download Tanda Tangan (PNG)
        </button>
      )}
    </div>
  );
}
