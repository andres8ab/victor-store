import { Navbar, Footer } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="relative flex flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,420px)] bg-linear-to-b from-primary-500/10 via-transparent to-transparent"
          aria-hidden
        />
        {children}
      </div>
      <Footer />
    </div>
  );
}
