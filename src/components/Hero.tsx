"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

// One continuous spiral groove, computed once
const SPIRAL = (() => {
  const cx = 250;
  const cy = 250;
  const turns = 16;
  const steps = turns * 36;
  const r0 = 70;
  const r1 = 240;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a)).toFixed(1);
    d += `${i === 0 ? "M" : "L"}${x} ${y} `;
  }
  return d;
})();

const NAME = "elioo".split("");

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
  });

  // Desktop: stays fully inside the screen, then fades out
  const dRotate = useTransform(p, [0, 1], [0, reduce ? 0 : 540]);
  const dScale = useTransform(p, [0, 0.7, 1], [1, 1.06, 0.92]);
  const dX = useTransform(p, [0, 1], ["0%", "-10%"]);
  const dOpacity = useTransform(p, [0, 0.72, 1], [1, 1, 0]);

  // Mobile: grows until it covers the screen, then fades away
  const mRotate = useTransform(p, [0, 1], [0, reduce ? 0 : 720]);
  const mScale = useTransform(p, [0, 0.5, 0.85, 1], [1, 2.4, 7, 7]);
  const mOpacity = useTransform(p, [0, 0.15, 0.8, 1], [0.4, 1, 1, 0]);

  const rotate = isMobile ? mRotate : dRotate;
  const scale = isMobile ? mScale : dScale;
  const opacity = isMobile ? mOpacity : dOpacity;
  const x = isMobile ? undefined : dX;

  // Text
  const dTextOpacity = useTransform(p, [0, 0.55], [1, 0]);
  const mTextOpacity = useTransform(p, [0, 0.28], [1, 0]);
  const textOpacity = isMobile ? mTextOpacity : dTextOpacity;
  const textY = useTransform(p, [0, 0.6], [0, -90]);

  return (
    <section ref={ref} className="relative h-[240vh] md:h-[190vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Vinyl */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[78vw] -translate-x-1/2 -translate-y-1/2 md:right-[6vw] md:left-auto md:w-[min(80vh,58vw)] md:translate-x-0">
          <motion.div
            className="relative h-full w-full"
            style={{
              scale,
              x,
              opacity,
              willChange: isMobile ? "auto" : "transform, opacity",
            }}
          >
            <motion.svg
              viewBox="0 0 500 500"
              className="h-full w-full md:drop-shadow-[0_30px_50px_rgba(14,26,18,0.35)]"
              style={{ rotate }}
              aria-hidden
            >
              <defs>
                <path
                  id="labelCircle"
                  d="M 250,250 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
                  fill="none"
                />
              </defs>

              <circle cx="250" cy="250" r="248" className="fill-forest" />
              <circle
                cx="250"
                cy="250"
                r="244"
                className="fill-none stroke-sage"
                strokeOpacity="0.35"
                strokeWidth="0.8"
              />

              <path
                d={SPIRAL}
                className="fill-none stroke-sage"
                strokeOpacity="0.28"
                strokeWidth="0.7"
              />

              {[110, 155, 200].map((r) => (
                <circle
                  key={r}
                  cx="250"
                  cy="250"
                  r={r}
                  className="fill-none stroke-sage"
                  strokeOpacity="0.5"
                  strokeWidth="1.2"
                />
              ))}

              <circle cx="250" cy="250" r="68" className="fill-gold" />
              <circle
                cx="250"
                cy="250"
                r="60"
                className="fill-none stroke-ink"
                strokeOpacity="0.3"
                strokeWidth="0.8"
              />
              <text
                className="fill-ink font-display"
                fontSize="8.5"
                textLength="272"
                lengthAdjust="spacing"
              >
                <textPath href="#labelCircle">
                  ELIOO · BILAL AIT SAI ·{" "}
                </textPath>
              </text>
              <circle cx="250" cy="250" r="7" className="fill-paper" />
            </motion.svg>

            {/* fixed light sheen, doesn't rotate */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 35deg, transparent 0 18%, rgba(255,255,255,0.16) 24%, transparent 31% 66%, rgba(255,255,255,0.10) 73%, transparent 80%)",
              }}
            />
          </motion.div>
        </div>

        {/* Text */}
        <motion.div
          className="relative z-10 px-6 md:px-16"
          style={{ y: textY, opacity: textOpacity }}
        >
          <motion.p
            className="mb-6 text-xs tracking-[0.35em] text-leaf uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            Chanteur · Auteur-compositeur · Réalisateur
          </motion.p>

          <h1
            className="font-display text-[22vw] leading-[0.85] text-forest italic md:text-[11rem]"
            aria-label="elioo"
          >
            {NAME.map((l, i) => (
              <motion.span
                key={i}
                className="inline-block"
                aria-hidden
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.09,
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {l}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-8 max-w-sm text-lg text-ink/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Bilal Ait Sai. Musique et cinéma, créés avec lenteur.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
