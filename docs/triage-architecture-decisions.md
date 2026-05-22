# Decisiones de Arquitectura — Subsistema de Triaje (Alexandria)

Registro de las decisiones de diseño del subsistema de triaje, con alternativas
evaluadas y justificaciones. Formato inspirado en ADR (Architecture Decision
Records). Última actualización derivada de sesión de diseño asistida.

---

## Contexto del subsistema

El subsistema de triaje evalúa el nivel de urgencia de la consulta de un
paciente a partir de información recolectada en un proceso conversacional. Actúa
como compuerta previa al agendamiento de citas. Debe ser consumible desde dos
canales (interfaz web y WhatsApp) y delega la orquestación conversacional y la
clasificación de riesgo a flujos de IA alojados externamente en n8n.

Corresponde al despliegue interno del **componente de Triaje** identificado en
el nivel C3 del modelo C4, mostrando cómo sus responsabilidades se distribuyen
entre clases concretas dentro del contenedor de aplicación Next.js.

---

## Clases principales y responsabilidades

| Clase | Rol | Responsabilidad |
|---|---|---|
| `TriageFacade` | Facade | Expone interfaz uniforme JSON a los canales. Traduce DTOs ↔ dominio. Sin lógica de negocio. |
| `TriageService` | Domain Service | Núcleo agnóstico al canal. Aplica reglas de evaluación de riesgo, orquesta repositorios y el motor de IA. |
| `N8nTriageEngineAdapter` | Adapter | Traduce `ITriageEngine` (dominio) al protocolo HTTP de n8n. Aplica PHI stripping. |
| `CircuitBreakerTriageEngine` | Decorator | Envuelve al adapter para degradación graceful ante fallos de n8n. |
| `TriageComposition` | Composition Root | Único punto de cableado de dependencias concretas. |
| `TriageSession` | Entity | Agregado de la sesión de triaje. |
| `TriageAssessment` | Value Object | Resultado de la evaluación (riesgo, recomendación). |

---

## ADR-001: Facade para la entrada multicanal

**Decisión:** exponer el subsistema mediante `TriageFacade` (patrón Facade GoF).

**Alternativas evaluadas:**
- Que cada canal llame directamente a `TriageService`. Rechazada: acopla los
  handlers al modelo de dominio y dificulta añadir canales.
- Doble adapter hexagonal (uno por canal). Rechazada: ceremonia innecesaria;
  ambos canales hablan el mismo protocolo HTTP/JSON uniforme.

**Justificación:** ambos canales (Web, WhatsApp) consumen el mismo formato. La
Facade permite añadir un tercer canal (p.ej. Telegram) creando solo un nuevo
cliente, sin tocar dominio ni adapter (Open/Closed Principle).

**Limitación reconocida:** con solo dos canales hoy, la Facade es parcialmente
preventiva. Se asume conscientemente, anticipando expansión de canales.

---

## ADR-002: Adapter para la integración con n8n

**Decisión:** integrar n8n mediante `N8nTriageEngineAdapter` que implementa el
puerto de dominio `ITriageEngine` (patrón Adapter GoF / Driven Adapter
hexagonal).

**Justificación:** n8n es un sistema externo con interfaz HTTP incompatible con
el dominio. El adapter reconcilia ambas interfaces, permitiendo que
`TriageService` ignore por completo que el motor de IA es n8n. Habilita
reemplazar el proveedor sin tocar la lógica de negocio.

**Riesgo reconocido (leaky abstraction):** la interfaz `ITriageEngine` tiene
métodos como `orchestrateNextStep` cuyo vocabulario está influido por el modelo
mental de n8n. Si se reemplaza el proveedor, evaluar refactorizar la interfaz
hacia términos puros del dominio (`assessSymptoms`, `recommendNextQuestion`).
Esto sería decisión consciente, no efecto colateral.

**Nota sobre swappability:** cambiar de n8n a otro motor implica reescribir los
flujos low-code en la nueva plataforma; el adapter solo desacopla el código
TypeScript, no los workflows visuales.

