import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SignupInput, LoginInput } from "./auth.schema";

export async function signupViaSupabaseAuth(input: SignupInput) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      // raw_user_meta_data — consumed by the app_private.handle_patient_signup
      // trigger to atomically create user_roles + patients rows.
      data: {
        app_role: "patient",
        full_name: input.full_name,
        date_of_birth: input.date_of_birth,
        document_type: input.document_type,
        document: input.document,
        phone: input.phone ?? "",
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function loginViaSupabaseAuth(input: LoginInput) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;
  return data;
}

export async function logoutViaSupabaseAuth() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}