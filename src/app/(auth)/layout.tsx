import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-dark-900 text-light-100 p-10">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Victor" width={153} height={102} />
        </div>

        <div className="space-y-4">
          <h2 className="text-heading-2">Tu mejor opción</h2>
          <p className="max-w-md text-lead text-light-300">
            Encuentra el mejor surtido de partes eléctricas para tu vehículo.
          </p>
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-light-100/90" />
            <span className="h-2 w-2 rounded-full bg-light-100/50" />
            <span className="h-2 w-2 rounded-full bg-light-100/50" />
          </div>
        </div>

        <p className="text-footnote text-light-400">
          © 2026 Todo Electrico Victor. All rights reserved.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
