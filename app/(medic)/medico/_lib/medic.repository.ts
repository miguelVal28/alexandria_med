import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type MedicRow = Database["public"]["Tables"]["medics"]["Row"];

export async function findMedicById(id: string): Promise<MedicRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medics")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
