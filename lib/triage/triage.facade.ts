import "server-only";
import type { TriageService } from "@/app/(patient)/triage/_lib/triage.service";
import type { TriageSubmitInput } from "@/app/(patient)/triage/_lib/triage.schema";

// Facade GoF per ADR-001. Uniform JSON-shaped interface for both channels
// (Web Server Actions, WhatsApp webhook). Strictly translates request/response
// DTOs — no business logic lives here. Adding a third channel (Telegram, IVR)
// is a new client of this Facade, not a change to it (Open/Closed).
export class TriageFacade {
  constructor(private readonly service: TriageService) {}

  async submitInitial(
    input: TriageSubmitInput,
    context: { patientId: string; channel: "web" | "whatsapp" },
  ) {
    return this.service.submitInitial(input, context);
  }

  async continueConversation(input: {
    caseId: string;
    symptoms: string[];
    durationText: string;
    patientAnswer: string;
  }) {
    return this.service.continueConversation(input);
  }

  async forceSubmitForReview(caseId: string) {
    return this.service.forceSubmitForReview(caseId);
  }
}