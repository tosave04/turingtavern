export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
