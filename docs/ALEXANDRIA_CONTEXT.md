# ALEXANDRIA — Unified Architecture Context
> **Propósito de este archivo:** Fuente de verdad condensada para uso como contexto en Claude Code.  
> Cubre producto, restricciones, arquitectura, patrones, estructura de archivos y reglas de codificación.  
> Última síntesis: Mayo 2026 (entregables 1–4 de Arquitectura de Software, I.U. Pascual Bravo).

---

## 1. Producto

Alexandria es una plataforma SaaS para el sector médico. Conecta **pacientes** con **profesionales de salud (médicos)** a través de una aplicación web y el canal de WhatsApp.

### 1.1 Funcionalidades Core

| Funcionalidad | Descripción | Prioridad |
|---|---|---|
| **Triage automatizado** | Clasifica síntomas reportados por el paciente para determinar nivel de urgencia | Alta |
| **Agendamiento de citas** | Flujo canal-agnóstico: solicitud → triage → agendamiento. Disponible en web y WhatsApp | Alta |
| **Historial clínico** | Registro de citas y síntomas anteriores, consultable por paciente y médico autorizados | Media |
| **Mensajería clínica** | Comunicación entre paciente y médico dentro de la plataforma | Media |
| **Consulta institucional** | Información estática de la institución médica, accesible por cualquier canal | Baja |

### 1.2 Roles del Sistema

- **Paciente**: Ve una interfaz centrada en su condición (síntomas, citas, historial). Puede interactuar por web o WhatsApp.
- **Médico**: Ve un dashboard de gestión de pacientes y citas.
- **(Futuro) Admin**: Gestión institucional.

---

## 2. Restricciones del Proyecto

| Restricción | Valor |
|---|---|
| Equipo | 4 desarrolladores |
| Timeline | ~6 semanas (MVP) |
| Contexto | Curso universitario de Arquitectura de Software |
| Lenguaje principal | TypeScript |
| Framework | Next.js 14+ (App Router) |
| Base de datos / Auth | Supabase (PostgreSQL + Row Level Security) |
| Despliegue | Vercel (frontend/API), Supabase (DB), Hostinger (dominio) |

---

## 3. Atributos de Calidad Prioritarios

En orden estricto de prioridad (decisiones de trade-off deben respetar este orden):

1. **Seguridad** — Protección de PHI (Protected Health Information), aislamiento de datos, trazabilidad de accesos.
2. **Usabilidad** — Interfaces apropiadas por rol, flujos accesibles (WCAG 2.1), población con baja alfabetización digital.
3. **Escalabilidad** — Diseñado para crecer más allá del MVP sin reescritura de capas.

### 3.1 Requisitos No Funcionales Clave (con métricas)

| ID | Atributo | Requisito | Métrica |
|---|---|---|---|
| RNF1 | Seguridad | Acceso a información clínica solo a usuarios autorizados por rol | 100% de accesos requieren autenticación + validación de permisos |
| RNF2 | Seguridad | Datos personales y clínicos cifrados en tránsito y en reposo | 100% de datos sensibles cifrados |
| RNF3 | Seguridad | Registro de todas las acciones críticas sobre información clínica | 100% de operaciones CRUD sobre datos sensibles auditadas |
| RNF4 | Usabilidad | Retroalimentación visual en transacciones | 95% de transacciones con feedback visible |
| RNF5 | Usabilidad | Flujo de agendamiento claro y breve | 85% de pacientes completan agendamiento al primer intento |
| RNF6 | Usabilidad | Registro rápido de síntomas por personal de triage | 90% de registros completados en ≤ 2 minutos |
| RNF7 | Fiabilidad | Integridad de registros de síntomas y solicitudes | 100% de registros almacenados sin pérdida de campos obligatorios |
| RNF8 | Fiabilidad | Disponibilidad de información consultada | 99% de consultas devuelven datos correctos y completos |

---

## 4. Estilo Arquitectónico: Arquitectura en 4 Capas (Refinada)

