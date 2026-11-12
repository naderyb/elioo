"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

type Kind = "video" | "vocals";

type Session = {
  title: string;
  artist: string; // original artist
  kind: Kind;
  year: string;
  thumb: string | null; // e.g. "/covers/one.jpg" (file in public/covers)
  href: string | null; // Instagram reel / YouTube / SoundCloud link
  label: string; // colour of the record label for this track
  grad: string; // placeholder sleeve gradient
};

// Placeholders: swap in his real covers (keep 3 to 6 for the best feel)
const SESSIONS: Session[] = [
  {
    title: "Titre de reprise un",
    artist: "Artiste original",
    kind: "video",
    year: "2026",
    thumb: null,
    href: null,
    label: "#b5d17f",
    grad: "from-leaf to-forest",
  },
  {
    title: "Titre de reprise deux",
    artist: "Artiste original",
    kind: "vocals",
    year: "2026",
    thumb: null,
    href: null,
    label: "#9bb88a",
    grad: "from-sage to-leaf",
  },
  {
    title: "Titre de reprise trois",
    artist: "Artiste original",
    kind: "video",
    year: "2025",
    thumb: null,
    href: null,
    label: "#c5dc9a",
    grad: "from-gold to-leaf",
  },
  {
    title: "Titre de reprise quatre",
    artist: "Artiste original",
    kind: "vocals",
    year: "2025",
    thumb: null,
    href: null,
    label: "#a9c78e",
    grad: "from-forest to-ink",
  },
  {
    title: "Titre de reprise cinq",
    artist: "Artiste original",
    kind: "video",
    year: "2025",
    thumb: null,
    href: null,
    label: "#cfe3b0",
    grad: "from-leaf to-ink",
  },
];

const KIND_LABEL: Record<Kind, string> = {
  video: "À l’image",
  vocals: "Voix uniquement",
};

const N = SESSIONS.length;
const INTRO = 0.16; // scroll share spent lowering the needle onto the first track
const END = 0.92; // scroll share where the last track is reached
const DIST = Math.round(((N - 1) * 80) / (END - INTRO)); // total scroll length in vh

/* ---------- geometry (same units as the SVG viewBox 0 0 120 100) ---------- */
const C = { x: 46, y: 50 }; // record centre
const P = { x: 104, y: 22 }; // tonearm pivot
const ARM = 60; // pivot to needle
const R_REST = 44; // needle radius when parked
const R_FIRST = 29;
const R_LAST = 17;
const RADII = Array.from(
  { length: N },
  (_, k) => R_FIRST - k * ((R_FIRST - R_LAST) / (N - 1)),
);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const pad = (n: number) => String(n).padStart(2, "0");

// angle (deg) that puts the needle exactly r units from the record centre
function armAngle(r: number) {
  const dx = C.x - P.x;
  const dy = C.y - P.y;
  const D = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(
    clamp((ARM * ARM + D * D - r * r) / (2 * ARM * D), -1, 1),
  );
  const c1 = base + a;
  const c2 = base - a;
  const lower = Math.sin(c1) > Math.sin(c2) ? c1 : c2;
  return (lower * 180) / Math.PI;
}

function needleState(x: number) {
  if (x < INTRO) {
    const e = smooth(clamp(x / INTRO));
    return {
      r: lerp(R_REST, RADII[0], e),
      lift: 1 - smooth(clamp((x - 0.05) / (INTRO - 0.05))),
    };
  }
  const t = clamp((x - INTRO) / (END - INTRO)) * (N - 1);
  const i = Math.min(N - 2, Math.floor(t));
  const e = smooth(clamp((t - i - 0.3) / 0.4)); // dwell on a track, then sweep to the next
  return {
    r: lerp(RADII[i], RADII[i + 1], e),
    lift: 0.4 * Math.sin(Math.PI * e),
  };
}

function armTransforms(r: number, lift: number) {
  const deg = armAngle(r);
  return {
    arm: `translate(${P.x} ${P.y}) rotate(${deg}) scale(${1 + lift * 0.06})`,
    shadow: `translate(${P.x + lift * 5 + 1} ${P.y + lift * 8 + 1.5}) rotate(${deg})`,
    opacity: 0.32 - lift * 0.1,
  };
}

const activeIndex = (x: number) =>
  x < INTRO ? 0 : Math.round(clamp((x - INTRO) / (END - INTRO)) * (N - 1));

// where the tonearm cradle sits (under the arm when parked)
const REST_RAD = (armAngle(R_REST) * Math.PI) / 180;
const REST_POST = {
  x: P.x + 40 * Math.cos(REST_RAD),
  y: P.y + 40 * Math.sin(REST_RAD),
};
const GAPS = RADII.slice(0, -1).map(
  (r, k) => ((r + RADII[k + 1]) / 2 / 35) * 50,
);

function Header() {
  return (
    <>
      <p className="mb-3 flex items-center mt-3 gap-4 text-xs tracking-[0.35em] text-leaf uppercase">
        <span className="h-px w-10 bg-leaf" />
        Reprises &amp; sessions
      </p>
      <h2 className="font-display text-3xl leading-[1.05] text-forest italic md:text-5xl">
        Les chansons des autres, chantées comme les miennes.
      </h2>
    </>
  );
}