---

## ADR-003: Decorator + Circuit Breaker para resiliencia

**Decisión:** `CircuitBreakerTriageEngine` envuelve al adapter como Decorator
(GoF), añadiendo circuit breaking y fallback a triaje manual.

**Alternativas evaluadas:**
- Circuit breaker como atributo dentro del adapter. Rechazada: cada nueva
  preocupación (logging, retries, métricas) añadiría código al adapter,
  violando Single Responsibility Principle.

**Justificación:** el Decorator es apilable. Logging, métricas y reintentos
futuros se añaden como decorators independientes sin modificar lo existente.

**Limitación reconocida:** con un solo decorator hoy, el patrón está
sub-explotado. Se justifica por extensibilidad anticipada (observabilidad y
resiliencia crecen en capas).

**Implementación de referencia (Node/TS):** circuit breaker con librería tipo
`opossum`. El dominio nunca conoce el fallo de transporte; recibe siempre un
`EngineResponse` válido (real o de fallback).

---

## ADR-004: PHI stripping como método privado del adapter (NO Proxy)

**Decisión:** el PHI stripping se implementa como método privado
`phiStripping()` dentro de `N8nTriageEngineAdapter`. NO se modela como patrón
Proxy ni como Decorator separado.

**Alternativas evaluadas:**
- **Proxy de protección.** Rechazada: el Proxy controla acceso (permite/deniega)
  sin transformar el contenido. El PHI stripping transforma el payload, lo que
  es semánticamente un transformador, no un proxy. Modelarlo como Proxy sería
  forzado y cuestionable en revisión.
- **Decorator `PHIStrippingTriageEngine` separado.** Rechazada (por ahora): las
  reglas de qué campos son PHI dependen del esquema concreto del payload de n8n;
  extraerlas obligaría al decorator a conocer detalles del adapter, rompiendo
  encapsulación. Aplica YAGNI: solo hay un adapter de IA externo hoy.

**Justificación (principio de localidad de auditoría):** un revisor de seguridad
necesita ver `phiStripping()` en el mismo archivo que hace la llamada HTTP, para
verificar fácilmente que TODA salida hacia n8n pasa por el strip. Separarlo
aumenta el riesgo de bypass.

**Reglas de implementación:**
- Usar **whitelist** de campos seguros, no blacklist (secure-by-default).
- Test unitario que falle si el body enviado a n8n contiene PHI (mock del
  cliente HTTP, aserción sobre el payload).
- El conjunto `N8nTriageEngineAdapter` + `phiStripping()` funciona como un
  Anticorruption Layer mínimo (DDD), protegiendo el dominio del sistema externo.

---

## Resumen de patrones aplicados

**GoF (3):** Facade, Adapter, Decorator.

**Otros catálogos:**
- Repository (PoEAA) — `IPatientRepository`, `ITriageRepository`.
- Circuit Breaker (Nygard) — dentro del Decorator.
- Composition Root (Seemann) — `composeTriageFacade()`.
- Entity / Value Object / Domain Service (DDD).
- Anticorruption Layer (DDD) — adapter + PHI stripping.

**Estructura general:** arquitectura hexagonal (puertos y adaptadores) sobre una
base por capas. No se implementan puertos/adaptadores en forma estricta en todos
los bordes; se aplican donde aportan valor (entrada multicanal y salida a IA).

---

## Atributos de calidad favorecidos

- **Bajo acoplamiento:** dependencia exclusiva sobre interfaces
  (`ITriageFacade`, `ITriageEngine`).
- **Extensibilidad:** nuevos canales (clientes de la facade) y nuevos
  comportamientos del motor (decorators apilables) sin modificar lo existente.
- **Mantenibilidad:** separación estricta DTOs ↔ dominio; cableado centralizado
  en un único Composition Root; subsistema externo de IA aislado tras dos capas
  de abstracción.
- **Seguridad:** PHI stripping localizado y auditable en el borde de salida.
