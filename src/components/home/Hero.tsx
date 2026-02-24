import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-dark-900 text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt="Hero Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Todo Eléctrico <span className="text-primary-500">Víctor</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300">
            Encuentra las mejores partes eléctricas para tu vehículo. Calidad,
            variedad y el mejor servicio en un solo lugar.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/products"
              className="rounded-full bg-primary-500 px-8 py-3 text-sm md:text-base font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900"
            >
              Ver Productos
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-white/10 px-8 py-3 text-sm md:text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-dark-900"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
