# Alexandria — Claude Code Instructions

## Contexto del Proyecto
Plataforma SaaS médica (TypeScript / Next.js 14 App Router / Supabase).  
Arquitectura en 4 capas. Equipo de 4 personas. MVP en 6 semanas.

> Contexto arquitectónico completo: @docs/ALEXANDRIA_CONTEXT.md

---

## Stack
- **Lenguaje:** TypeScript (siempre, salvo indicación explícita)
- **Framework:** Next.js 14+ App Router
- **DB / Auth:** Supabase con Row Level Security
- **Validación:** Zod
- **UI:** shadcn/ui
- **Deploy:** Vercel + Supabase + Hostinger

## Comandos clave
```bash
pnpm dev          # servidor de desarrollo
pnpm build        # build de producción
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
```

---

## Reglas de Arquitectura (no negociables)

**Separación de capas — dónde va cada cosa:**

| Archivo | Qué contiene | Qué NO contiene |
|---|---|---|
| `page.tsx` | Composición de UI, llamadas a loaders | Lógica de negocio, queries directas |
| `_components/*.tsx` | UI pura (`'use client'`) | Estado del servidor, lógica de dominio |
| `*.actions.ts` | Validación Zod + llamada al service + revalidación | Reglas de negocio, queries Supabase |
| `*.service.ts` | Toda la lógica de dominio (TypeScript puro) | Imports de React, instancias de Supabase |
| `*.loader.ts` | Queries de lectura con `cache()` y `server-only` | Mutaciones |
| `*.repository.ts` | Única capa que instancia el cliente Supabase | Lógica de negocio |

**Flujo de escritura obligatorio:**  
`Action (validar) → Service (lógica) → Repository (Supabase)`  
Nunca saltarse capas en escrituras.

**Flujo de lectura (permitido):**  
`Server Component → Loader → Repository`

---

## Reglas de Seguridad (dominio médico)

- RLS habilitado en **toda** tabla con datos de pacientes (PHI). Sin excepciones.
- Nunca enviar nombre, fecha de nacimiento ni identificadores a APIs externas de IA. Solo síntomas desidentificados.
- Todo acceso o mutación sobre datos clínicos debe loggear: `user_id`, `timestamp`, `action_type`, `resource`.
- La IA **nunca** aplica decisiones automáticamente. Requiere `clinician_id` + `reviewed_at`.
- WhatsApp: nunca incluir información médica en mensajes. Solo referencias a la plataforma.

---

## Convenciones de Código

- Exportaciones nombradas sobre exportaciones por defecto (excepto `page.tsx` y `layout.tsx` que Next.js requiere default).
- Nomenclatura: `camelCase` para funciones/variables, `PascalCase` para componentes/tipos, `kebab-case` para archivos.
- Los schemas Zod se definen en `*.schema.ts` y se reutilizan entre actions y services.
- Tipos de base de datos se generan desde Supabase en `types/database.ts`. No escribir tipos de DB a mano.
- `server-only` en todo loader y repositorio para prevenir importaciones accidentales en el cliente.

---

## Atributos de Calidad (orden de prioridad para trade-offs)
1. **Seguridad** — PHI, RLS, audit trails
2. **Usabilidad** — WCAG 2.1, flujos simples para pacientes
3. **Escalabilidad** — diseño que permita crecer sin reescritura

Ante cualquier decisión de diseño, este orden es el árbitro.
