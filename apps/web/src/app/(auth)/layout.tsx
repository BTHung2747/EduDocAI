export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex min-h-screen items-center justify-center p-4 sm:p-8">{children}</main>;
}
