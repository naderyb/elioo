"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Reveal from "@/components/useful/Reveal";

// Replace with his real links
const INSTAGRAM = "https://instagram.com/";
const EMAIL = "hello@elioo.com";

const MARQUEE = "elioo ✦ chanter ✦ écrire ✦ filmer ✦ ";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  // marquee slides with scroll (no JS loop, just scroll-linked)
  const marqueeX = useTransform(p, [0, 1], ["0%", "-35%"]);
  // sun rises behind the text
  const sunY = useTransform(p, [0, 0.8], ["60%", "0%"]);
  const sunScale = useTransform(p, [0, 0.8], [0.6, 1]);

  return (
    <section
      ref={ref}
      id="contact"
      className="relative overflow-hidden bg-paper pt-32 md:pt-48"
    >
      {/* marquee */}
      <div className="border-y border-forest/15 py-5">
        <motion.div
          className="flex w-max whitespace-nowrap font-display text-4xl text-forest/80 italic md:text-6xl"
          style={{ x: marqueeX, willChange: "transform" }}
          aria-hidden
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}>{MARQUEE}</span>
          ))}
        </motion.div>
      </div>

      {/* main */}
      <div className="relative px-6 py-32 text-center md:px-16 md:py-48">
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[85vw] max-w-180 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/35 blur-[2px]"
          style={{ y: sunY, scale: sunScale, willChange: "transform" }}
          aria-hidden
        />

        <div className="relative">
          <Reveal>
            <p className="mb-8 text-xs tracking-[0.35em] text-leaf uppercase">
              Dites bonjour
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="mx-auto max-w-4xl font-display text-6xl leading-[0.95] text-forest italic md:text-8xl">
              Créons quelque chose de magnifique.
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-md text-lg text-ink/70">
              Collaborations, concerts, projets de films, ou simplement un mot
              gentil.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-forest px-8 py-4 text-xs tracking-[0.25em] text-paper uppercase transition-transform duration-500 hover:-translate-y-1 hover:bg-leaf"
              >
                Instagram
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="rounded-full border border-forest/40 px-8 py-4 text-xs tracking-[0.25em] text-forest uppercase transition-all duration-500 hover:-translate-y-1 hover:bg-forest hover:text-paper"
              >
                {EMAIL}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
