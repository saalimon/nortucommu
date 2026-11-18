type BurstOptions = {
  count: number;
  colors: string[];
  className: "bit" | "spark";
  minDist: number;
  maxDist: number;
  minSize: number;
  maxSize: number;
};

/** Spawns short-lived particles that fly out from the container's origin. */
export function burst(container: HTMLElement | null, o: BurstOptions) {
  if (!container) return;
  for (let i = 0; i < o.count; i++) {
    const p = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const dist = o.minDist + Math.random() * (o.maxDist - o.minDist);
    p.className = o.className;
    p.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--ty", `${Math.sin(angle) * dist * 0.75}px`);
    p.style.setProperty("--size", `${o.minSize + Math.random() * (o.maxSize - o.minSize)}px`);
    p.style.setProperty("--color", o.colors[i % o.colors.length]);
    p.style.setProperty("--rot", `${(Math.random() - 0.5) * 540}deg`);
    p.style.setProperty("--dur", `${0.7 + Math.random() * 0.6}s`);
    if (o.className === "bit") {
      p.style.setProperty("--radius", Math.random() > 0.5 ? "50%" : "30% 70% 40% 60%");
    }
    p.addEventListener("animationend", () => p.remove(), { once: true });
    container.appendChild(p);
  }
}
