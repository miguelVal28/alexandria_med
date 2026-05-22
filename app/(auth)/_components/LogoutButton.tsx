import { logoutAction } from "../_lib/auth.actions";

export function LogoutButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form action={logoutAction} className={className}>
      {children}
    </form>
  );
}