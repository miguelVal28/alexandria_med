import "server-only";
import {
  N8nTriageEngineAdapter,
  StubTriageEngine,
  CircuitBreakerTriageEngine,
  type ITriageEngine,
} from "@/lib/integrations/triage-ai";
import { TriageService } from "@/app/(patient)/triage/_lib/triage.service";
import { TriageFacade } from "./triage.facade";

// Composition Root per the ADR. The single place where concrete engines are
// chosen and wired. Module-level singletons so the CircuitBreaker can keep
// state across requests within a warm process.
//
// Wiring chain:
//   N8nTriageEngineAdapter  ──┐
//                             ├──> CircuitBreakerTriageEngine ──> TriageService ──> TriageFacade
//   StubTriageEngine  ────────┘  (fallback)
//
// When N8N_TRIAGE_WEBHOOK_URL is unset, the stub is the primary AND the
// circuit breaker is bypassed (there is nothing to fail).

const stub = new StubTriageEngine();
const n8nUrl = process.env.N8N_TRIAGE_WEBHOOK_URL;
const primary: ITriageEngine =
  n8nUrl && n8nUrl.trim().length > 0
    ? new N8nTriageEngineAdapter(n8nUrl)
    : stub;

const engine: ITriageEngine =
  primary === stub
    ? stub
    : new CircuitBreakerTriageEngine(primary, stub, {
        threshold: 3,
        resetMs: 30_000,
      });

const triageService = new TriageService(engine);
const triageFacade = new TriageFacade(triageService);

export function composeTriageFacade(): TriageFacade {
  return triageFacade;
}

// Exposed for testing / introspection only.
export const __engineForTest = engine;