Se eligió **arquitectura en capas** por sus propiedades de seguridad: cada capa actúa como checkpoint de autorización, validación y control de acceso a datos. El estilo se aplica como **monolito modular** expresado a través de las convenciones de Next.js App Router.

### 4.1 Definición de Capas

| Capa | Rol | Construcción Next.js | Responsabilidad de Seguridad |
|---|---|---|---|
| **Presentación** | Renderiza UI, captura input del usuario | Client Components (`'use client'`) | Zero trust — sin datos sensibles ni lógica de negocio |
| **Aplicación** | Orquesta casos de uso, coordina servicios | Server Components + funciones TS puras en `_lib/*.service.ts` | Verificación de auth, sanitización de input |
| **Servicio** | Ejecuta operaciones discretas, expone entry points server-side | Server Actions (`'use server'`) + Route Handlers | Validación con Zod, rate limiting, audit logging |
| **Datos** | Encapsula toda interacción con la base de datos | Funciones de repositorio marcadas `server-only` | Enforcement de RLS, queries parametrizadas |

### 4.2 Regla Crítica: Server Components ≠ Lógica de Negocio

Los Server Components son una primitiva de renderizado — pueden **llamar** lógica de negocio pero no **contenerla**. La lógica de negocio vive en funciones TypeScript puras (`*.service.ts`) para reutilización desde múltiples entry points (UI, webhooks, Server Actions).

### 4.3 Reglas de Comunicación entre Capas

- **Lecturas (open):** Server Components pueden llamar loaders directamente (capa Presentación/Aplicación → Datos).
- **Escrituras (closed):** Deben ir obligatoriamente por Servicio → Repositorio. Nunca escribir directamente a Supabase desde un componente.

---

## 5. Patrones Arquitectónicos Aplicados

### 5.1 Patrón Repository
> Encapsula toda la lógica de acceso a datos detrás de una interfaz. Ningún código fuera del repositorio toca Supabase directamente.

### 5.2 Server Actions Delgados / Servicios Gruesos
- **Actions = thin**: validar input (Zod) → llamar servicio → revalidar caché. Sin lógica de dominio.
- **Services = thick**: todas las reglas de negocio, orquestación y lógica de dominio viven aquí. Son funciones TypeScript puras, testeables sin React ni Supabase.

### 5.3 Principios Hexagonales en Límites Externos
Hexagonal completo fue descartado por exceso de ceremonia para 6 semanas. Se aplica selectivamente en: adaptador WhatsApp, adaptador IA/triage, interfaces de repositorio. Son los puntos donde la intercambiabilidad tiene valor real.

### 5.4 Flujo de Ejemplo: Paciente Envía Formulario de Triage

```
Client Component (formulario)
  → Server Action (validar con Zod, verificar auth)
    → triageService.assess() (función pura: puntuar síntomas, aplicar reglas)
      → patientRepository.getHistory() (query Supabase con RLS)
      → triageRepository.saveAssessment() (escritura con audit trail)
    → retornar resultado al componente
```

---

## 6. Estructura de Proyecto Recomendada

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                        # Auth guard + sidebar
│   │   ├── patients/
│   │   │   ├── page.tsx                      # Server Component (solo renderiza)
│   │   │   ├── _components/                  # UI específica del módulo
│   │   │   ├── _lib/
│   │   │   │   ├── patients.actions.ts       # Server Actions (thin)
│   │   │   │   ├── patients.service.ts       # Lógica de negocio (thick)
│   │   │   │   ├── patients.loader.ts        # DAL con cache()
│   │   │   │   └── patients.schema.ts        # Esquemas Zod
│   │   │   └── [patientId]/page.tsx
│   │   ├── triage/                           # Misma estructura interna
│   │   ├── appointments/
│   │   └── messaging/
│   └── api/
│       └── webhooks/
│           └── whatsapp/route.ts             # Solo para consumidores externos
├── components/
│   └── ui/                                   # Primitivas shadcn/ui
├── lib/
│   ├── supabase/
│   │   ├── client.ts                         # Cliente browser
│   │   ├── server.ts                         # Cliente server (cookies)
│   │   └── middleware.ts                     # Refresco de sesión
│   └── dal/
│       └── auth.ts                           # Utilidades de auth compartidas
└── types/
    └── database.ts                           # Tipos generados por Supabase
