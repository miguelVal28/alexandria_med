"use client";

import { useEffect, useState } from "react";

function greetingFor(hour: number) {
  if (hour < 6) return "Buenas noches";
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function HeroGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Hola");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  return (
    <header className="space-y-3">
      <p className="text-sm uppercase tracking-[0.18em] text-muted">
        Tu salud, hoy
      </p>
      <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-ink">
        {greeting},
        <br />
        <span className="italic text-accent">{name}.</span>
      </h1>
      <p className="text-lg text-muted max-w-xl pt-3">
        Reporta cómo te sientes, consulta tus citas y mantén la conversación
        con tu equipo médico — todo desde aquí.
      </p>
    </header>
  );
}