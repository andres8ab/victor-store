import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden rounded-4xl border border-white/10 bg-dark-900 text-white shadow-[0_24px_80px_-24px_rgb(0_0_0/0.45)]"
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 1.5rem), 98% 100%, 0 100%)",
      }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-dark-900 via-dark-900/85 to-primary-600/25" />
        <div className="grain-overlay absolute inset-0 mix-blend-overlay" />
        <div
          className="absolute -right-24 top-1/2 h-[min(120%,800px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full bg-primary-500/15 blur-3xl"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div className="max-w-2xl">
            <p
              className="animate-home-fade-up text-caption font-medium uppercase tracking-[0.35em] text-primary-400 opacity-0"
              style={{ animationFillMode: "forwards" }}
            >
              Autopartes eléctricas
            </p>
            <h1 className="font-display mt-4 text-5xl leading-[0.92] tracking-tight opacity-0 sm:text-6xl md:text-7xl lg:text-8xl animate-home-fade-up animate-home-delay-1">
              Todo Eléctrico
              <span className="block text-primary-500">Víctor</span>
            </h1>
            <p className="animate-home-fade-up animate-home-delay-2 mt-8 max-w-lg text-lg leading-relaxed text-light-400 opacity-0 sm:text-xl">
              Partes eléctricas para vehículos con la confianza de quien lleva
              años en el taller. Calidad, surtido y asesoría en un solo lugar.
            </p>
            <div className="animate-home-fade-up animate-home-delay-3 mt-10 flex flex-wrap gap-4 opacity-0">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-primary-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-dark-900 shadow-lg shadow-primary-500/25 transition hover:bg-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
              >
                Ver catálogo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
              >
                Contáctanos
              </Link>
            </div>
          </div>

          <aside
            className="animate-home-fade-up animate-home-delay-2 hidden opacity-0 lg:block"
            style={{ animationFillMode: "forwards" }}
          >
            <dl className="space-y-6 rounded-2xl border border-white/10 bg-dark-900/40 p-8 backdrop-blur-md">
              <div className="border-b border-white/10 pb-5">
                <dt className="text-caption uppercase tracking-widest text-dark-500">
                  Cobertura
                </dt>
                <dd className="font-display mt-1 text-4xl text-white">
                  Nacional
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-widest text-dark-500">
                  Enfoque
                </dt>
                <dd className="mt-2 text-body text-light-300">
                  Alternadores, sensores, iluminación y más para tu flota o tu
                  auto particular.
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
