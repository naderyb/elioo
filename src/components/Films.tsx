"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Film = {
  title: string;
  year: string;
  tag: string;
  thumb: string | null; // e.g. "/films/one.jpg" (file in public/films)
  href: string | null; // YouTube / Vimeo / Instagram link
  grad: string;
};

// Placeholders: swap in his real films
const FILMS: Film[] = [
  {
    title: "Avant le soleil",
    year: "2024",
    tag: "Court métrage",
    thumb: null,
    href: null,
    grad: "from-leaf to-forest",
  },
  {
    title: "Bandes lentes",
    year: "2025",
    tag: "Clip musical",
    thumb: null,
    href: null,
    grad: "from-sage to-leaf",
  },
  {
    title: "Lettres",
    year: "2025",
    tag: "Court métrage",
    thumb: null,
    href: null,
    grad: "from-gold to-leaf",
  },
  {
    title: "L’heure dorée",
    year: "2026",
    tag: "Visualiseur",
    thumb: null,
    href: null,
    grad: "from-forest to-ink",
  },
];

const N = FILMS.length;
const INTRO = 0.26; // share of the scroll spent entering the lens
const GAP = 5000; // depth (px) between two films in the tunnel
const DIST = Math.round(((N - 1) * 150) / (1 - INTRO)); // total scroll length in vh

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (x: number, a: number, b: number, c: number, d: number) =>
  c + (d - c) * clamp((x - a) / (b - a));
const pad = (n: number) => String(n).padStart(2, "0");

