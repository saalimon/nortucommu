"use client";

/*
 * Winter Indoor Party — mail invitation
 *
 * Flow (matches the Figma frames):
 *   closed (Frame 1) ─tap→ open (Frame 2) ─auto→ cards (Frame 4)
 *   cards ─Tap to Read→ invite sheet (Frame 5) ─chevron→ dress-code sheet (Frame 6)
 *   dress-code ─Tap to Close→ back to cards
 *
 * URL options:  ?reroll  draw a new color & item
 *               ?scene=cards|invite|code  jump straight to a screen
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import bgRoom from "@/assets/bg-room.jpg";
import brushDark from "@/assets/brush-dark.svg";
import brushWhite from "@/assets/brush-white.svg";
import chevronDown from "@/assets/chevron-down.svg";
import chevronUp from "@/assets/chevron-up.svg";
import invitePanel from "@/assets/invite-panel.svg";
import inviteCard from "@/assets/invite-card.png";
import keywordCard from "@/assets/keyword-card.png";
import mailClose from "@/assets/mail-close.png";
import mailOpen from "@/assets/mail-open.png";
import mailOpenEmpty from "@/assets/mail-open-empty.png";
import monogramBlack from "@/assets/monogram-w-black.svg";
import monogramInk from "@/assets/monogram-w-ink.svg";
import ribbon1 from "@/assets/ribbon-1.png";
import ribbon2 from "@/assets/ribbon-2.png";
import sheetShade from "@/assets/sheet-shade.svg";
import underline from "@/assets/underline.svg";
import ScratchCard from "@/components/ScratchCard";
import Snow from "@/components/Snow";
import { burst } from "@/lib/burst";
import { getDressCode, saveDressCode, type DressCode } from "@/lib/dresscode";

type Env = "closed" | "open" | "cards";
type Sheet = "none" | "invite" | "code";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

export default function Invitation({ canvasFont }: { canvasFont: string }) {
  const [env, setEnv] = useState<Env>("closed");
  const [sheet, setSheet] = useState<Sheet>("none");
  const [shaking, setShaking] = useState(false);
  const [code, setCode] = useState<DressCode | null>(null);
  const busy = useRef(false);
  const sealRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);

  // Draw (or restore) the dress code and honour URL options.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reroll = params.has("reroll");
    setCode(getDressCode(reroll));
    if (reroll) {
      params.delete("reroll");
      const qs = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
    const scene = params.get("scene");
    if (scene === "cards" || scene === "invite" || scene === "code") {
      setEnv("cards");
      setSheet(scene === "cards" ? "none" : scene);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet("none");
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openEnvelope = useCallback(async () => {
    if (busy.current || env !== "closed") return;
    busy.current = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    setShaking(true);
    await wait(550);
    setShaking(false);

    burst(sealRef.current, {
      count: 26,
      colors: ["#8e2a1a", "#b8432c", "#5e160d", "#fdc371", "#fff3d6"],
      className: "bit",
      minDist: 90,
      maxDist: 260,
      minSize: 8,
      maxSize: 20,
    });
    setEnv("open");

    await wait(1000);
    setEnv("cards");
    await wait(350);
    busy.current = false;
  }, [env]);

  const openSheet = (s: Sheet) => {
    if (!busy.current) setSheet(s);
  };

  const onTap = () => {
    if (env === "closed") openEnvelope();
    else if (env === "cards") openSheet("invite");
  };

  const onReveal = useCallback(() => {
    setCode((c) => {
      if (!c) return c;
      const next = { ...c, revealed: true };
      saveDressCode(next);
      return next;
    });
  }, []);

  const swipe = (up?: () => void, down?: () => void) => ({
    onTouchStart: (e: TouchEvent) => {
      swipeStart.current = (e.target as HTMLElement).closest(".scratch-foil") ? null : e.touches[0].clientY;
    },
    onTouchEnd: (e: TouchEvent) => {
      if (swipeStart.current == null) return;
      const dy = e.changedTouches[0].clientY - swipeStart.current;
      swipeStart.current = null;
      if (dy < -60) up?.();
      if (dy > 60) down?.();
    },
  });

  const cardsOut = env === "cards";
  const inviteOpen = sheet === "invite" || sheet === "code";
  const codeOpen = sheet === "code";

  return (
    <>
      <div className="backdrop" aria-hidden="true" />

      <main className="viewport">
        <div className="stage" data-env={env} data-sheet={sheet}>
          {/* ── Background (shared by every frame) ── */}
          <div className="bg-gradient" aria-hidden="true" />
          <img className="bg-room" src={bgRoom.src} alt="" aria-hidden="true" />
          <div className="bg-vignette" aria-hidden="true" />
          <div className="piece bg-ribbon-bottom" aria-hidden="true">
            <img src={ribbon2.src} alt="" />
          </div>
          <div className="piece bg-ribbon-top" aria-hidden="true">
            <img src={ribbon1.src} alt="" />
          </div>
          <Snow />

          {/* ── Header ── */}
          <header className="header">
            <p className="script date">21 November 2006</p>
            <h1 className="title">
              <span className="title-winter">Winter</span>
              <span className="title-party">Indoor Party</span>
            </h1>
            <p className="script tag tag-left">#NortuCommu</p>
            <p className="script tag tag-right">#Cozy&amp;Chill</p>
          </header>

          {/* ── Envelope ── */}
          <div className="envelope">
            <div className="piece ribbon-back">
              <img src={ribbon2.src} alt="" />
            </div>
            <button
              className={`piece mail-close${shaking ? " is-shaking" : ""}`}
              type="button"
              aria-label="Open the invitation"
              tabIndex={env === "closed" ? 0 : -1}
              onClick={openEnvelope}
            >
              <img src={mailClose.src} alt="" />
            </button>
            <div className="piece mail-open" aria-hidden="true">
              <img src={mailOpen.src} alt="" />
            </div>
            <div className="piece mail-empty" aria-hidden="true">
              <img src={mailOpenEmpty.src} alt="" />
            </div>
            <div className="piece ribbon-front" aria-hidden="true">
              <img src={ribbon2.src} alt="" />
            </div>
            <button
              className="piece card-keyword"
              type="button"
              aria-label="Read your dress code card"
              tabIndex={cardsOut ? 0 : -1}
              onClick={() => openSheet("code")}
            >
              <img src={keywordCard.src} alt="" />
            </button>
            <button
              className="piece card-invite"
              type="button"
              aria-label="Read the invitation"
              tabIndex={cardsOut ? 0 : -1}
              onClick={() => openSheet("invite")}
            >
              <img src={inviteCard.src} alt="" />
            </button>
            <div className="seal-burst" ref={sealRef} aria-hidden="true" />
          </div>

          <button className={`tap-btn${cardsOut ? " is-swapping" : ""}`} type="button" onClick={onTap}>
            <span key={cardsOut ? "read" : "open"} className="piece tap-brush">
              <img src={brushWhite.src} alt="" />
            </span>
            <span className="tap-text">{cardsOut ? "Tap to Read !" : "Tap to Open !"}</span>
          </button>

          <p className="script credit">provided by @darknessdearm &amp; @saalimon</p>

          {/* ── Sheets (Frames 5 & 6) ── */}
          <img
            className="sheet-shade"
            src={sheetShade.src}
            alt=""
            aria-hidden="true"
            onClick={() => setSheet("none")}
          />

          <section
            className={`sheet sheet-invite${inviteOpen ? " is-open" : ""}`}
            aria-label="Invitation"
            aria-hidden={sheet !== "invite"}
            inert={sheet !== "invite"}
            {...swipe(() => setSheet("code"), () => setSheet("none"))}
          >
            <img className="sheet-panel" src={invitePanel.src} alt="" />
            <div className="sheet-frame inv-frame" />
            <img className="monogram inv-mono r" style={d(1)} src={monogramInk.src} alt="W" />
            <p className="thai inv-intro r" style={d(2)}>
              สืบเนื่องในโอกาส เหล่าคณาจารย์ มหาวิทาลัยนอร์ทตันบริดจ์ จัดงาน
            </p>
            <h2 className="inv-title r" style={d(3)}>
              Winter Indoor Party
            </h2>
            <p className="thai inv-body r" style={d(4)}>
              ระหว่างนักศึกษา บุคคลากรภายในมหาวิทยาลัย และ ชาวเมือง
              <br />
              เพื่อส่งเสริมทักษะการปฏิสัมพันธ์ แลกเปลี่ยนความคิดเห็นต่างๆ
              <br />
              ภายใต้บรรยากาศอบอุ่น พร้อมกับมีกิจกรรมมากมาย
              <br />
              ให้เหล่าแขกผู้มีเกียรติ์ทุกท่านได้ร่วมสนุก
            </p>
            <p className="thai inv-venue r" style={d(5)}>
              ณ Main Hall, Sciences Division, University of Nortonbridge
              <br />
              21 November 2006, 4:00 - 9:00 P.M.
            </p>
            <p className="thai inv-theme-label r" style={d(6)}>
              ธีมการแต่งกายในโจทย์
            </p>
            <span className="piece inv-underline r" style={d(6)}>
              <img src={underline.src} alt="" />
            </span>
            <p className="thai inv-theme r" style={d(7)}>
              “ผู้วิเศษ”
            </p>
            <button
              className="chevron chevron-down"
              type="button"
              aria-label="Next: your dress code"
              onClick={() => setSheet("code")}
            >
              <img src={chevronDown.src} alt="" />
            </button>
          </section>

          <section
            className={`sheet sheet-code${codeOpen ? " is-open" : ""}`}
            aria-label="Your dress code"
            aria-hidden={!codeOpen}
            inert={!codeOpen}
            {...swipe(undefined, () => setSheet("invite"))}
          >
            <div className="sheet-panel code-panel" />
            <button
              className="chevron chevron-up"
              type="button"
              aria-label="Back to the invitation"
              onClick={() => setSheet("invite")}
            >
              <img src={chevronUp.src} alt="" />
            </button>
            <div className="sheet-frame code-frame" />
            <img className="monogram code-mono r" style={d(1)} src={monogramBlack.src} alt="W" />
            <h2 className="code-title r" style={d(2)}>
              Your Dress Code
            </h2>

            <ScratchCard code={code} active={codeOpen} onReveal={onReveal} canvasFont={canvasFont} style={d(3)} />

            <h3 className="code-magic r" style={d(4)}>
              Let the Magic Guide you
            </h3>
            <p className="thai code-note r" style={d(5)}>
              หากคุณแต่งกายมาด้วยสีและนำสิ่งของที่คุณได้รับจากสลากนี้
              <br />
              สามารถนำมาแลกของสมนาคุณที่จุดลงทะเบียนเข้างาน
            </p>
            <p className="code-sign r" style={d(5)}>
              Winter Indoor Party
            </p>

            <button className="close-btn r" type="button" style={d(6)} onClick={() => setSheet("none")}>
              <span className="piece close-brush">
                <img src={brushDark.src} alt="" />
              </span>
              <span className="close-text">Tap to Close</span>
            </button>
          </section>
        </div>
      </main>
    </>
  );
}
