import "server-only";
import {
  signupViaSupabaseAuth,
  loginViaSupabaseAuth,
  logoutViaSupabaseAuth,
} from "./auth.repository";
import type { SignupInput, LoginInput } from "./auth.schema";

// Service layer is thin here because Supabase Auth + the
// app_private.handle_patient_signup trigger already encapsulate the domain
// rules (atomic user_roles + patients creation, password hashing, session
// cookie). Future business rules (e.g., welcome email, document validation
// against a national registry) will land here without changing the action.

export async function signupPatient(input: SignupInput) {
  return signupViaSupabaseAuth(input);
}

export async function loginUser(input: LoginInput) {
  return loginViaSupabaseAuth(input);
}

export async function logoutUser() {
  return logoutViaSupabaseAuth();
}