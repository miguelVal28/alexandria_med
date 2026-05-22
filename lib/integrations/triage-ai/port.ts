import type { AiTriageRequest, AiTriageResponse } from "./types";

// Domain port for the triage AI engine. Per ADR-002 in
// docs/triage-architecture-decisions.md, this is the interface the
// TriageService depends on; concrete engines (N8N adapter, stub, decorators)
// implement it.
export interface ITriageEngine {
  assess(req: AiTriageRequest): Promise<AiTriageResponse>;
}

// Back-compat alias: earlier code referenced TriageAiPort. Kept as a deprecated
// re-export so existing imports keep working until they migrate.
/** @deprecated use ITriageEngine */
export type TriageAiPort = ITriageEngine;