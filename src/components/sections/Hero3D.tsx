"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import StoreBadges from "@/components/ui/StoreBadges";
import {
  CALENDLY_URL,
  HERO_STATS,
  trialSignupUrl,
} from "@/lib/constants";

const HexNutScene = dynamic(() => import("@/components/three/HexNutScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-forge-body" />,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function CharacterReveal({ text, className, delay = 0, stagger = 0.03 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  const containerVariants = {
    initial: {},
    animate: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
  const wordVariants = {
    initial: {},
    animate: {
      transition: { staggerChildren: stagger },
    },
  };
  const child = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      aria-label={text}
    >
      {words.map((word, wi) => (
        <motion.span key={wi} variants={wordVariants} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {word.split("").map((char, ci) => (
            <motion.span key={ci} variants={child} style={{ display: "inline-block" }}>
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </motion.span>
      ))}
    </motion.span>
  );
}

const transition = (delay: number) => ({
  duration: 0.8,
  ease: "easeOut" as const,
  delay,
});

export default function Hero3D() {
  return (
    <section id="hero" className="relative overflow-hidden h-screen flex flex-col">
      {/* 3D Background - fills entire viewport */}
      <Suspense fallback={<div className="absolute inset-0 bg-forge-body" />}>
        <HexNutScene />
      </Suspense>

      {/* Bottom-anchored content - sits below the 3D scene */}
      <div className="relative z-10 mt-auto pb-16 md:pb-20">
        {/* Gradient fade from transparent to dark at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-forge-body via-forge-body/80 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6">
          {/* Eyebrow - PRD 9.2 */}
          <motion.div
            className="flex items-center gap-3 mb-6"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={transition(0.2)}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-forge-cyan" />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-forge-smoke">
              AI ESTIMATING FOR GENERAL CONTRACTORS
            </span>
          </motion.div>

          {/* Headline - left-aligned, big, cinematic with character animation */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-0.03em] leading-[0.95] text-forge-white uppercase">
            <CharacterReveal text="Walk the job." delay={0.4} stagger={0.03} />
            <br />
            <CharacterReveal text="Leave with the estimate." delay={0.8} stagger={0.02} className="text-forge-ash/40" />
          </h1>

          {/* Subtext + CTA row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mt-8">
            <motion.p
              className="text-forge-smoke text-base md:text-lg leading-relaxed max-w-xl"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={transition(0.6)}
            >
              Forge turns a recorded walkthrough into a structured, trade-by-trade
              scope and a priced estimate. In minutes. Not the night before you
              were going to send it. Built for remodelers running $5M–$10M a year,
              not hobby crews.
            </motion.p>

            <motion.div
              className="flex flex-col items-start md:items-end gap-3"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={transition(0.8)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button href={trialSignupUrl()} variant="primary" size="md">
                  Start Free Trial. No credit card required.
                </Button>
                <Button href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" variant="secondary" size="md">
                  Talk to Sales
                </Button>
              </div>
              <p className="text-forge-smoke text-sm">
                Live on iOS, Web, and Android.
              </p>
              {/* Store links, one per mobile platform. Both use the same type
                  size and link treatment so the row reads as a matched pair
                  rather than two differently-sized store badges. */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
                <StoreBadges align="start" />
              </div>
            </motion.div>
          </div>

          {/* Bottom stat bar - PRD 9.3 (product mechanics, not customer outcomes) */}
          <motion.div
            className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-12 pt-6 border-t border-forge-graphite/30"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={transition(1.0)}
          >
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-medium text-forge-white font-[family-name:var(--font-mono)]">{value}</span>
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-forge-smoke">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
