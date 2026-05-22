import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getCurrentRole } from "@/lib/dal/auth";
import { getCurrentMedic } from "./_lib/medic.loader";
import { MedicSidebar } from "./_components/MedicSidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alexandria · Médicos",
  description: "Panel clínico de Alexandria.",
};

export default async function MedicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard: only signed-in medics reach the clinical console.
  const role = await getCurrentRole();
  if (role === null) redirect("/login");
  if (role !== "medic") redirect(role === "patient" ? "/" : "/login");

  const medic = await getCurrentMedic();
  if (!medic) redirect("/login");

  const initials = medic.full_name
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={`theme-medic ${inter.variable} ${jetbrains.variable} min-h-screen bg-canvas text-ink flex`}
    >
      <MedicSidebar
        fullName={medic.full_name}
        specialty={medic.specialty ?? "Sin especialidad"}
        initials={initials || "M"}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="border-t border-border-default px-6 py-3 text-[11px] text-muted flex items-center justify-between">
          <span className="font-numeric">
            ALEXANDRIA · clinical console · v0.1
          </span>
          <span className="space-x-3">
            <span>connected</span>
            {/* DEV_ONLY_ROLE_SWITCHER: remove when subdomains go live */}
            <Link
              href="/"
              className="text-accent hover:underline underline-offset-4"
            >
              ver vista paciente ↗
            </Link>
          </span>
        </footer>
      </div>
    </div>
  );
}