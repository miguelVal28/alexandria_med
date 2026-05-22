// PHI-free request/response DTOs at the AI boundary.
// Whoever wrote the request must guarantee these fields contain no patient
// identifiers (name, DOB, document, phone) — only desidentified clinical text.

export type AiTriageRequest = {
  triageCaseId: string;       // opaque UUID, used for correlation only
  iterationNumber: number;    // 1-based, matches ai_triage_assessments.iteration_number
  symptoms: string[];         // patient-tagged symptoms
  durationText: string;       // "Hoy mismo", "Hace 2 o 3 días", etc.
  description: string;        // free-text patient description
};

export type AiTriageResponse = {
  suggestedPriority: number | null;  // 1..5, Colombian Manchester triage scale
  modelVersion: string;              // e.g. "n8n-flow-v3", "stub-v1"
  n8nExecutionId: string;            // correlation id from N8N (or synthetic for the stub)
  reasoning?: string;                // optional short rationale
};