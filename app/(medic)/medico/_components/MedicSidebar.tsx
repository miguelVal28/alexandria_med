"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  LayoutDashboard,
  MessageSquare,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/app/(auth)/_components/LogoutButton";

const links = [
  { href: "/medico", label: "Dashboard", icon: LayoutDashboard },
  { href: "/medico/pacientes", label: "Pacientes", icon: Users },
  { href: "/medico/triage", label: "Cola de triage", icon: Stethoscope },
  { href: "/medico/agenda", label: "Agenda", icon: CalendarRange },
];

export function MedicSidebar({
  fullName,
  specialty,
  initials,
}: {
  fullName: string;
  specialty: string;
  initials: string;
}) {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-border-default bg-surface flex flex-col">
      <div className="px-5 py-5 border-b border-border-default">
        <p className="font-display text-lg leading-none text-ink">
          Alexandria
        </p>
        <p className="text-[10px] tracking-[0.18em] uppercase text-muted mt-1">
          Clinical console
        </p>
      </div>

      <nav className="flex-1 py-3 text-sm">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/medico" ? path === href : path?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2 rounded-md transition-colors",
                active
                  ? "bg-canvas text-ink border border-border-default"
                  : "text-muted hover:text-ink hover:bg-canvas/60 border border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="mt-3 mx-2 px-3 py-2 rounded-md flex items-center gap-3 text-muted/60 cursor-not-allowed">
          <MessageSquare className="h-4 w-4" />
          <span className="flex-1">Mensajes</span>
          <span className="text-[10px] tracking-wider uppercase text-muted/70">
            soon
          </span>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-border-default space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-accent-soft text-accent grid place-items-center font-numeric text-sm border border-accent/30">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm text-ink">{fullName}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">
              {specialty}
            </p>
          </div>
        </div>
        <LogoutButton>
          <Button type="submit" variant="ghost" size="sm" className="w-full">
            Cerrar sesión
          </Button>
        </LogoutButton>
      </div>
    </aside>
  );
}