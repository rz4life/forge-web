import { Bot, Braces, Check, ArrowUpRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  INTEGRATIONS_BAND,
  INTEGRATIONS_GA,
  INTEGRATION_CARDS,
  INTEGRATIONS_TRUST,
  docsPageUrl,
  docsUrl,
} from "@/lib/constants";

// Integrations, version 1 (F-515): a short band after "How it works" that says
// Forge has an MCP server and a public API, and links to the manual. It
// renders nothing unless the site was built with NEXT_PUBLIC_INTEGRATIONS_GA=on
// (see INTEGRATIONS_GA in src/lib/constants.ts). The top nav does not change
// and there is no new page: this band and the footer group are the whole of
// the version 1 landing addition.
//
// Layout: the approved line, then one card per way in (a mark, a badge, a
// one-line value, three facts and a link to that page of the manual), then
// the line about who can end access. No AI product's name or logo appears:
// the site names only tools that have been connected once.
const CARD_ICONS = { mcp: Bot, api: Braces } as const;

export default function IntegrationsBand() {
  if (!INTEGRATIONS_GA) return null;

  return (
    <section
      id="developers"
      aria-labelledby="developers-title"
      className="relative py-20 md:py-24 border-t border-white/5"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel>{INTEGRATIONS_BAND.label}</SectionLabel>
          <h2
            id="developers-title"
            className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-[-0.01em] uppercase text-forge-white mt-6"
          >
            {INTEGRATIONS_BAND.title}
          </h2>
          <p className="text-forge-smoke leading-relaxed mt-6">{INTEGRATIONS_BAND.body}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {INTEGRATION_CARDS.map((card) => {
            const Icon = CARD_ICONS[card.kind];
            return (
              <Card key={card.kind} className="p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 shrink-0 flex items-center justify-center border border-forge-cyan/40 bg-forge-cyan/10"
                    aria-hidden="true"
                  >
                    <Icon size={22} strokeWidth={1.5} className="text-forge-cyan" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-forge-cyan">
                      {card.badge}
                    </span>
                    <h3 className="text-lg font-medium uppercase tracking-[-0.01em] text-forge-white mt-1">
                      {card.title}
                    </h3>
                  </div>
                </div>
                <p className="text-forge-smoke leading-relaxed mt-5">{card.line}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-forge-ash">
                      <Check size={16} strokeWidth={2} className="text-forge-cyan shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={docsPageUrl(card.link.slug)}
                  className="mt-6 pt-5 border-t border-white/5 inline-flex items-center gap-1.5 text-sm text-forge-white hover:text-forge-cyan transition-colors"
                >
                  {card.link.label}
                  <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 text-center">
          <p className="text-sm text-forge-smoke max-w-2xl">{INTEGRATIONS_TRUST.partner}</p>
          <p className="text-sm text-forge-smoke max-w-2xl">{INTEGRATIONS_TRUST.line}</p>
          {/* Links sit in their own wrapping row, each kept on one line
              (F-631: a control label never breaks over lines). */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {INTEGRATIONS_TRUST.links.map((link) => (
              <a
                key={link.slug}
                href={docsPageUrl(link.slug)}
                className="whitespace-nowrap text-sm text-forge-white underline underline-offset-4 hover:text-forge-cyan"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Button href={docsUrl()} variant="secondary" size="md">
            {INTEGRATIONS_BAND.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
