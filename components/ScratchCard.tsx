"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import foilImage from "@/assets/scratch-foil.png";
import { burst } from "@/lib/burst";
import type { DressCode } from "@/lib/dresscode";
import { preloadSound, scratchMove, scratchStart, scratchStop } from "@/lib/sound";

const REVEAL_AT = 0.5; // share of foil scratched off before auto-reveal
const MAX_RESULT_WIDTH = 600;

type Props = {
  code: DressCode | null;
  /** True while the dress-code sheet is on screen. */
  active: boolean;
  onReveal: () => void;
  canvasFont: string;
  style?: CSSProperties;
};

export default function ScratchCard({ code, active, onReveal, canvasFont, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const prepared = useRef(false);
  const scratching = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [foilPainted, setFoilPainted] = useState(false);

  // Paint the foil the first time the sheet opens (fonts must be ready).
  useEffect(() => {
    if (!active || !code || prepared.current) return;
    prepared.current = true;

    document.fonts.ready.then(() => {
      const result = resultRef.current;
      if (result) {
        result.style.fontSize = "";
        const w = result.offsetWidth;
        if (w > MAX_RESULT_WIDTH) result.style.fontSize = `${Math.floor(96 * (MAX_RESULT_WIDTH / w))}px`;
      }
      if (code.revealed) {
        setRevealed(true);
        return;
      }
      preloadSound("scratch");
      const img = new Image();
      img.onload = () => paintFoil(img);
      img.src = foilImage.src;
    });

    function paintFoil(img: HTMLImageElement) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      if (!canvas || !ctx) return;
      const { width: W, height: H } = canvas;

      // object-fit: cover
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

      // Two #070707 overlay layers at 82%, as in Figma
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = "#070707";
      ctx.fillRect(0, 0, W, H);
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Centre the hint by its drawn pixels, not by baseline/"middle" metrics:
      // Safari and Chrome disagree on where "middle" is for Thai glyphs.
      const hint = "( ขูดตรงนี้เพื่อรับ code )";
      ctx.fillStyle = "#837979";
      ctx.font = `${20 * (W / 653)}px ${canvasFont}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const m = ctx.measureText(hint);
      const inkLeft = m.actualBoundingBoxLeft;
      const inkRight = m.actualBoundingBoxRight;
      const inkUp = m.actualBoundingBoxAscent;
      const inkDown = m.actualBoundingBoxDescent;
      const x = (W - (inkLeft + inkRight)) / 2 + inkLeft;
      const y = (H - (inkUp + inkDown)) / 2 + inkUp;
      ctx.fillText(hint, x, y);
      setFoilPainted(true);
    }
  }, [active, code, canvasFont]);

  const reveal = useCallback(() => {
    if (revealed) return;
    scratchStop();
    setRevealed(true);
    onReveal();
    burst(sparklesRef.current, {
      count: 30,
      colors: ["#fdc371", "#fff3d6", "#ffd99c", "#ffffff"],
      className: "spark",
      minDist: 120,
      maxDist: 380,
      minSize: 14,
      maxSize: 34,
    });
  }, [revealed, onReveal]);

  function clearedRatio() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 12) {
      total++;
      if (data[i] < 40) clear++;
    }
    return clear / total;
  }

  function scratchAt(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const p = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    const from = last.current ?? p;
    // Louder / higher pitch the faster the finger moves (canvas px per event).
    scratchMove(Math.hypot(p.x - from.x, p.y - from.y) / 45);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 70;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    last.current = p;
    if (++moves.current % 6 === 0 && clearedRatio() >= REVEAL_AT) reveal();
  }

  function stop() {
    if (!scratching.current) return;
    scratching.current = false;
    last.current = null;
    scratchStop();
    if (!revealed && clearedRatio() >= REVEAL_AT) reveal();
  }

  return (
    <div className="scratch r" style={style}>
      <div className="scratch-box" />
      <p ref={resultRef} className={`scratch-result${revealed ? " is-revealed" : foilPainted ? "" : " is-pending"}`} aria-live="polite">
        <span aria-hidden={!revealed}>
          {code?.color ?? "Color"} &amp; {code?.item ?? "Item"}
        </span>
      </p>
      <canvas
        ref={canvasRef}
        className={`scratch-foil${revealed ? " is-cleared" : ""}`}
        width={1306}
        height={284}
        tabIndex={revealed ? -1 : 0}
        role="button"
        aria-label="Scratch here to reveal your color and item (or press Enter)"
        onPointerDown={(e) => {
          if (revealed) return;
          scratching.current = true;
          last.current = null;
          scratchStart();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* not capturable */
          }
          scratchAt(e);
        }}
        onPointerMove={(e) => scratching.current && !revealed && scratchAt(e)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            reveal();
          }
        }}
      />
      <div ref={sparklesRef} className="sparkles" aria-hidden="true" />
    </div>
  );
}
