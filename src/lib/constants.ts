import { HARRIS_STATS } from "@/lib/caseStudy";

// Anchor links are root-relative (/#product, not #product) so they work
// from /pricing, /support, and /legal - not just the homepage.
// Nav per PRD 9.1: Product / How It Works / Customers / Pricing / Support.
export const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Customers", href: "/customers/harris-and-sons" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
];

// The live product dashboard. Set NEXT_PUBLIC_DASHBOARD_URL in the Vercel
// project to move it. The fallback is app.forge.equipment, the custom app
// domain that went live 2026-08-08 — production no longer needs the env var
// set; it's there for preview/staging builds pointing at a different
// dashboard deploy.
// next.config.ts reads the SAME env var for its app-path redirects: change the
// env var and both the links and the redirects follow. Do not reintroduce a
// second hardcoded copy of this host.
export const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.forge.equipment";
export const CALENDLY_URL = "https://calendly.com/christian-forge/30min";
export const APP_STORE_URL = "https://apps.apple.com/us/app/id6762521834";
// Android shipped 2026-08-13, so the store links are a pair everywhere the
// App Store link appears (hero, final CTA, footer). The pcampaignid param is
// the one Google hands out with the listing's share link; swap it for a real
// campaign id if the marketing side ever wants attribution split by surface.
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.forgesolutions.forge&pcampaignid=web_share";
export const CASE_STUDY_PATH = "/customers/harris-and-sons";

// Sign-in entry point into the product. Deliberately targets `/login`
// rather than the bare DASHBOARD_URL: hitting the dashboard root as a
// signed-out user works, but only by bouncing through the app shell's auth
// guard first, which flashes a redirect before the form appears. Naming the
// route directly is one hop instead of two.
// Note the landing ALSO serves /login itself as a 307 to this same target
// (next.config.ts), so an inbound forge.equipment/login link keeps working
// - but in-page links should point at the real destination, not our own
// redirect, so a user never takes two hops when one will do.
export function loginUrl(): string {
  return `${DASHBOARD_URL}/login`;
}

// Trial navigation carries only the existing signup-mode hint. Dashboard
// app/login/page.tsx does not consume plan or seat-count parameters, and
// Firebase signup accepts email/password only. Calculator counts are a
// quote, not checkout configuration; do not invent unconsumed Sub params.
export function trialSignupUrl(): string {
  return `${DASHBOARD_URL}/login?mode=signup`;
}

// Android waitlist is gated OFF by default: the consent language is a
// placeholder pending TCPA compliance review (PRD Open Item #10). Flip by
// setting NEXT_PUBLIC_ANDROID_WAITLIST=true at build time.
export const ANDROID_WAITLIST_ENABLED =
  process.env.NEXT_PUBLIC_ANDROID_WAITLIST === "true";

export type FaqItem = { question: string; answer: string };

// Pricing FAQ, including the F-075/F-076 decisions through2026-09-08:
// shared included seats, additional seats priced by class, assigned-task Sub access.
export const PRICING_FAQ: FaqItem[] = [
  {
    question: "Do I need to talk to sales to get started?",
    answer:
      "No. Start Free Trial takes you straight into the product, with 14 days free. If you'd rather see it on a real job first, book time with our team instead.",
  },
  {
    question: "Do you need my card to start the trial?",
    answer:
      "No. Use Forge free for 14 days without entering payment info. We'll remind you before the trial ends. Add a payment method any time to keep your seats active. If you don't, your account pauses. Nothing gets deleted.",
  },
  {
    // F075 Sep8: included seats are type-agnostic, staff first.
    // F076: describe assigned-task access without promising bid submission.
    question: "What counts as a seat?",
    answer:
      "A staff seat is an owner, admin, PM, or estimator. A Sub seat is for a subcontractor. Your first 3 seats can be either kind and are included in the base price. Staff use the included seats first, then Subs use any remaining. Beyond those 3, each additional staff seat is $39/month or $374/year, and each additional Sub seat is $9.99/month or $95.90/year. A Sub can access assigned tasks, with no view of the job's full scope, your estimates, or anyone else's pricing.",
  },
  {
    question: "Is there a contract?",
    answer:
      "Monthly is month-to-month. Annual is billed once a year at a 20% discount and can be cancelled at renewal.",
  },
  {
    question: "What platforms does Forge run on?",
    answer:
      "iOS, Web, and Android. Download from the App Store or Google Play.",
  },
  {
    question: "How is this different from Buildertrend?",
    answer:
      "Forge isn't a Buildertrend replacement. It's what happens before Buildertrend. Record the walk, get a structured scope and estimate, then export straight into your existing Buildertrend job budget.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, from Settings, no call required.",
  },
];

