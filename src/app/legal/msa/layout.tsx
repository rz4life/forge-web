/**
 * Chrome for the MSA archive pages.
 *
 * Same shell as /legal (navbar, the fixed breadcrumb bar, footer), minus the
 * scroll-spy sidebar, which has nothing to navigate on a single-document page.
 * The breadcrumb gains a third crumb so a reader who followed a version link
 * out of an Order Form can find their way back to the rest of the legal page.
 */

import Link from "next/link";
import { Hexagon } from "lucide-react";

import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export default function MsaArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-forge-body text-forge-white">
      <Navbar />

      <header className="fixed top-16 left-0 right-0 z-40 bg-forge-iron/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-forge-smoke hover:text-forge-white transition-colors"
              aria-label="Back to Forge home"
            >
              <Hexagon size={18} strokeWidth={2} className="text-forge-cyan" aria-hidden="true" />
              <span className="font-bold text-forge-white tracking-tight">FORGE</span>
            </Link>
            <span className="text-forge-graphite select-none">/</span>
            <Link
              href="/legal"
              className="text-forge-smoke text-sm font-medium hover:text-forge-white transition-colors"
            >
              Legal
            </Link>
            <span className="text-forge-graphite select-none">/</span>
            <span className="text-forge-smoke text-sm font-medium">MSA</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <main className="max-w-3xl min-w-0">{children}</main>
      </div>

      <Footer />
    </div>
  );
}
