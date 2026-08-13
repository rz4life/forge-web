import Image from "next/image";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

/**
 * The App Store + Google Play badge pair.
 *
 * One component because the row appears in three places (Hero3D, FinalCTA,
 * Footer) and the geometry below is fiddly enough that three copies would
 * drift. Ethan's ask was that the two read as "a matched pair, not two
 * mismatched assets", and that is a property of the numbers, not of intent.
 *
 * ── Why the two are NOT the same height ──────────────────────────────────
 *
 * Both files are the vendors' own official artwork, byte-unmodified. Apple
 * and Google ship them with different amounts of built-in clear space, which
 * is the trap: giving both `height: 40px` makes Google's visible button
 * noticeably SMALLER than Apple's, which is exactly the mismatched look we
 * were asked to avoid.
 *
 * Measured from the downloaded files rather than assumed:
 *
 *   apple-app-store.svg   119.664 x 40    visible artwork fills the frame
 *   google-play.png       646 x 250       visible button is 564 x 168,
 *                                         inset 41px on every side
 *
 * So 32.8% of Google's height is transparent margin (16.4% top, 16.4%
 * bottom). At a shared 40px the visible buttons would be 40px vs 26.9px.
 *
 * To make the VISIBLE buttons match at `BADGE_H`, Google's canvas is rendered
 * at `BADGE_H / 0.672`, and a negative margin cancels the transparent border
 * so the row's optical spacing and alignment behave as if both boxes were
 * tight to their artwork. Cropping Google's asset instead would be simpler,
 * but that clear space is a brand requirement rather than decoration, so the
 * file stays untouched and CSS does the work.
 *
 * If either vendor reissues its badge with different padding these numbers go
 * stale, which is why they are derived from named constants with the
 * measurement written down rather than hard-coded into three JSX blocks.
 */

/** Rendered height of the VISIBLE artwork, both badges. */
const BADGE_H = 40;

/** Apple's asset is tight to its artwork. */
const APPLE_W = 119.664;
const APPLE_H = 40;

/** Google's canvas, and the fraction of it the visible button occupies. */
const PLAY_CANVAS_W = 646;
const PLAY_CANVAS_H = 250;
const PLAY_VISIBLE_FRACTION = 168 / 250; // 0.672, measured from the alpha bbox

const playCanvasH = BADGE_H / PLAY_VISIBLE_FRACTION;
const playCanvasW = playCanvasH * (PLAY_CANVAS_W / PLAY_CANVAS_H);
/** Transparent border to pull back in, so the box hugs the artwork. */
const playInsetY = (playCanvasH - BADGE_H) / 2;
const playInsetX = playCanvasW * (41 / PLAY_CANVAS_W);

export default function StoreBadges({
  className = "",
  align = "start",
}: {
  className?: string;
  /** Horizontal alignment of the pair within its container. */
  align?: "start" | "center";
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-3 ${
        align === "center" ? "justify-center" : "justify-start"
      } ${className}`}
    >
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Forge on the App Store"
        className="inline-flex shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-forge-iron"
      >
        <Image
          src="/badges/apple-app-store.svg"
          alt="Download on the App Store"
          width={APPLE_W}
          height={APPLE_H}
          style={{ height: BADGE_H, width: "auto" }}
          unoptimized
          // Eager, not lazy. These are two small brand assets (10KB + 5KB, the
          // same two files reused in all three sections) and lazy-loading them
          // makes the row pop in after the surrounding copy has painted, which
          // looks like a broken image row for a beat.
          loading="eager"
        />
      </a>

      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get Forge on Google Play"
        className="inline-flex shrink-0 overflow-hidden transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-forge-iron"
        style={{ height: BADGE_H, width: playCanvasW - playInsetX * 2 }}
      >
        <Image
          src="/badges/google-play.png"
          alt="Get it on Google Play"
          width={PLAY_CANVAS_W}
          height={PLAY_CANVAS_H}
          style={{
            height: playCanvasH,
            width: playCanvasW,
            marginTop: -playInsetY,
            marginBottom: -playInsetY,
            marginLeft: -playInsetX,
            marginRight: -playInsetX,
          }}
          unoptimized
          // Eager, not lazy. These are two small brand assets (10KB + 5KB, the
          // same two files reused in all three sections) and lazy-loading them
          // makes the row pop in after the surrounding copy has painted, which
          // looks like a broken image row for a beat.
          loading="eager"
        />
      </a>
    </div>
  );
}
