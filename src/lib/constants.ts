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

// The Master Subscription Agreement is published once, by the app
// (Forge_Web app/legal/msa, current version plus every dated version at
// /legal/msa/<id>). This site links there instead of carrying a copy
// (F-050, ruling 11 in the 2026-09-22 integration PRD). next.config.ts
// forwards /legal/msa and /legal/msa/* here for the same reason.
export function msaUrl(): string {
  return `${DASHBOARD_URL}/legal/msa`;
}

// The Terms of Service and the Privacy Policy are published once, by the app
// too (Forge_Web app/terms and app/privacy), for the same reason (F-662, Q3 =
// a, RZ 2026-09-24). This site carried its own copies and they had drifted:
// its Privacy Policy said declining AI consent still lets you use Forge, where
// the app's (the one the product links) says AI processing is required, and
// its Terms printed a free-beta change log. /legal#terms and /legal#privacy
// stay as short sections that link here, because the App Store listing and
// older pages cite those anchors; next.config.ts forwards /terms and /privacy.
export function termsUrl(): string {
  return `${DASHBOARD_URL}/terms`;
}

export function privacyUrl(): string {
  return `${DASHBOARD_URL}/privacy`;
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

// Integrations, version 1 (F-515). The band after "How it works", the
// "Developers" footer group, the /docs redirect and the extra keywords
// publish together, on the day integrations open to every company, and not
// before: the manual they link to (app.forge.equipment/docs) must be live
// first, and the site must not say Forge has an MCP server before a company
// other than the design partner can use it.
//
// An ALLOWLIST, like FORGE_INTERNAL_PAGES: only "on" turns it on, so a build
// that forgets the variable, or sets "true", publishes nothing early. The
// pages are static, so it is read at BUILD time: set it in the landing's
// Vercel project and redeploy. CI builds once without it (and checks nothing
// shows) and once with it (and audits the band at every width).
export const INTEGRATIONS_GA = process.env.NEXT_PUBLIC_INTEGRATIONS_GA === "on";

// The public manual. Linked directly (one hop), like Terms and Privacy;
// forge.equipment/docs forwards here too once INTEGRATIONS_GA is on.
export function docsUrl(): string {
  return `${DASHBOARD_URL}/docs`;
}

// The band's words. The body is the version 1 line of the integration legal
// draft, section 6.3, pinned in scripts/copy-claims.test.mjs. It names Claude
// only as an example of a tool that is not required, and names no other
// product: the site names only tools that have been connected at least once.
export const INTEGRATIONS_BAND = {
  label: "MCP SERVER + PUBLIC API",
  title: "Your Forge Data, in Your Own Tools",
  body: "Forge has an MCP server and a public API. Use them from any MCP or agentic tool, not just Claude, or from your own software, to read your jobs, scopes, estimates and walk transcripts. Data access is on by default; an owner or admin can turn it off any time in Settings.",
  cta: "Read the docs",
};

// The manual's pages the band and the footer link to. The paths are the
// public manual's own routes (Forge_Web, F-514: app/docs/<slug>), linked one
// hop like docsUrl().
export function docsPageUrl(slug: "connect" | "api" | "what-is-shared" | "revoke"): string {
  return `${docsUrl()}/${slug}`;
}

// The band's two cards, one per way in. Every line restates the manual
// (F-514 start-here, connect, api, what-is-shared and revoke pages) and names
// no AI product: the site names only tools that have been connected once,
// and none has been yet.
export const INTEGRATION_CARDS = [
  {
    kind: "mcp",
    badge: "MCP SERVER",
    title: "For AI Tools",
    line: "Any AI tool that supports MCP can connect and ask Forge about your jobs.",
    points: [
      "Connects with the tool's own sign-in",
      "An owner or admin approves one company",
      "Reads and edits (only with your permission)",
    ],
    link: { label: "Connect an AI tool", slug: "connect" },
  },
  {
    kind: "api",
    badge: "PUBLIC API",
    title: "For Your Software",
    line: "Your own programs read the same data with plain web requests.",
    points: [
      "An API key, or OAuth for products that serve many companies",
      "Each key or connection reads one company",
      "Read only: it cannot change anything in Forge",
    ],
    link: { label: "API reference", slug: "api" },
  },
] as const;

// Under the cards: who holds the switch, and the two pages that answer
// "what does it see" and "how do I stop it".
export const INTEGRATIONS_TRUST = {
  // F-524 (T30): text only, no logo. Same words as the app's export line.
  partner: "Forge also works with Buildertrend and JobTread. An owner or admin taps to send to JobTread, and Forge never deletes anything in JobTread.",
  line: "Owners and admins see every connection and can end any of them at any time.",
  links: [
    { label: "What is shared", slug: "what-is-shared" },
    { label: "Ending access", slug: "revoke" },
  ],
} as const;

export type FaqItem = { question: string; answer: string };

// Pricing FAQ, including the F-075/F-076 decisions through2026-09-08:
// shared included seats, additional seats priced by class, assigned-task Sub access.
// "How is this different from Buildertrend?" was cut under F-662 (N8): it
// framed Forge as a pre-step to a competitor and promised an export "straight
// into your Buildertrend job budget", which is a CSV uploaded by hand. A new
// answer would be a new claim needing its own check, so none was written.
export const PRICING_FAQ: FaqItem[] = [
  {
    question: "Do I need to talk to sales to get started?",
    answer:
      "No. Start Free Trial takes you straight into the product, with 14 days free. If you'd rather see it on a real job first, book time with our team instead.",
  },
  {
    // F075 Sep8: included seats are type-agnostic, staff first.
    // F075 Sep14 (Ethan): an admin can switch an included seat between staff
    // and Sub; a Sub seat bought past the included 3 stays a Sub seat. That
    // is MSA 3.4 at app.forge.equipment/legal/msa and the backend's
    // PURCHASED_SUB_SEAT_LOCKED refusal.
    // F076 Sep14 (Ethan): a Sub is not a team role and is described by what
    // it cannot see. The sentence is the app's own (Forge_Web lib/display.ts
    // SUB_ROLE_SCOPE_COPY), so the site promises exactly what the product
    // enforces and no bid submission or Sub estimate walk.
    question: "What counts as a seat?",
    answer:
      "A staff seat is an owner, admin, PM, or estimator, and each has a team role. A Sub seat is for a subcontractor and is not a team role: a Sub sees only the jobs and tasks you assign to them, can add updates and photos to that work, and never sees your pricing, your estimates or your team's conversations. Your first 3 seats can be either kind and are included in the base price. Staff use the included seats first, then Subs use any remaining, and your admin can switch an included seat between staff and Sub at any time. Beyond those 3, each additional staff seat is $39/month or $374/year, and each additional Sub seat is $9.99/month or $95.90/year. A Sub seat added beyond the included 3 keeps Sub access and can't be changed to a staff seat.",
  },
  {
    question: "Is there a contract?",
    answer:
      "Monthly is month-to-month. Annual is billed once a year at a 20% discount and can be cancelled at renewal.",
  },
  {
    // F-524 (T30): live with version 2. Text only, no logo. Sends are an owner
    // or admin tap, and Forge never deletes in JobTread.
    question: "Does Forge work with Buildertrend and JobTread?",
    answer:
      "Yes. Export a Buildertrend import file (CSV) to upload yourself, or send the estimate to JobTread. An owner or admin taps to send, and Forge never deletes anything in JobTread. You can also download a PDF or a CSV.",
  },
  {
    question: "What platforms does Forge run on?",
    answer:
      "iOS, Web, and Android. Download from the App Store or Google Play.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, from Settings, no call required.",
  },
];

// Support-page subset - help/account/data questions, distinct from the pricing FAQ.
// F-662 (2026-09-24): the reply time is an aim, not a promise, everywhere (U5,
// Q10 = a); deletion is self-serve from Settings, and workspace records go 90
// days after the workspace closes, as the app's Privacy Policy says (N6); and
// data IS shared, with the AI providers the Privacy Policy names, so "Nothing
// is shared" was false (F9, Q2 = a).
// F-515 (integration version 1): the security answer said audio, transcripts
// and photos go "only to the AI providers". Once a company's data access is on (it is by default),
// an app or AI tool the company connects reads walk transcripts too, so "only"
// becomes false. The answer is now the words of legal draft 6.3, pinned in
// scripts/copy-claims.test.mjs, and true both before and after version 1.
export const SUPPORT_FAQ: FaqItem[] = [
  {
    question: "How do I get help or report a problem?",
    answer:
      "The fastest way to reach us is email: team@forge.equipment. The contact form below works too. Tell us what you were doing, what you expected, and what happened instead. Screenshots help.",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to reply within one business day. Active job-walk issues are prioritized. If something is blocking you in the field, say so in the subject line and we'll jump on it.",
  },
  {
    question: "I found a bug. What should I do?",
    answer:
      "Send it to team@forge.equipment with the word \"Bug\" in the subject. Include your device and browser, the project or walk where it happened, and the steps to reproduce it. The more detail the better.",
  },
  {
    question: "Can I cancel, pause, or delete my account?",
    answer:
      "Yes. Monthly plans are month-to-month. Cancel anytime from Settings, no call required, and you keep access through the current billing period. If your free trial ends without a payment method, your account pauses (nothing is deleted) and access resumes once a card is added. Delete your account any time from Settings. Workspace records are permanently deleted 90 days after the workspace is closed. See our Privacy Policy.",
  },
  {
    question: "Is my job walk data secure?",
    answer:
      "Your data is encrypted in transit and at rest. We never sell it, and the AI providers Forge uses do not train on it. You decide whether any other app can read it.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Every plan starts with a 14-day free trial. We'll remind you before it ends. Add a payment method any time to keep your seats active. If you don't, your account pauses and nothing gets deleted.",
  },
];

// Every sentence below says only what the product does today (F-662, from the
// F-658 claims audit, RZ 2026-09-24). What each one replaced, and why:
// - CAPTURE: recording stops at 4 hours on iOS and Android (it said 90
//   minutes). Nothing parses "Photo: ..." out of speech; photos are saved to
//   the walk with their time, so the voice-tag sentence and bullet are gone.
// - AI ENGINE: the prompts DO make assumptions and record them, so "doesn't
//   guess" and "never assumed" were false. What is true is that assumptions
//   and low-confidence lines are flagged for the user to check.
// - EXPORT: the Buildertrend output is a CSV in the layout of Buildertrend's
//   estimate importer, uploaded by hand. There is no one-tap copy, no photo
//   packet (no PDF includes job photos), no reorder, and no PM email template;
//   the real handoff email is the automatic "assigned you" email.
export const FEATURES = [
  {
    label: "CAPTURE",
    title: "Walk the Job. We'll Handle the Notes.",
    description:
      "Start a job walk and Forge records everything: audio up to 4 hours, plus photos, saved to the walk with the time they were taken.",
    bullets: [
      "Audio recording up to 4 hours",
      "Photos saved with the walk",
      "All media stored under one project",
    ],
  },
  {
    label: "AI ENGINE",
    title: "Raw Walk → Priced Estimate in Minutes",
    description:
      "Forge organizes your walk into a scope broken out by trade and a priced, line-item estimate. Anything it's not confident about gets flagged, so you check it, not guess at it.",
    bullets: [
      "Scope + questions organized by area",
      "Line-item estimate priced by trade",
      "Assumptions and low-confidence lines flagged for you to check",
    ],
  },
  {
    label: "EXPORT",
    title: "Buildertrend-Ready in One Export",
    description:
      "Review the AI output, make edits inline, apply your markup, then export a Buildertrend import file (CSV), a PDF, or a CSV, or send the estimate to JobTread. An owner or admin taps to send, and Forge never deletes anything in JobTread. Your PM gets an email when you hand the job over.",
    bullets: [
      "Inline editing: add, edit, delete",
      "Buildertrend import file (CSV)",
      "Send to JobTread (owner or admin)",
      "PDF download",
    ],
  },
];

// How it works - PRD 9.5 (3 steps). Step 3 was corrected under F-662: the
// Buildertrend output is an import file, not a straight export, and "Nothing
// leaves Forge until you approve it" was false (closing a job emails the
// client a summary, sub texts go out on push, and audio and transcripts go to
// the AI providers). What IS true is that estimates and scopes are sent by you.
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
      "Edit any line, apply your markup, export a Buildertrend import file, PDF, or CSV. Estimates and scopes reach your client only when you send them.",
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
//
// "1 WORKFLOW" and "0 TYPING" came off under F-662 (2026-09-24): filler, and
// "0 typing" contradicted the inline editing the same page sells.
export const HERO_STATS = [
  { value: HARRIS_STATS.estimatingTimeCut, label: "LESS TIME ESTIMATING" },
  { value: "MINUTES", label: "TO A PRICED SCOPE" },
];
