"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  continueConversationAction,
  forceSubmitAction,
  type TriageActionState,
} from "@/app/(patient)/triage/_lib/triage.actions";

export type ConversationTurn = {
  id: string;
  turnNumber: number;
  actor: "patient" | "ai" | "clinician";
  content: string;
  createdAt: string;
};

function ContinueSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enviando…" : "Responder"}
      {!pending && <Send className="h-4 w-4" />}
    </Button>
  );
}

function ForceSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending}
    >
      <ShieldCheck className="h-4 w-4" />
      {pending ? "Enviando…" : "Enviar para revisión médica ahora"}
    </Button>
  );
}

export function ConversationFlow({
  caseId,
  turns,
  awaitingResponse,
}: {
  caseId: string;
  turns: ConversationTurn[];
  awaitingResponse: boolean;
}) {
  const [continueState, continueAction] = useFormState<
    TriageActionState,
    FormData
  >(continueConversationAction, null);
  const [forceState, forceActionFn] = useFormState<TriageActionState, FormData>(
    forceSubmitAction,
    null,
  );

  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {turns
          .filter((t) => t.actor !== "clinician")
          .map((turn) => (
            <li
              key={turn.id}
              className={cn(
                "flex",
                turn.actor === "patient" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-themed px-4 py-3 text-sm",
                  turn.actor === "patient"
                    ? "bg-accent text-canvas"
                    : "bg-surface text-ink border border-border-default",
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                  {turn.actor === "patient" ? "Tú" : "Asistente"}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{turn.content}</p>
              </div>
            </li>
          ))}
      </ol>

      {awaitingResponse && (
        <>
          <form action={continueAction} className="space-y-3">
            <input type="hidden" name="caseId" value={caseId} />
            <label htmlFor="answer" className="block text-sm text-ink">
              Tu respuesta
            </label>
            <Textarea
              id="answer"
              name="answer"
              required
              minLength={1}
              maxLength={2000}
              placeholder="Escribe aquí…"
              className="min-h-[100px]"
            />
            {continueState?.ok === false && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {continueState.error}
              </p>
            )}
            <div className="flex justify-end">
              <ContinueSubmit />
            </div>
          </form>

          <div className="border-t border-border-default pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted max-w-md">
              ¿Sientes que el asistente no necesita más datos? Puedes enviar tu
              caso a un profesional ahora mismo.
            </p>
            <form action={forceActionFn}>
              <input type="hidden" name="caseId" value={caseId} />
              {forceState?.ok === false && (
                <p
                  role="alert"
                  className="text-xs text-destructive mr-2 inline-block"
                >
                  {forceState.error}
                </p>
              )}
              <ForceSubmit />
            </form>
          </div>
        </>
      )}
    </div>
  );
}