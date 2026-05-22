import "server-only";
import type { ITriageEngine } from "./port";
import type { AiTriageRequest, AiTriageResponse } from "./types";

// Decorator GoF + Circuit Breaker (Nygard). Per ADR-003 in
// docs/triage-architecture-decisions.md, this class wraps any ITriageEngine
// and provides:
//   1. Circuit breaking — after N consecutive failures the primary is skipped
//      for a recovery window.
//   2. Graceful degradation — failures fall through to a fallback engine so
//      the TriageService always gets a valid response.
//
// Decorator semantics: the class implements ITriageEngine and delegates to
// another ITriageEngine, adding behavior. Stackable — wrap with another
// decorator (e.g. LoggingTriageEngine, MetricsTriageEngine) without modifying
// this one (Open/Closed).
//
// Note on state: this is in-process state (per-warm-process on Vercel).
// Sufficient for the demo. Production would use a shared store (Redis) or a
// library like opossum with cluster coordination.
export class CircuitBreakerTriageEngine implements ITriageEngine {
  private failureCount = 0;
  private circuitOpenUntil: number | null = null;

  constructor(
    private readonly primary: ITriageEngine,
    private readonly fallback: ITriageEngine,
    private readonly opts: {
      threshold?: number; // consecutive failures before opening (default 3)
      resetMs?: number; // ms the circuit stays open (default 30s)
    } = {},
  ) {}

  async assess(req: AiTriageRequest): Promise<AiTriageResponse> {
    const threshold = this.opts.threshold ?? 3;
    const resetMs = this.opts.resetMs ?? 30_000;
    const now = Date.now();

    // Circuit open → straight to fallback.
    if (this.circuitOpenUntil !== null && now < this.circuitOpenUntil) {
      return this.fallback.assess(req);
    }

    // Circuit closed (or half-open after reset window) — try primary.
    try {
      const result = await this.primary.assess(req);
      // Success: reset state.
      this.failureCount = 0;
      this.circuitOpenUntil = null;
      return result;
    } catch (_err) {
      this.failureCount++;
      if (this.failureCount >= threshold) {
        this.circuitOpenUntil = now + resetMs;
      }
      // Always degrade gracefully — the domain receives a valid response.
      return this.fallback.assess(req);
    }
  }

  // Observability hook (not part of the ITriageEngine contract).
  get state(): "closed" | "open" {
    const now = Date.now();
    return this.circuitOpenUntil !== null && now < this.circuitOpenUntil
      ? "open"
      : "closed";
  }
}