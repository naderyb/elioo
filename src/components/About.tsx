"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Shot = { src: string | null; caption: string; position?: string };

// Photos hung on the walls (put files in public/about/). 3 to 6 frames work best.
// Portrait 4:5 crops look best. `position` keeps his face in the crop, like "50% 25%".
const SIDE: Shot[] = [
  { src: null, caption: "first stage" },
  { src: null, caption: "on set" },
  { src: null, caption: "studio nights" },
  { src: null, caption: "golden hour" },
];
// The big portrait at the end of the corridor: his best photo.
const HERO: Shot = { src: null, caption: "Bilal Ait Sai", position: "50% 30%" };

const QUOTE =
  "I write the songs I need to hear, and I film the moments I'm afraid to forget.";
const CREDITS: [string, string][] = [
  ["Voice", "Bilal Ait Sai"],
  ["Camera", "elioo"],
  ["Format", "Covers & short films"],
  ["Made", "Slowly, on purpose"],
];

// ---- geometry (px). P must match `perspective` in globals.css ----
const P = 1000;
const SEG = 1100; // distance between frames
const N = SIDE.length;
const L = (N + 1) * SEG; // corridor length
const DEND = 480; // final camera distance from the portrait
const SCALE = P / (P + DEND);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function geometry(w: number, h: number) {
  const HW = Math.max(0.55 * w, 0.38 * h); // half corridor width
  const HH = 0.6 * h; // half corridor height
  const PH = 0.5 * h; // side frame height
  const PW = 0.8 * PH;
  const PY = -0.04 * h;
  const heroOn = Math.min(
    0.66 * h,
    Math.min(0.86 * w, 0.9 * 2 * HW * SCALE) / 0.8,
  );
  const HH_ = heroOn / SCALE; // portrait height in scene units
  const HW_ = 0.8 * HH_;
  return { HW, HH, PH, PW, PY, HH_, HW_, heroW: HW_ * SCALE };
}

function Plane({
  cls,
  w,
  h,
  tr,
  children,
}: {
  cls: string;
  w: number;
  h: number;
  tr: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`cr-plane ${cls}`}
      style={{
        width: w,
        height: h,
        margin: `${-h / 2}px 0 0 ${-w / 2}px`,
        transform: tr,
      }}
    >
      {children}
    </div>
  );
}

function Frame({
  shot,
  style,
  note = true,
}: {
  shot: Shot;
  style: CSSProperties;
  note?: boolean;
}) {
  return (
    <div className="cr-frame" style={style}>
      <div className="cr-lamp" />
      <div className="cr-mat">
        <div className="cr-ph">
          {shot.src ? (
            <Image
              src={shot.src}
              alt={`Bilal Ait Sai, ${shot.caption}`}
              fill
              loading="eager"
              sizes="(min-width: 768px) 30vw, 85vw"
              className="object-cover sepia-[0.12] contrast-105"
              style={{ objectPosition: shot.position }}
            />
          ) : (
            "e"
          )}
        </div>
      </div>
      {note && <div className="cr-note">{shot.caption}</div>}
    </div>
  );
}

function Word({
  w,
  p,
  a,
  b,
}: {
  w: string;
  p: MotionValue<number>;
  a: number;
  b: number;
}) {
  const opacity = useTransform(p, [a, b], [0.15, 1]);
  return (
    <motion.span className="mr-[0.25em] inline-block" style={{ opacity }}>
      {w}
    </motion.span>
  );
}

function Words({
  text,
  p,
  from,
  to,
}: {
  text: string;
  p: MotionValue<number>;
  from: number;
  to: number;
}) {
  const words = text.split(" ");
  return (
    <p
      className="font-display text-lg leading-[1.2] text-paper md:text-[1.7rem]"
      aria-label={text}
    >
      {words.map((w, i) => (
        <Word
          key={i}
          w={w}
          p={p}
          a={from + ((to - from) * i) / words.length}
          b={from + ((to - from) * (i + 1)) / words.length}
        />
      ))}
    </p>
  );
}