```

### 6.1 Convenciones de Nomenclatura por Capa

| Archivo | Capa | Regla |
|---|---|---|
| `page.tsx` | Presentación/Aplicación | Server Component. Solo compone UI y pasa data de loaders |
| `_components/*.tsx` | Presentación | Client Components. Zero lógica de negocio |
| `*.actions.ts` | Servicio | `'use server'`. Thin: validar → llamar service → revalidar |
| `*.service.ts` | Aplicación | TypeScript puro. Toda la lógica de dominio |
| `*.loader.ts` | Datos | `server-only` + `cache()`. Solo lecturas para Server Components |
| `*.schema.ts` | Transversal | Esquemas Zod para validación de input |
| `*.repository.ts` | Datos | Única capa que instancia el cliente Supabase |

---

## 7. Restricciones Específicas del Dominio Médico

### 7.1 Seguridad de Datos (HIPAA-like)

- **RLS habilitado desde el día 0** en todas las tablas con PHI. Retrofitting de RLS es extremadamente costoso.
- **Supabase Vault** para cifrado a nivel de columna en campos hipersensibles (número de identificación, códigos de diagnóstico).
- **Defense in depth**: validación en capa Servicio → autorización en Actions y DAL → RLS en base de datos → cifrado en reposo.
- **Audit log obligatorio**: toda lectura o mutación de datos de pacientes debe loggear `timestamp`, `user_id`, `action_type`, `affected_resource`.
- **MFA**: obligatorio para cuentas de médicos, recomendado para pacientes.
- **Nota de deuda técnica documentada**: Cumplimiento HIPAA formal requiere plan Supabase Team/Enterprise (~$350/mes) con BAA. El MVP opera con el mismo diseño pero sin el BAA — esto debe constar en un ADR.

### 7.2 Subsistema de IA (Triage)

- **Clinician-in-the-loop obligatorio**: recomendaciones de IA requieren `clinician_id` y `reviewed_at` antes de ser accionables. La IA nunca aplica decisiones automáticamente.
- **PHI stripping**: nunca enviar nombre, fecha de nacimiento ni identificadores a APIs de LLM externas. Solo descripciones de síntomas desidentificadas.
- **Audit trail de IA**: loggear cada llamada con input sanitizado, versión del modelo, output raw y decisión final del clínico.
- **Circuit breaker**: fallo de IA no debe bloquear el flujo clínico. El sistema degrada a triage manual.

### 7.3 Integración WhatsApp

- **Patrón webhook**: validar firma HMAC-SHA256 → responder 200 OK inmediatamente → procesar en background con `waitUntil`.
- **Ventana de sesión de 24h**: respuestas libres solo dentro de 24h del último mensaje del paciente. Fuera de esa ventana, usar templates pre-aprobados.
- **PHI mínimo en mensajes**: nunca incluir información médica en mensajes de WhatsApp. Ejemplo correcto: "Tienes una nueva cita. Inicia sesión para ver los detalles."
- **Idempotencia**: almacenar IDs de mensajes para manejar entregas duplicadas de webhooks.
- **Flujo canal-agnóstico**: la lógica de solicitud → triage → agendamiento funciona a nivel de API, independiente del canal que la dispare.

---

## 8. Alternativas Arquitectónicas Descartadas

| Alternativa | Razón de descarte |
|---|---|
| **MVC explícito** | Next.js App Router ya implementa MVC nativamente. Agregar MVC explícito introduce confusión de nomenclatura sin beneficio estructural. |
| **Hexagonal completa** | Exceso de ceremonia para un timeline de 6 semanas. Sus principios se aplican selectivamente en límites externos. |
| **Microservicios** | Complejidad operacional desproporcionada para el tamaño del equipo y el timeline. La modularidad interna del monolito cubre las necesidades del MVP. |

---

## 9. Riesgos Identificados y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Clasificación incorrecta en triage | Fiabilidad, confianza del paciente | Validación de reglas de negocio + tests de edge cases generados con IA + posibilidad de reclasificación |
| Citas duplicadas (multicanal) | Fiabilidad, usabilidad | Validaciones de concurrencia e idempotencia antes de confirmar citas |
| Exposición de PHI en canales externos | Seguridad, normatividad | Limitar PHI en mensajes externos, cifrado, trazabilidad de accesos |
| UX inaccesible para población con baja alfabetización digital | Usabilidad | Aplicar WCAG 2.1, componentes accesibles, formularios simples, pruebas con usuarios reales |
| Timeouts de funciones Vercel en flujos largos | Disponibilidad | Coordinación entre servicios, uso de `waitUntil` para procesamiento asíncrono |

---

## 10. Preguntas Abiertas (Pendientes de Definición)

1. **Concerns transversales**: ¿Dónde viven exactamente los auth checks, el audit logging y el error handling? Necesitan patrones explícitos por concern ya que tocan todas las capas.
2. **Aterrizaje estructural por feature**: Para cada feature (triage, appointments, messaging, patients), mapear filenames reales en las 4 capas. Esto cierra la brecha entre el diagrama y el desarrollador que no sabe dónde poner su código.
3. **ADRs pendientes de escribir**:
   - Por qué arquitectura en capas sobre hexagonal/microservicios
   - Por qué Supabase RLS como autorización primaria
   - Por qué Server Actions delgados
   - Qué deuda técnica se acepta explícitamente para el MVP
   - Reglas open vs. closed por tipo de operación

---

## 11. Stack Tecnológico Completo

| Categoría | Tecnología | Uso |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Full-stack: frontend + API |
| Lenguaje | TypeScript | Todo el codebase |
| Base de datos | Supabase (PostgreSQL) | Persistencia + Auth + RLS |
| Validación | Zod | Schemas en capa Servicio |
| UI Components | shadcn/ui | Primitivas de interfaz |
| Despliegue web | Vercel | Frontend + Server Actions |
| Dominio | Hostinger | DNS |
| Canal externo | WhatsApp Business API | Mensajería con pacientes |
| IA / Triage | LLM externo (por definir) | Asistencia en clasificación de síntomas |

---

## 12. Referencias Clave

- **Bass, Clements & Kazman** — *Software Architecture in Practice* (4th ed.) — Atributos de calidad, patrón en capas, tácticas de seguridad.
- **Fowler** — *Patterns of Enterprise Application Architecture* (2002) — Layering, Repository pattern.
- **Richards & Ford** — *Fundamentals of Software Architecture* (2020) — Layered architecture style, architecture sinkhole anti-pattern, ADRs.
- **Martin** — *Clean Architecture* (2017) — Dependency Rule, diseño orientado a casos de uso.
- **Cockburn** — *Hexagonal Architecture* (2005) — Ports and Adapters pattern.
- [Next.js — Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
- [Next.js — Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase — Vault (cifrado)](https://supabase.com/docs/guides/database/vault)
- [Nikolov Lazar — nextjs-clean-architecture](https://github.com/nikolovlazar/nextjs-clean-architecture) — Implementación de referencia

---

## 13. Instrucciones para el Asistente (Claude Code)

- **Lenguaje por defecto**: TypeScript. Solo usar otro lenguaje si se solicita explícitamente.
- **Al proponer código**: respetar la separación de capas — nunca poner lógica de negocio en un action ni queries Supabase fuera de un repositorio.
- **Al usar terminología técnica**: incluir definición breve o enlace a documentación relevante.
- **Preferencia de proceso**: planificación y comprensión completa de la solución antes de cualquier implementación.
- **Rol crítico**: cuestionar activamente decisiones que contradigan los atributos de calidad en su orden de prioridad (Seguridad > Usabilidad > Escalabilidad). Proveer fuente para cada recomendación significativa.
- **Contexto médico**: cualquier decisión que afecte datos de pacientes debe evaluarse primero desde la óptica de seguridad y cumplimiento normativo.
