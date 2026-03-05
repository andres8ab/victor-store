"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { CartLink } from "./CartLink";
import { UserMenu } from "./UserMenu";
const NAV_LINKS = [
  { label: "Productos", href: "/products" },
  { label: "Categorías", href: "/categories" },
  { label: "Contacto", href: "/contact" },
] as const;

const DESKTOP_NAV_LINKS = NAV_LINKS.filter((l) => l.label !== "Contacto");

type SearchProduct = {
  id: string;
  name: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  salePrice?: number | null;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const mobileSearchBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const searchProducts = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(search)}&limit=8`,
        );
        const data = await response.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearch("");
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search)}`);
      setSearch("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (search.length === 0) return;
      const target = e.target as Node;
      if (searchBarRef.current?.contains(target)) return;
      if (mobileSearchBarRef.current?.contains(target)) return;
      setSearch("");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search.length]);

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            aria-label="Todo Electrico Victor Home"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/icon.png"
              alt="Todo Electrico Victor"
              width={132}
              height={88}
              priority
            />
          </Link>
          <ul className="hidden items-center gap-8 md:flex">
            {DESKTOP_NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-body text-dark-900 transition-colors hover:text-dark-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative hidden flex-1 items-center justify-center md:flex"
          ref={searchBarRef}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex w-full max-w-[500px] items-center"
          >
            <Search
              className="absolute left-3 h-5 w-5 text-dark-500"
              aria-hidden
            />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Encuentra lo que buscas"
              autoComplete="off"
              className="w-full rounded-full border border-light-300 bg-[#efefef] py-2 pl-10 pr-10 text-body text-dark-900 outline-none placeholder:text-center placeholder:text-dark-500 focus:ring-2 focus:ring-blue-500"
            />
            {searchLoading && (
              <div className="absolute right-3 text-dark-500">...</div>
            )}
            {search.length > 0 && !searchLoading && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 text-dark-700 hover:text-red-500"
                aria-label="Limpiar búsqueda"
              >
                ✖
              </button>
            )}
          </form>
          {search.length > 0 && (
            <div className="absolute left-1/2 top-full z-99 mt-1 w-full max-w-[500px] -translate-x-1/2 overflow-hidden rounded-xl bg-light-100 shadow-xl max-h-[65dvh] md:max-h-[400px] flex flex-col overflow-y-auto">
              {searchLoading ? (
                <div className="p-6 text-center text-body text-dark-700">
                  Buscando...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-body text-dark-700">
                  No se encontraron productos
                </div>
              ) : (
                <>
                  <div className="divide-y divide-light-300 overflow-y-auto">
                    {searchResults.map((product) => {
                      const formatPrice = (
                        value: number | null | undefined,
                      ) => {
                        if (value == null) return undefined;
                        return `$${value.toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`;
                      };
                      const basePrice = product.price as
                        | number
                        | null
                        | undefined;
                      const salePrice = product.salePrice as
                        | number
                        | null
                        | undefined;
                      const hasValidSale =
                        basePrice != null &&
                        salePrice != null &&
                        salePrice < basePrice;
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setSearch("")}
                          className="flex items-center gap-4 p-4 transition-colors hover:bg-light-200"
                        >
                          {product.imageUrl && (
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-light-200">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body-medium text-dark-900">
                              {product.name}
                            </p>
                            {product.subtitle && (
                              <p className="truncate text-caption text-dark-700">
                                {product.subtitle}
                              </p>
                            )}
                          </div>
                          {(basePrice != null || salePrice != null) && (
                            <div className="shrink-0 text-body-medium text-dark-900">
                              {hasValidSale ? (
                                <>
                                  <span className="text-[--color-green]">
                                    {formatPrice(salePrice)}
                                  </span>
                                  <span className="ml-1 text-caption text-dark-700 line-through">
                                    {formatPrice(basePrice)}
                                  </span>
                                </>
                              ) : (
                                formatPrice(basePrice ?? salePrice)
                              )}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-light-300 p-3">
                    <Link
                      href={`/products?search=${encodeURIComponent(search)}`}
                      onClick={() => setSearch("")}
                      className="block text-center text-body-medium text-dark-900 transition-colors hover:text-dark-700"
                    >
                      Ver todos los resultados →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <CartLink />
          <UserMenu />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-dark-900 transition-colors hover:text-dark-700 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile: second row with search input */}
      <div
        className="relative border-t border-light-300 px-4 py-3 md:hidden"
        ref={mobileSearchBarRef}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex w-full items-center"
        >
          <Search
            className="absolute left-3 h-5 w-5 text-dark-500"
            aria-hidden
          />
          <input
            id="search-input-mobile"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Encuentra lo que buscas"
            autoComplete="off"
            className="w-full rounded-xl border border-light-300 bg-[#efefef] py-2.5 pl-10 pr-10 text-body text-dark-900 outline-none placeholder:text-center placeholder:text-dark-500 focus:ring-2 focus:ring-blue-500"
          />
          {searchLoading && (
            <div className="absolute right-3 text-dark-500">...</div>
          )}
          {search.length > 0 && !searchLoading && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 text-dark-700 hover:text-red-500"
              aria-label="Limpiar búsqueda"
            >
              ✖
            </button>
          )}
        </form>
        {search.length > 0 && (
          <div className="absolute left-4 right-4 z-99 mt-2 max-h-[65dvh] overflow-hidden rounded-xl bg-light-100 shadow-xl flex flex-col overflow-y-auto">
            {searchLoading ? (
              <div className="p-6 text-center text-body text-dark-700">
                Buscando...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center text-body text-dark-700">
                No se encontraron productos
              </div>
            ) : (
              <>
                <div className="divide-y divide-light-300 overflow-y-auto">
                  {searchResults.map((product) => {
                    const formatPrice = (
                      value: number | null | undefined,
                    ) => {
                      if (value == null) return undefined;
                      return `$${value.toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`;
                    };
                    const basePrice = product.price as
                      | number
                      | null
                      | undefined;
                    const salePrice = product.salePrice as
                      | number
                      | null
                      | undefined;
                    const hasValidSale =
                      basePrice != null &&
                      salePrice != null &&
                      salePrice < basePrice;
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => setSearch("")}
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-light-200"
                      >
                        {product.imageUrl && (
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-light-200">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-medium text-dark-900">
                            {product.name}
                          </p>
                          {product.subtitle && (
                            <p className="truncate text-caption text-dark-700">
                              {product.subtitle}
                            </p>
                          )}
                        </div>
                        {(basePrice != null || salePrice != null) && (
                          <div className="shrink-0 text-body-medium text-dark-900">
                            {hasValidSale ? (
                              <>
                                <span className="text-[--color-green]">
                                  {formatPrice(salePrice)}
                                </span>
                                <span className="ml-1 text-caption text-dark-700 line-through">
                                  {formatPrice(basePrice)}
                                </span>
                              </>
                            ) : (
                              formatPrice(basePrice ?? salePrice)
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-light-300 p-3">
                  <Link
                    href={`/products?search=${encodeURIComponent(search)}`}
                    onClick={() => setSearch("")}
                    className="block text-center text-body-medium text-dark-900 transition-colors hover:text-dark-700"
                  >
                    Ver todos los resultados →
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div
        id="mobile-menu"
        className={`border-t border-light-300 md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <ul className="space-y-2 px-4 py-3">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block py-2 text-body text-dark-900 hover:text-dark-700"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
