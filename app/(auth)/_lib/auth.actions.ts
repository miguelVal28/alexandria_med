"use server";

import { redirect } from "next/navigation";
import { signupSchema, loginSchema } from "./auth.schema";
import { signupPatient, loginUser, logoutUser } from "./auth.service";

export type AuthFormState = { error?: string } | null;

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    date_of_birth: formData.get("date_of_birth"),
    document_type: formData.get("document_type"),
    document: formData.get("document"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await signupPatient(parsed.data);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al registrar la cuenta",
    };
  }

  redirect("/");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await loginUser(parsed.data);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al iniciar sesión",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  await logoutUser();
  redirect("/login");
}