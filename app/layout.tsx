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

// Scales the 959×1700 stage to the screen before first paint (no flash).
const fitScript = `(function(){var r=document.documentElement;function f(){var v=window.visualViewport,w=v?v.width:innerWidth,h=v?v.height:innerHeight;r.style.setProperty('--s',Math.min(w/959,h/1700).toFixed(4))}f();addEventListener('resize',f);window.visualViewport&&visualViewport.addEventListener('resize',f)})();`;

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
      <body>{children}</body>
    </html>
  );
}
