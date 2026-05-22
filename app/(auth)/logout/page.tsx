import { logoutAction } from "../_lib/auth.actions";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="font-display text-2xl text-ink">¿Cerrar sesión?</h1>
      <p className="text-sm text-muted">
        Volverás a la pantalla de inicio de sesión.
      </p>
      <form action={logoutAction}>
        <Button type="submit" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}