function Sleeve({ s }: { s: Session }) {
  return (
    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-sm bg-forest shadow-[0_18px_40px_rgba(14,26,18,0.35)] md:w-48">
      {s.thumb ? (
        <Image
          src={s.thumb}
          alt={`${s.title}, reprise par elioo`}
          fill
          sizes="(min-width: 768px) 192px, 96px"
          className="object-cover contrast-105 saturate-[0.85]"
        />
      ) : (
        <div className={`h-full w-full bg-linear-to-br ${s.grad}`} />
      )}
      <div className="pointer-events-none absolute inset-1.5 border border-paper/30" />
      <span className="absolute bottom-3 left-3 text-[9px] tracking-[0.3em] text-paper/80 uppercase">
        elioo
      </span>
    </div>
  );
}

export default function Music() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGGElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const inView = useInView(stageRef);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  // tonearm: written straight to the SVG (no React re-render on scroll)
  const arm = useTransform(p, (x) => {
    const s = needleState(x);
    return armTransforms(s.r, s.lift);
  });
  useMotionValueEvent(arm, "change", (a) => {
    armRef.current?.setAttribute("transform", a.arm);
    shadowRef.current?.setAttribute("transform", a.shadow);
    shadowRef.current?.setAttribute("opacity", String(a.opacity));
  });
  const init = armTransforms(R_REST, 1);

  // platter with inertia: spins up when the needle lands, slows down when it lifts
  const rot = useMotionValue(0);
  const speed = useRef(0);
  const target = useRef(0);
  useMotionValueEvent(p, "change", (x) => {
    target.current = x > 0.1 && x < 0.995 ? 1 : 0;
    const i = activeIndex(x);
    setActive((cur) => (cur === i ? cur : i));
  });
  useAnimationFrame((_, delta) => {
    if (!inView || reduce) return;
    speed.current +=
      (target.current - speed.current) * Math.min(1, delta / 900);
    if (speed.current > 0.001)
      rot.set((rot.get() + speed.current * delta * 0.2) % 360);
  });

  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);
  const s = SESSIONS[active];

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    const x = INTRO + (i / (N - 1)) * (END - INTRO);
    window.scrollTo({ top: top + x * range, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      className="relative bg-paper-deep"
      style={{ height: `calc(100vh + ${DIST}vh)` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-screen flex-col justify-center gap-6 overflow-hidden px-5 md:grid md:grid-cols-[1.25fr_0.75fr] md:items-center md:gap-14 md:px-16"
      >
        <div className="md:hidden">
          <Header />
        </div>

        {/* Turntable */}
        <div className="relative mx-auto w-full max-w-[min(100%,calc((100vh-6rem)*1.2))]">
          <div className="tt">
            <div className="tt-platter">
              <motion.div className="tt-strobe" style={{ rotate: rot }} />
            </div>

            <motion.div
              className="tt-record"
              style={{ rotate: rot, willChange: "transform" }}
            >
              <svg viewBox="0 0 100 100" aria-hidden>
                <defs>
                  <path
                    id="ttLabelPath"
                    d="M 50,50 m -11.6,0 a 11.6,11.6 0 1,1 23.2,0 a 11.6,11.6 0 1,1 -23.2,0"
                  />
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="47.6"
                  fill="none"
                  stroke="rgba(155,184,138,.35)"
                  strokeWidth=".4"
                />
                {GAPS.map((g) => (
                  <g key={g}>
                    <circle
                      cx="50"
                      cy="50"
                      r={g}
                      fill="none"
                      stroke="#050a07"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={g}
                      fill="none"
                      stroke="rgba(181,209,127,.45)"
                      strokeWidth=".3"
                    />
                  </g>
                ))}
                <circle
                  cx="50"
                  cy="50"
                  r="20.7"
                  fill="none"
                  stroke="#050a07"
                  strokeWidth="1.4"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="15.7"
                  initial={false}
                  animate={{ fill: s.label }}
                  transition={{ duration: 0.6 }}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="14.3"
                  fill="none"
                  stroke="#0e1a12"
                  strokeOpacity=".3"
                  strokeWidth=".3"
                />
                <text
                  fill="#0e1a12"
                  fontFamily="Georgia, serif"
                  fontSize="2.6"
                  letterSpacing=".5"
                >
                  <textPath href="#ttLabelPath">
                    ELIOO · COVERS &amp; SESSIONS ·{" "}
                  </textPath>
                </text>
                <circle cx="50" cy="50" r="1.5" fill="#d8e4cb" />
              </svg>
            </motion.div>

            <div className="tt-sheen" />
            <div className="tt-spindle" />

            <svg className="tt-overlay" viewBox="0 0 120 100" aria-hidden>
              <defs>
                <linearGradient id="ttMet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d7e6d0" />
                  <stop offset=".5" stopColor="#8aa387" />
                  <stop offset="1" stopColor="#3d5a45" />
                </linearGradient>
                <radialGradient id="ttBase" cx=".35" cy=".3">
                  <stop offset="0" stopColor="#e3efdd" />
                  <stop offset=".6" stopColor="#7f9a7a" />
                  <stop offset="1" stopColor="#2d4636" />
                </radialGradient>
                <filter id="ttBlur">
                  <feGaussianBlur stdDeviation="1" />
                </filter>
              </defs>

              <text
                x="8"
                y="94"
                fill="#9bb88a"
                fontFamily="Georgia, serif"
                fontSize="3"
                letterSpacing=".8"
                opacity=".7"
              >
                ELIOO ✦ MODEL 33 ✦ HI-FI
              </text>

              {/* start/stop knob + LED */}
              <circle
                cx="104"
                cy="82"
                r="6"
                fill="url(#ttBase)"
                stroke="#12231a"
                strokeWidth=".6"
              />
              <line
                x1="104"
                y1="82"
                x2="104"
                y2="77.5"
                stroke="#12231a"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <circle cx="90" cy="90" r="1.1" fill="#b5d17f" />

              {/* arm rest */}
              <circle
                cx={REST_POST.x}
                cy={REST_POST.y}
                r="2.4"
                fill="url(#ttBase)"
                stroke="#12231a"
                strokeWidth=".5"
              />

              {/* shadow (grows when the arm is lifted) */}
              <g
                ref={shadowRef}
                transform={init.shadow}
                opacity={init.opacity}
                filter="url(#ttBlur)"
              >
                <rect
                  x="-16"
                  y="-4"
                  width="8"
                  height="8"
                  rx="1.5"
                  fill="#000"
                />
                <rect x="-8" y="-1.1" width="60" height="2.2" fill="#000" />
                <rect
                  x="51"
                  y="-2.6"
                  width="9"
                  height="5.2"
                  rx="1"
                  fill="#000"
                />
              </g>

              {/* tonearm */}
              <g ref={armRef} transform={init.arm}>
                <rect
                  x="-17"
                  y="-4.2"
                  width="9"
                  height="8.4"
                  rx="1.6"
                  fill="#3d5a45"
                  stroke="#12231a"
                  strokeWidth=".4"
                />
                <rect
                  x="-8"
                  y="-1.1"
                  width="60"
                  height="2.2"
                  fill="url(#ttMet)"
                />
                <rect
                  x="51"
                  y="-2.7"
                  width="9"
                  height="5.4"
                  rx="1.1"
                  fill="#2d4636"
                  stroke="#12231a"
                  strokeWidth=".4"
                />
                <rect
                  x="53.5"
                  y="-1.9"
                  width="5"
                  height="3.8"
                  rx=".6"
                  fill="#0e1a12"
                />
                <circle cx="60" cy="0" r=".7" fill="#b5d17f" />
                <circle
                  cx="0"
                  cy="0"
                  r="7"
                  fill="url(#ttBase)"
                  stroke="#12231a"
                  strokeWidth=".6"
                />
                <circle cx="0" cy="0" r="2.2" fill="#12231a" />
              </g>
            </svg>
          </div>

          <motion.p
            className="mt-6 text-center text-xs tracking-[0.35em] text-ink/50 uppercase"
            style={{ opacity: hintOpacity }}
          >
            Faites défiler · posez l’aiguille
          </motion.p>
        </div>

        {/* Now playing */}
        <div className="md:max-w-md">
          <div className="hidden md:block">
            <Header />
          </div>

          <div className="md:mt-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.title}
                className="flex items-center gap-4 md:flex-col md:items-start md:gap-6"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Sleeve s={s} />
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-leaf uppercase">
                    En lecture · {pad(active + 1)} / {pad(N)} ·{" "}
                    {KIND_LABEL[s.kind]}
                  </p>
                  <h3 className="mt-2 font-display text-3xl leading-none text-forest md:text-4xl">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[10px] tracking-[0.25em] text-ink/60 uppercase">
                    Reprise · à l’origine par {s.artist} · {s.year}
                  </p>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-full bg-forest px-6 py-2 text-[10px] tracking-[0.25em] text-paper uppercase transition-colors duration-500 hover:bg-leaf"
                    >
                      Écouter
                    </a>
                  ) : (
                    <span className="mt-4 inline-block rounded-full border border-forest/30 px-6 py-2 text-[10px] tracking-[0.25em] text-forest/60 uppercase">
                      Bientôt
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* tracklist (desktop) */}
          <ul className="mt-8 hidden border-t border-forest/15 md:block">
            {SESSIONS.map((t, i) => (
              <li key={t.title}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={`flex w-full items-center gap-4 border-b border-forest/15 py-3 text-left transition-opacity duration-500 ${
                    i === active ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  <span className="w-7 font-display text-lg text-leaf italic">
                    {pad(i + 1)}
                  </span>
                  <span className="flex-1 font-display text-xl text-forest">
                    {t.title}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-ink/50 uppercase">
                    {KIND_LABEL[t.kind]}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* progress dots (mobile) */}
          <div className="mt-5 flex gap-2 md:hidden" aria-hidden>
            {SESSIONS.map((t, i) => (
              <span
                key={t.title}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? "w-8 bg-forest" : "w-1.5 bg-forest/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
