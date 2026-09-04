/**
 * The legal page's section and clause treatment.
 *
 * Lifted verbatim out of src/app/legal/page.tsx so the MSA archive pages at
 * /legal/msa/<version> render through the SAME components as the Terms of
 * Service and Privacy Policy sections rather than through a copy of their
 * markup. Copying the classes would have looked identical on the day it
 * shipped and drifted on the first restyle.
 *
 * Both files below are presentational and hook-free, so they compose into the
 * client legal page and the server-rendered archive pages alike.
 */

import SectionLabel from "@/components/ui/SectionLabel";

export function Section({
  id,
  tag,
  title,
  effectiveDate = "March 29, 2026",
  version,
  children,
}: {
  id: string;
  tag: string;
  title: string;
  effectiveDate?: string;
  /**
   * Version number, stamped beside the effective date. Only the MSA carries
   * one: Order Forms incorporate a specific version by reference, so a reader
   * holding a signed Order Form has to be able to tell at a glance which
   * version this page is. Omitted elsewhere, which leaves those sections
   * rendering exactly as before.
   */
  version?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 border-b border-white/5">
      <div className="mb-10">
        <SectionLabel>{tag}</SectionLabel>
        <h2 className="text-3xl font-semibold text-forge-white mt-4 mb-3 tracking-tight">
          {title}
        </h2>
        <p className="text-forge-smoke text-sm">
          Effective Date: {effectiveDate}
          {version ? ` · Version ${version}` : ""}
        </p>
      </div>
      <div className="prose-legal max-w-3xl flex flex-col gap-8">{children}</div>
    </section>
  );
}

export function Clause({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-forge-white mb-3">
        <span className="text-forge-cyan font-mono mr-2">{number}.</span>
        {title}
      </h3>
      <div className="text-forge-smoke text-sm leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