// Support-page subset - help/account/data questions, distinct from the pricing FAQ.
export const SUPPORT_FAQ: FaqItem[] = [
  {
    question: "How do I get help or report a problem?",
    answer:
      "The fastest way to reach us is email: team@forge.equipment. The contact form below works too. Tell us what you were doing, what you expected, and what happened instead. Screenshots help.",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to respond to every message within one business day. Active job-walk issues are prioritized. If something is blocking you in the field, say so in the subject line and we'll jump on it.",
  },
  {
    question: "I found a bug. What should I do?",
    answer:
      "Send it to team@forge.equipment with the word \"Bug\" in the subject. Include your device and browser, the project or walk where it happened, and the steps to reproduce it. The more detail the better.",
  },
  {
    question: "Can I cancel, pause, or delete my account?",
    answer:
      "Yes. Monthly plans are month-to-month. Cancel anytime from Settings, no call required, and you keep access through the current billing period. If your free trial ends without a payment method, your account pauses (nothing is deleted) and access resumes once a card is added. To delete your account and personal data, email us and we'll remove it within 30 days, except where retention is required by law. See our Privacy Policy for details.",
  },
  {
    question: "Is my job walk data secure?",
    answer:
      "Your data is encrypted in transit and at rest. Forge processes your audio and photos through secure AI pipelines. Nothing is shared, sold, or used to train models. Your field intelligence stays yours.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Every plan starts with a 14-day free trial. No credit card required. We'll remind you before it ends. Add a payment method any time to keep your seats active. If you don't, your account pauses and nothing gets deleted.",
  },
];

export const FEATURES = [
  {
    label: "CAPTURE",
    title: "Walk the Job. We'll Handle the Notes.",
    description:
      "Start a job walk and Forge records everything: audio up to 90 minutes, plus photos you can voice-tag on the fly. Say \"Photo: kitchen sink wall\" and it's indexed automatically.",
    bullets: [
      "Audio recording up to 90 min",
      "Voice-tagged photo capture",
      "All media stored under one project",
    ],
  },
  {
    label: "AI ENGINE",
    title: "Raw Walk → Priced Estimate in Minutes",
    description:
      "Forge's AI doesn't guess. It organizes your walk into a scope broken out by trade and a priced, line-item estimate. Anything it's not confident about gets flagged, so you check it, not guess at it.",
    bullets: [
      "Scope + questions organized by area",
      "Line-item estimate priced by trade",
      "Uncertainties flagged, never assumed",
    ],
  },
  {
    label: "EXPORT",
    title: "One Tap to Buildertrend-Ready",
    description:
      "Review the AI output, make edits inline, apply your markup, then export. Copy formatted notes directly to Buildertrend, download a PDF packet with photos, or send a PM handoff email.",
    bullets: [
      "Inline editing: add, delete, reorder",
      "One-tap copy to Buildertrend",
      "PDF + photo packet download",
      "PM handoff email template",
    ],
  },
];

// How it works - PRD 9.5, word-for-word (3 steps).
export const STEPS = [
  {
    number: "01",
    title: "Walk it.",
    description:
      "Hit record on your phone and walk the job. Talk like you would to your PM. No forms, no \"what type of meeting is this\" screen first.",
  },
  {
    number: "02",
    title: "Forge structures it.",
    description:
      "In minutes, Forge turns the walk into a scope broken out by trade and a priced estimate. Anything it's not confident about gets flagged, so you check it, not guess at it.",
  },
  {
    number: "03",
    title: "Review, then send.",
    description:
      "Edit any line, apply your markup, export straight to Buildertrend, PDF, or CSV. Nothing leaves Forge until you approve it.",
  },
];

// Hero stat bar - PRD 9.3. "6 TRADES" is intentionally gone (read as a
// limitation). 4th stat stays "MINUTES TO A PRICED SCOPE" until the real
// median processing time is pulled from production (Open Item #2 - do NOT
// invent a harder number).
//
// The first stat used to be "20+ MIN SAVED PER WALK", which measured only the
// walk itself. Ethan Rife replaced it 2026-08-13 with the whole-process number
// so the hero and the Harris & Sons case study state the same figure. It reads
// from HARRIS_STATS rather than repeating "75%": caseStudy.ts owns every number
// that appears on more than one surface, and this is now one of them.
export const HERO_STATS = [
  { value: HARRIS_STATS.estimatingTimeCut, label: "LESS TIME ESTIMATING" },
  { value: "1", label: "WORKFLOW" },
  { value: "0", label: "TYPING" },
  { value: "MINUTES", label: "TO A PRICED SCOPE" },
];
