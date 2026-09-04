/**
 * Renders a parsed Master Subscription Agreement.
 *
 * Every string this component prints comes straight off `MsaDocument`, which
 * is parsed from the committed markdown under a lossless-parse guard (see
 * src/lib/msa.ts). There is no MSA prose in this file, and there should never
 * be any: the moment a sentence is typed here instead of derived, the page and
 * the contract can disagree and nothing will notice.
 *
 * Clause text is rendered as whole, unsplit source lines. Pulling "1.1 Service."
 * out of the front of each clause into a styled heading would read a little
 * tidier and would mean publishing a reassembly of a contract rather than the
 * contract itself, so the clause number stays in the sentence where legal put it.
 */

import Link from "next/link";

import { Section, Clause } from "@/components/legal/LegalPrimitives";
import { msaVersionPath, MSA_ARCHIVE_PATH } from "@/lib/msa-routes";
import type { MsaDocument } from "@/lib/msa";

export default function MsaDocumentView({
  doc,
  id = "msa",
}: {
  doc: MsaDocument;
  /** Anchor id. `msa` on the legal page, so /legal#msa lands here. */
  id?: string;
}) {
  return (
    <Section
      id={id}
      tag="Legal"
      title={doc.title}
      effectiveDate={doc.effectiveDate}
      version={doc.version}
    >
      {doc.preamble.map((paragraph, i) => (
        <p key={`preamble-${i}`} className="text-forge-smoke text-sm leading-relaxed">
          {paragraph}
        </p>
      ))}

      {doc.articles.map((article) => (
        <Clause key={article.number} number={article.number} title={article.title}>
          {article.clauses.map((clause, i) => (
            <p key={`${article.number}-${i}`}>{clause.text}</p>
          ))}
        </Clause>
      ))}

      {/* Clause 16.8 promises prior versions stay available. These are the
          URLs that keep that promise, printed where a reader holding a signed
          Order Form will look for them. */}
      <div className="border-t border-white/5 pt-6 flex flex-col gap-1">
        <p className="text-forge-smoke text-sm">
          Permanent link to version {doc.version}:{" "}
          <Link
            href={msaVersionPath(doc.version)}
            className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
          >
            forge.equipment{msaVersionPath(doc.version)}
          </Link>
        </p>
        <p className="text-forge-graphite text-xs">
          Order Forms incorporate the version of this agreement in effect on their
          Effective Date. That version stays available at its own address after this
          agreement is revised.{" "}
          <Link
            href={MSA_ARCHIVE_PATH}
            className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
          >
            All versions
          </Link>
        </p>
      </div>
    </Section>
  );
}