function CreditRow({
  i,
  k,
  v,
  p,
}: {
  i: number;
  k: string;
  v: string;
  p: MotionValue<number>;
}) {
  const a = 0.9 + i * 0.015;
  const opacity = useTransform(p, [a, a + 0.03], [0, 1]);
  const y = useTransform(p, [a, a + 0.03], [12, 0]);
  return (
    <motion.li
      className="flex items-baseline gap-3 py-2"
      style={{ opacity, y }}
    >
      <span className="text-[10px] tracking-[0.3em] text-gold uppercase">
        {k}
      </span>
      <span className="flex-1 border-b border-dotted border-paper/25" />
      <span className="font-display text-base text-paper italic">{v}</span>
    </motion.li>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const media = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(media.matches);
    const ro = new ResizeObserver(() =>
      setSize({ w: el.clientWidth, h: el.clientHeight }),
    );
    updateMobile();
    media.addEventListener("change", updateMobile);
    ro.observe(el);
    return () => {
      media.removeEventListener("change", updateMobile);
      ro.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  // the camera: walks forward, slows into the portrait, with a gentle handheld sway
  const t = (x: number) => clamp((x - 0.04) / 0.74);
  const z = useTransform(p, (x) => Math.sin((t(x) * Math.PI) / 2) * (L - DEND));
  const yaw = useTransform(p, (x) =>
    reduce || isMobile
      ? 0
      : Math.sin(t(x) * Math.PI * 5) * 0.6 * Math.sin(t(x) * Math.PI),
  );
  const bob = useTransform(p, (x) =>
    reduce || isMobile
      ? 0
      : Math.sin(t(x) * Math.PI * 38) * 3 * Math.sin(t(x) * Math.PI),
  );

  const hint = useTransform(p, [0, 0.05], [1, 0]);
  const titleOpacity = useTransform(p, [0.76, 0.84], [0, 1]);
  const titleY = useTransform(p, [0.76, 0.84], [20, 0]);

  const g = size ? geometry(size.w, size.h) : null;

  return (
    <section ref={ref} className="relative h-[350vh] bg-ink md:h-[500vh]">
      <h2 className="sr-only">About elioo</h2>

      <div ref={stageRef} className="cr-view sticky top-0 h-screen">
        {g && (
          <motion.div className="cr-scene" style={{ z, rotateY: yaw, y: bob }}>
            {/* left wall */}
            <Plane
              cls="cr-wall"
              w={L}
              h={2 * g.HH}
              tr={`translate3d(${-g.HW}px,0,${-L / 2}px) rotateY(90deg)`}
            >
              <div className="cr-wainscot" />
              {SIDE.map((s, i) =>
                i % 2 === 0 && (!isMobile || i === 0) ? (
                  <Frame
                    key={i}
                    shot={s}
                    style={{
                      left: 550 + i * SEG - g.PW / 2,
                      top: g.HH + g.PY - g.PH / 2,
                      width: g.PW,
                      height: g.PH,
                    }}
                  />
                ) : null,
              )}
            </Plane>

            {/* right wall */}
            <Plane
              cls="cr-wall"
              w={L}
              h={2 * g.HH}
              tr={`translate3d(${g.HW}px,0,${-L / 2}px) rotateY(-90deg)`}
            >
              <div className="cr-wainscot" />
              {SIDE.map((s, i) =>
                i % 2 === 1 && (!isMobile || i === 1) ? (
                  <Frame
                    key={i}
                    shot={s}
                    style={{
                      left: L - (550 + i * SEG) - g.PW / 2,
                      top: g.HH + g.PY - g.PH / 2,
                      width: g.PW,
                      height: g.PH,
                    }}
                  />
                ) : null,
              )}
            </Plane>

            <Plane
              cls="cr-floor"
              w={2 * g.HW}
              h={L}
              tr={`translate3d(0,${g.HH}px,${-L / 2}px) rotateX(90deg)`}
            />
            <Plane
              cls="cr-ceil"
              w={2 * g.HW}
              h={L}
              tr={`translate3d(0,${-g.HH}px,${-L / 2}px) rotateX(-90deg)`}
            />

            {/* far wall with the big portrait */}
            <Plane
              cls="cr-wall"
              w={2 * g.HW}
              h={2 * g.HH}
              tr={`translate3d(0,0,${-L}px)`}
            >
              <div className="cr-wainscot" />
              <Frame
                shot={HERO}
                note={false}
                style={{
                  left: g.HW - g.HW_ / 2,
                  top: g.HH - 0.02 * (size?.h ?? 0) - g.HH_ / 2,
                  width: g.HW_,
                  height: g.HH_,
                }}
              />
            </Plane>

            {/* ceiling lights */}
            {Array.from({ length: isMobile ? 3 : Math.floor(L / 550) }).map((_, k) =>
              [-1, 1].map((sx) => (
                <div
                  key={`${k}-${sx}`}
                  className="cr-plane cr-bulb"
                  style={{
                    transform: `translate3d(${sx * g.HW * 0.32}px,${-g.HH + 40}px,${-(250 + k * 550)}px)`,
                  }}
                />
              )),
            )}
          </motion.div>
        )}

        {/* warm light + vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255,226,150,.14), transparent 45%), radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,.72))",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[36vh] bg-gradient-to-t from-ink/90 to-transparent md:hidden" />

        <motion.p
          className="pointer-events-none absolute bottom-[6vh] left-1/2 z-20 -translate-x-1/2 text-xs tracking-[0.35em] whitespace-nowrap text-gold uppercase"
          style={{ opacity: hint }}
        >
          Scroll · step inside
        </motion.p>

        {/* the story, shown when you reach the portrait */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-end px-6 pb-[4vh] md:grid md:grid-cols-[1fr_calc(var(--hero-w)_+_5rem)_1fr] md:items-center md:px-14 md:pb-0"
          style={{ "--hero-w": `${g?.heroW ?? 0}px` } as CSSProperties}
        >
          <ul className="hidden max-w-xs justify-self-start md:block">
            <motion.li
              className="mb-2 text-[10px] tracking-[0.35em] text-gold uppercase"
              style={{ opacity: titleOpacity }}
            >
              Credits
            </motion.li>
            {CREDITS.map(([k, v], i) => (
              <CreditRow key={k} i={i} k={k} v={v} p={p} />
            ))}
          </ul>

          <div className="hidden md:block" />

          <div className="w-full max-w-sm md:justify-self-end">
            <motion.div style={{ opacity: titleOpacity, y: titleY }}>
              <p className="hidden text-[10px] tracking-[0.35em] text-gold uppercase md:block">
                Meet
              </p>
              <p className="mb-2 font-display text-3xl leading-none text-gold italic md:text-5xl">
                elioo
              </p>
            </motion.div>
            <Words text={QUOTE} p={p} from={0.8} to={0.92} />
          </div>
        </div>
      </div>
    </section>
  );
}
