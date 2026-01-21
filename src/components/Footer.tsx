import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/actions/category";

export default async function Footer() {
  const categories = await getAllCategories();

  // Organize columns: distribute categories across columns, with navigation links
  const maxCategoriesPerColumn = 6;
  const categoryColumns: typeof categories[] = [];
  
  for (let i = 0; i < categories.length; i += maxCategoriesPerColumn) {
    categoryColumns.push(categories.slice(i, i + maxCategoriesPerColumn));
  }

  const columns = [
    // First column: Categories or Navigation
    {
      title: categoryColumns[0]?.length ? "Categorías" : "Navegación",
      links: categoryColumns[0] || [],
      isCategory: categoryColumns[0]?.length > 0,
      fallbackLinks: [
        { label: "Productos", href: "/products" },
        { label: "Categorías", href: "/categories" },
        { label: "Contacto", href: "/contact" },
      ],
    },
    // Second column: More categories or Company info
    {
      title: categoryColumns[1]?.length ? "Más Categorías" : "Información",
      links: categoryColumns[1] || [],
      isCategory: categoryColumns[1]?.length > 0,
      fallbackLinks: [
        { label: "Sobre Nosotros", href: "/about" },
        { label: "Política de Privacidad", href: "/privacy" },
        { label: "Términos y Condiciones", href: "/terms" },
      ],
    },
    // Third column: More categories or Support
    {
      title: categoryColumns[2]?.length ? "Más Categorías" : "Soporte",
      links: categoryColumns[2] || [],
      isCategory: categoryColumns[2]?.length > 0,
      fallbackLinks: [
        { label: "Contacto", href: "/contact" },
        { label: "Preguntas Frecuentes", href: "/faq" },
        { label: "Ayuda", href: "/help" },
      ],
    },
  ].filter((col) => col.links.length > 0 || col.fallbackLinks);
  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="flex items-start md:col-span-3">
            <Image src="/logo.png" alt="Victor" width={153} height={102} />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-heading-3">{col.title}</h4>
                <ul className="space-y-3">
                  {col.isCategory && col.links.length > 0
                    ? col.links.map((category) => (
                        <li key={category.id}>
                          <Link
                            href={`/products?category[]=${category.slug}`}
                            className="text-body text-light-400 hover:text-light-300 transition-colors"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))
                    : col.fallbackLinks?.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-body text-light-400 hover:text-light-300 transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex gap-4 md:col-span-2 md:justify-end">
            {[
              { src: "/x.svg", alt: "X" },
              { src: "/facebook.svg", alt: "Facebook" },
              { src: "/instagram.svg", alt: "Instagram" },
            ].map((s) => (
              <Link
                key={s.alt}
                href="#"
                aria-label={s.alt}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-light-100"
              >
                <Image src={s.src} alt={s.alt} width={18} height={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 text-light-400 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-caption">
            <Image src="/globe.svg" alt="" width={16} height={16} />
            <span>Colombia</span>
            <span>
              © 2026 Todo Electrico Victor Autopartes SAS. All Rights Reserved
            </span>
          </div>
          <ul className="flex items-center gap-6 text-caption">
            {[
              { label: "Términos y Condiciones", href: "/terms" },
              { label: "Política de Privacidad", href: "/privacy" },
              { label: "Contacto", href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-light-300 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
