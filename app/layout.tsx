import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Winter Indoor Party · #NortuCommu",
  description:
    "You're invited to the Winter Indoor Party — 21 November 2006, Main Hall, University of Nortonbridge.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#726b62",
};

// Picks the layout and scales the stage before first paint (no flash):
//  - mobile  (portrait-ish): 959×1700 Figma frame, fit inside the screen
//  - desktop (landscape):    1920×1080 stage, fit to full width
const fitScript = `(function(){var r=document.documentElement;function f(){var v=window.visualViewport,w=v?v.width:innerWidth,h=v?v.height:innerHeight,d=w>=900&&w/h>=1.25;r.setAttribute('data-layout',d?'desktop':'mobile');r.style.setProperty('--s',(d?Math.min(w/1920,h/1080):Math.min(w/959,h/1700)).toFixed(4))}f();addEventListener('resize',f);window.visualViewport&&visualViewport.addEventListener('resize',f)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: fitScript }} />
      </head>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
