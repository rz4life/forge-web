"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  CALENDLY_URL,
  trialSignupUrl,
} from "@/lib/constants";
import { fadeUp } from "@/lib/animations";
import StoreBadges from "@/components/ui/StoreBadges";

// PRD 9.9 - final CTA, word-for-word.
export default function FinalCTA() {
  return (
    <section
      className="relative py-24 md:py-32 text-center bg-transparent overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.06) 0%, transparent 70%)",
      }}
    >
      {/* Spatial dot grid background - parallax layer */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" data-speed="0.85">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Spatial frame around CTA content */}
        <div className="relative max-w-2xl mx-auto">
          {/* Corner brackets */}
          <div className="absolute -inset-8 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-forge-graphite/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-forge-graphite/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-forge-graphite/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-forge-graphite/50" />
          </div>

          {/* Status indicator */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            {...fadeUp}
            aria-hidden="true"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-forge-cyan animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-forge-smoke">forge / ready</span>
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-3xl md:text-5xl font-medium tracking-[-0.01em] text-forge-white"
            {...fadeUp}
          >
            Stop typing up estimates at 9pm.
          </motion.h2>

          <motion.div
            className="mt-10 flex flex-col items-center gap-4"
            {...fadeUp}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button href={trialSignupUrl()} variant="primary" size="lg">
                Start Free Trial
              </Button>
              <Button
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
              >
                Talk to Sales
              </Button>
            </div>

            <p className="text-forge-smoke text-sm mt-4">
              14-day free trial. No credit card required. Cancel anytime.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <StoreBadges align="center" />
            </div>

            {/* Bottom mono label */}
            <div className="flex items-center gap-2 mt-2" aria-hidden="true">
              <div className="w-8 h-px bg-forge-graphite" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-forge-graphite">walk the job / leave with the estimate</span>
              <div className="w-8 h-px bg-forge-graphite" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
