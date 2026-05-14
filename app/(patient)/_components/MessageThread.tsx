"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/lib/mock-data/messages";
import { cn } from "@/lib/utils";

export function MessageThread({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [activeId, setActiveId] = useState(conversations[0]?.id);
  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 border border-border-default rounded-themed overflow-hidden bg-surface min-h-[560px]">
      <aside className="border-b md:border-b-0 md:border-r border-border-default">
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "w-full text-left px-5 py-4 border-b border-border-default last:border-b-0 hover:bg-canvas/50 transition-colors",
                  c.id === activeId && "bg-canvas"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base text-ink truncate">
                      {c.with}
                    </p>
                    <p className="text-xs text-muted truncate">{c.role}</p>
                    <p className="mt-1 text-sm text-muted truncate">
                      {c.lastMessage}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted">{c.lastTime}</p>
                    {c.unread > 0 && (
                      <span className="inline-block mt-1 h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex flex-col">
        {active && (
          <>
            <header className="px-6 py-4 border-b border-border-default bg-canvas/40">
              <p className="font-display text-lg text-ink leading-tight">
                {active.with}
              </p>
              <p className="text-xs text-muted">{active.role}</p>
            </header>

            <div className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[78%] rounded-themed px-4 py-2.5 text-sm",
                    m.from === "me"
                      ? "ml-auto bg-accent text-canvas"
                      : "bg-canvas border border-border-default text-ink"
                  )}
                >
                  <p>{m.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      m.from === "me" ? "text-canvas/70" : "text-muted"
                    )}
                  >
                    {m.time}
                  </p>
                </div>
              ))}
            </div>

            <footer className="border-t border-border-default p-4 flex items-center gap-3 bg-canvas/40">
              <Input
                placeholder="Escribe un mensaje…"
                className="flex-1"
                disabled
              />
              <Button variant="primary" size="icon" disabled>
                <Send className="h-4 w-4" />
              </Button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}