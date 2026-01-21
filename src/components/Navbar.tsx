"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CartLink } from "./CartLink";
import SearchModal from "./SearchModal";

const NAV_LINKS = [
  { label: "Productos", href: "/products" },
  { label: "Categorías", href: "/categories" },
  { label: "Contacto", href: "/contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          aria-label="Todo Electrico Victor Home"
          className="flex items-center"
        >
          <Image
            src="/icon.png"
            alt="Todo Electrico Victor"
            width={102}
            height={68}
            priority
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
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

        <div className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-body text-dark-900 transition-colors hover:text-dark-700"
          >
            Buscar
          </button>
          <CartLink />
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
          <li className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setOpen(false);
              }}
              className="text-body"
            >
              Buscar
            </button>
            <CartLink />
          </li>
        </ul>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
