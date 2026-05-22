export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}