// 9-sided aperture hole (evenodd polygon): grows and twists like real iris blades
const irisClip = (x: number) => {
  const r = ramp(x, 0.1, 0.24, 14, 80);
  const rot = ramp(x, 0.1, 0.24, 0, 40);
  const pts = Array.from({ length: 9 }, (_, k) => {
    const a = ((rot + k * 40 - 90) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`;
  });
  return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${pts.join(", ")}, ${pts[0]}, 0% 0%)`;
};

/* ---------- The lens you fall into ---------- */
function Lens({ p }: { p: MotionValue<number> }) {
  // camera dolly: slow push, then it accelerates through the glass
  const scale = useTransform(p, [0, 0.1, 0.18, 0.26], [1, 1.2, 3, 9]);
  const opacity = useTransform(p, [0.25, 0.29], [1, 0]);
  const glassOpacity = useTransform(p, [0.03, 0.11], [1, 0]);
  const clip = useTransform(p, irisClip);
  const ringRotate = useTransform(p, [0, 0.26], [0, 70]);

  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 left-1/2 z-30 aspect-square w-[min(88vw,76vh)] -translate-x-1/2 -translate-y-1/2"
      style={{ scale, opacity, willChange: "transform, opacity" }}
      aria-hidden
    >
      <div className="lens lens-barrel" />
      <div className="lens lens-knurl" />
      <motion.div className="lens lens-engrave" style={{ rotate: ringRotate }}>
        <svg viewBox="0 0 100 100">
          <defs>
            <path
              id="lensTxt"
              d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
            />
          </defs>
          <text
            fill="#9bb88a"
            fontFamily="Georgia, serif"
            fontSize="4.2"
            letterSpacing="1.2"
          >
            <textPath href="#lensTxt">
              ELIOO ✦ OBJECTIF CINÉ 35mm ✦ T1.5 ✦ ELIOO ✦ OBJECTIF CINÉ 35mm ✦ T1.5 ✦
            </textPath>
          </text>
        </svg>
      </motion.div>
      <div className="lens lens-scale" />
      <div className="lens lens-inner" />
      <motion.div className="lens lens-iris" style={{ clipPath: clip }} />
      <motion.div
        className="lens lens-glass"
        style={{ opacity: glassOpacity }}
      />
    </motion.div>
  );
}

/* ---------- One film, placed in real 3D depth ---------- */
function Card({ f, i, v }: { f: Film; i: number; v: MotionValue<number> }) {
  const side = i % 2 ? 1 : -1;
  const d = useTransform(v, (t) => i - t); // 0 = in front of camera, >0 = ahead, <0 = flew past
  const z = useTransform(v, (t) => (t - i) * GAP);
  const x = useTransform(d, (t) => `${side * Math.max(t, 0) * 14}vw`);
  const rotateY = useTransform(d, (t) => side * -Math.max(t, 0) * 9);
  const opacity = useTransform(d, (t) =>
    t >= 0 ? 1 - Math.min(t, 2.2) * 0.38 : 1 - clamp(-t / 0.45),
  );
  const filter = useTransform(
    d,
    (t) =>
      `blur(${(t >= 0 ? Math.min(t, 2) * 5 : clamp(-t / 0.45) * 16).toFixed(1)}px)`,
  );

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 aspect-square w-[74vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg bg-forest shadow-[0_30px_90px_rgba(0,0,0,0.6)] md:aspect-video md:w-[min(58vw,88vh)]"
      style={{
        x,
        z,
        rotateY,
        opacity,
        filter,
        willChange: "transform, opacity, filter",
      }}
    >
      {f.thumb ? (
        <Image
          src={f.thumb}
          alt={f.title}
          fill
          sizes="(min-width: 768px) 58vw, 74vw"
          className="object-cover contrast-105 saturate-[0.85]"
        />
      ) : (
        <div className={`h-full w-full bg-linear-to-br ${f.grad}`} />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-ink/20" />
      <span className="absolute top-4 left-4 text-[10px] tracking-[0.3em] text-paper/70 uppercase">
        Scène {pad(i + 1)}
      </span>
    </motion.div>
  );
}

/* ---------- Section ---------- */
export default function Films() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  // 0..N-1 across the tunnel part of the scroll
  const v = useTransform(
    p,
    (x) => clamp((x - INTRO) / (1 - INTRO - 0.04)) * (N - 1),
  );
  useMotionValueEvent(v, "change", (t) => {
    const next = clamp(Math.round(t), 0, N - 1);
    setActive((cur) => (cur === next ? cur : next));
  });

  const sceneOpacity = useTransform(p, [0.15, 0.21], [0, 1]);
  const sceneScale = useTransform(p, [0.14, 0.3], [1.3, 1]);
  const flareOpacity = useTransform(p, [0.12, 0.19, 0.28], [0, 0.9, 0]);
  const flareScale = useTransform(p, [0.12, 0.28], [0.2, 1.4]);
  const uiOpacity = useTransform(p, [0.22, 0.32], [0, 1]);
//   const hintOpacity = useTransform(p, [0, 0.05], [1, 0]);
  const bar = useTransform(v, (t) => t / (N - 1));
  const timecode = useTransform(p, (x) => {
    const t = clamp((x - INTRO) / (1 - INTRO));
    const frames = Math.floor(t * 24 * 40);
    return `00:00:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`;
  });

  const film = FILMS[active];

  return (
    <section
      ref={ref}
      className="relative bg-ink"
      style={{ height: `calc(100vh + ${DIST}vh)` }}
    >
      <h2 className="sr-only">Films</h2>

      <div className="sticky top-0 h-screen overflow-hidden">
        {/* The light outside, seen through the iris */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #6d9a62 0%, #23402c 55%, #0e1a12 100%)",
          }}
        />

        {/* Tunnel of films (real 3D perspective) */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            perspective: GAP,
            opacity: sceneOpacity,
            scale: sceneScale,
            willChange: "transform, opacity",
          }}
        >
          {FILMS.map((f, i) => (
            <Card key={f.title} f={f} i={i} v={v} />
          ))}
        </motion.div>

        {/* glass vignette */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            opacity: sceneOpacity,
            background:
              "radial-gradient(circle at 50% 50%, transparent 45%, rgba(5,10,7,0.55) 78%, rgba(5,10,7,0.92) 100%)",
          }}
        />

        <Lens p={p} />

        {/* anamorphic flare as the iris opens */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-40 h-0.5 w-[80vw] -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-transparent via-gold to-transparent shadow-[0_0_30px_8px_rgba(181,209,127,0.55)]"
          style={{ opacity: flareOpacity, scaleX: flareScale }}
        />
        {/* Viewfinder HUD */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50"
          style={{ opacity: uiOpacity }}
        >
          <span className="absolute top-[5vh] left-[4vw] h-8 w-8 border-t-2 border-l-2 border-paper/70" />
          <span className="absolute top-[5vh] right-[4vw] h-8 w-8 border-t-2 border-r-2 border-paper/70" />
          <span className="absolute bottom-[5vh] left-[4vw] h-8 w-8 border-b-2 border-l-2 border-paper/70" />
          <span className="absolute right-[4vw] bottom-[5vh] h-8 w-8 border-r-2 border-b-2 border-paper/70" />

          <div className="absolute top-[8vh] left-[7vw] flex items-center gap-2 text-[11px] tracking-[0.3em] text-paper uppercase">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" />
            Enr.
          </div>

          <div className="absolute top-[8vh] right-[7vw] text-right text-[11px] tracking-[0.25em] text-paper/80 uppercase">
            <motion.span className="tabular-nums">{timecode}</motion.span>
            <span className="ml-3 hidden text-sage sm:inline">24p · 4K</span>
          </div>

          <div className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 opacity-60">
            <span className="absolute top-1/2 left-0 h-px w-full bg-paper" />
            <span className="absolute top-0 left-1/2 h-full w-px bg-paper" />
          </div>

          <div className="absolute inset-x-[7vw] bottom-[9vh] flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-h-24 md:min-h-[8.125rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={film.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[10px] tracking-[0.3em] text-gold uppercase">
                    Scène {pad(active + 1)} / {pad(N)}
                  </p>
                  <p className="mt-2 font-display text-4xl leading-none text-paper italic md:text-6xl">
                    {film.title}
                  </p>
                  <p className="mt-3 text-[10px] tracking-[0.3em] text-sage uppercase">
                    {film.tag} · {film.year}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {film.href ? (
              <a
                href={film.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto rounded-full bg-paper px-8 py-3 text-xs tracking-[0.25em] text-forest uppercase transition-colors duration-500 hover:bg-gold"
              >
                Regarder
              </a>
            ) : (
              <span className="rounded-full border border-paper/30 px-8 py-3 text-xs tracking-[0.25em] text-paper/60 uppercase">
                Bientôt
              </span>
            )}
          </div>

          <div className="absolute inset-x-[7vw] bottom-[5.5vh] h-px bg-paper/15">
            <motion.div
              className="h-full origin-left bg-gold"
              style={{ scaleX: bar }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
