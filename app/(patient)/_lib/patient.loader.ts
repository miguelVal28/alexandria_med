import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/dal/auth";
import { findPatientById, type PatientRow } from "./patient.repository";

// React's `cache()` dedupes within a single render pass. The loader can be
// called from both layout.tsx and page.tsx and it'll hit Supabase once.
export const getCurrentPatient = cache(async (): Promise<PatientRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  return findPatientById(user.id);
});