import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Sección izquierda - Branding */}
      <section className="flex flex-col justify-between bg-dark-900 text-light-100 p-6 sm:p-8 lg:p-10">
        {/* Logo */}
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Victor" 
            width={1530} 
            height={1020}
            className="w-24 h-auto sm:w-32 lg:w-auto lg:max-w-xs"
          />
        </div>

        {/* Contenido principal - visible en mobile */}
        <div className="space-y-3 sm:space-y-4 my-6 lg:my-0">
          <h2 className="text-heading-3 sm:text-heading-2">Tu mejor opción</h2>
          <p className="max-w-md text-body sm:text-lead text-light-300">
            Encuentra el mejor surtido de partes eléctricas para tu vehículo.
          </p>
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-light-100/90" />
            <span className="h-2 w-2 rounded-full bg-light-100/50" />
            <span className="h-2 w-2 rounded-full bg-light-100/50" />
          </div>
        </div>

        {/* Footer - oculto en mobile, visible en desktop */}
        <p className="hidden lg:block text-footnote text-light-400">
          © {currentYear} Todo Electrico Victor. All rights reserved.
        </p>
      </section>

      {/* Sección derecha - Formulario */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </section>

      {/* Footer mobile - visible solo en mobile */}
      <div className="lg:hidden bg-dark-900 text-light-400 text-center py-4 px-4">
        <p className="text-footnote">
          © {currentYear} Todo Electrico Victor. All rights reserved.
        </p>
      </div>
    </main>
  );
}