"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Reveal from "@/components/useful/Reveal";
import WordReveal from "@/components/useful/WordReveal";

// Drop a photo in /public (example: public/bilal.jpg) then set this to "/bilal.jpg"
const PHOTO: string | null = null;

const TAGS = ["Chant", "Courts métrages", "Cinématographie"];

export default function About() {
  const frameRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  // frame opens upward like a curtain, then the photo drifts inside it
  const clipPath = useTransform(
    p,
    [0.05, 0.4],
    [
      "inset(100% 0% 0% 0% round 200px 200px 0px 0px)",
      "inset(0% 0% 0% 0% round 200px 200px 0px 0px)",
    ],
  );
  const imgY = useTransform(p, [0, 1], ["-8%", "8%"]);
  const imgScale = useTransform(p, [0.05, 0.4], [1.35, 1.1]);
  const ringRotate = useTransform(p, [0, 1], [0, 220]);

  return (
    <section className="relative px-6 py-32 md:px-16 md:py-48">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
        {/* Photo frame */}
        <div ref={frameRef} className="relative mx-auto w-full max-w-md">
          {/* turning ring behind the frame */}
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute top-1/2 left-1/2 -z-10 w-[125%] -translate-x-1/2 -translate-y-1/2 text-sage"
            style={{ rotate: ringRotate, willChange: "transform" }}
            aria-hidden
          >
            <defs>
              <path
                id="ringPath"
                d="M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0"
              />
            </defs>
            <text
              className="fill-current font-display"
              fontSize="9.5"
              letterSpacing="3"
            >
              <textPath href="#ringPath">
                CHANTER · ÉCRIRE · FILMER · RECOMMENCER · CHANTER · ÉCRIRE · FILMER · RECOMMENCER ·
              </textPath>
            </text>
          </motion.svg>

          <motion.div
            className="relative aspect-3/4 overflow-hidden bg-forest"
            style={{ clipPath, willChange: "clip-path" }}
          >
            <motion.div
              className="absolute inset-[-10%]"
              style={{ y: imgY, scale: imgScale, willChange: "transform" }}
            >
              {PHOTO ? (
                <Image
                  src={PHOTO}
                  alt="Bilal Ait Sai, elioo"
                  fill
                  sizes="(min-width: 768px) 40vw, 90vw"
                  className="object-cover sepia-[0.25] contrast-[1.05]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-leaf via-forest to-ink">
                  <span className="font-display text-7xl text-gold/80 italic">
                    e
                  </span>
                </div>
              )}
            </motion.div>
            {/* warm vintage wash over the photo */}
            <div className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply" />
          </motion.div>
        </div>

        {/* Story */}
        <div>
          <Reveal>
            <p className="mb-8 flex items-center gap-4 text-xs tracking-[0.35em] text-leaf uppercase">
              <span className="h-px w-10 bg-leaf" />
              Mon histoire
              <span className="h-px w-10 bg-leaf" />
            </p>
          </Reveal>

          <WordReveal
            className="font-display text-3xl leading-[1.15] text-forest md:text-5xl"
            text="J’écris les chansons que j’ai besoin d’entendre, et je filme les instants que j’ai peur d’oublier."
          />

          <Reveal delay={0.1} className="mt-10 max-w-md">
            <p className="text-lg leading-relaxed text-ink/70">
              elioo est le nom sous lequel Bilal chante. Une voix chaleureuse,
              des mots sincères et des courts métrages tournés comme des
              souvenirs. Chaque chanson et chaque image sont créées avec
              lenteur, et faites pour être ressenties.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-10">
            <ul className="flex flex-wrap gap-3">
              {TAGS.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-forest/25 px-4 py-2 text-xs tracking-[0.2em] text-forest uppercase"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
