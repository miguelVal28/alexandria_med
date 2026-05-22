"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signupAction, type AuthFormState } from "../_lib/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Creando cuenta…" : "Crear cuenta"}
    </Button>
  );
}

export function SignupForm() {
  const [state, action] = useFormState<AuthFormState, FormData>(
    signupAction,
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
        <label htmlFor="full_name" className="text-sm">
          Nombre completo
        </label>
        <Input id="full_name" name="full_name" required />
      </div>

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
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted">Mínimo 8 caracteres.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="date_of_birth" className="text-sm">
          Fecha de nacimiento
        </label>
        <Input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          required
        />
      </div>

      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="space-y-1">
          <label htmlFor="document_type" className="text-sm">
            Tipo
          </label>
          <select
            id="document_type"
            name="document_type"
            defaultValue="CC"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="TI">TI</option>
            <option value="PA">PA</option>
            <option value="RC">RC</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="document" className="text-sm">
            Documento
          </label>
          <Input id="document" name="document" required />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm">
          Teléfono <span className="text-muted">(opcional)</span>
        </label>
        <Input id="phone" name="phone" type="tel" />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}