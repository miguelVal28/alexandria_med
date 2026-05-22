"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type AuthFormState } from "../_lib/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Iniciando…" : "Iniciar sesión"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState<AuthFormState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm">
          Correo
        </label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm">
          Contraseña
        </label>
        <Input id="password" name="password" type="password" required />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-muted">
        ¿Aún no tienes cuenta?{" "}
        <a href="/signup" className="underline">
          Regístrate
        </a>
      </p>
    </form>
  );
}