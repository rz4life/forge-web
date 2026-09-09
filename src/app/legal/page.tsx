/**
 * /legal
 *
 * A thin server shell. Its only job is to load and integrity-check the
 * Master Subscription Agreement at BUILD time (src/lib/msa.ts cannot run in
 * the browser, and the check is worth nothing if it runs after the page has
 * already shipped), then hand the rendered section to the interactive page.
 *
 * Everything else about this page, the scroll-spy sidebar, the mobile nav and
 * the other four documents, is unchanged and lives in LegalPageClient.
 */

import MsaDocumentView from "@/components/legal/MsaDocumentView";
import { loadCurrentMsa } from "@/lib/msa";
import LegalPageClient from "./LegalPageClient";

// The agreement is read off disk. Pinning the page static keeps that a
// build-time read: the deployed site serves bytes, and a missing or altered
// content file fails the build rather than a request.
export const dynamic = "force-static";

export default function LegalPage() {
  return <LegalPageClient msaSection={<MsaDocumentView doc={loadCurrentMsa()} />} />;
}
