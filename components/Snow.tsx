"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Flake = { left: number; size: number; o: number; dur: number; delay: number; drift: number };

/** Gentle falling snow. Generated after mount so server and client markup match. */
export default function Snow() {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFlakes(
      Array.from({ length: 34 }, () => {
        const dur = 10 + Math.random() * 12;
        return {
          left: Math.random() * 959,
          size: 3 + Math.random() * 8,
          o: 0.35 + Math.random() * 0.5,
          dur,
          delay: -Math.random() * dur,
          drift: (Math.random() - 0.5) * 160,
        };
      }),
    );
  }, []);

  return (
    <div className="snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="flake"
          style={
            {
              left: `${f.left}px`,
              "--size": `${f.size}px`,
              "--o": f.o.toFixed(2),
              "--dur": `${f.dur}s`,
              "--delay": `${f.delay}s`,
              "--drift": `${f.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
