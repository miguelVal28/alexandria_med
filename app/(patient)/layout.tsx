import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { PatientNav } from "./_components/PatientNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alexandria — cuida tu salud",
  description: "Tu salud, en un solo lugar.",
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`theme-patient ${fraunces.variable} ${inter.variable} min-h-screen bg-canvas text-ink`}
    >
      <PatientNav />
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
      <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted border-t border-border-default mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-display italic text-base">
            Alexandria · Tu salud, contigo.
          </p>
          <p className="space-x-4">
            <span>© 2026 Alexandria</span>
            <span>·</span>
            <span>Línea: (604) 444-0000</span>
            {/* DEV_ONLY_ROLE_SWITCHER: remove when subdomains go live */}
            <span>·</span>
            <Link
              href="/medico"
              className="text-accent hover:underline underline-offset-4"
            >
              ver vista médico ↗
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}