import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/dal/auth";
import { findMedicById, type MedicRow } from "./medic.repository";

export const getCurrentMedic = cache(async (): Promise<MedicRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  return findMedicById(user.id);
});