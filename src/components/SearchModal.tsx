"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&limit=8`,
        );
        const data = await response.json();
        setResults(data.products || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-light-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="border-b border-light-300">
          <div className="flex items-center gap-4 p-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="text-body text-dark-700 hover:text-dark-900"
            >
              ✕
            </button>
          </div>
        </form>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-body text-dark-700">
              Buscando...
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="p-8 text-center text-body text-dark-700">
              No se encontraron productos
            </div>
          ) : query.trim() && results.length > 0 ? (
            <div className="divide-y divide-light-300">
              {results.map((product) => {
                const price =
                  product.minPrice !== null &&
                  product.maxPrice !== null &&
                  product.minPrice !== product.maxPrice
                    ? `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`
                    : product.minPrice !== null
                      ? `$${product.minPrice.toFixed(2)}`
                      : undefined;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-light-200"
                  >
                    {product.imageUrl && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-light-200">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-body-medium text-dark-900">
                        {product.name}
                      </h3>
                      {product.subtitle && (
                        <p className="text-caption text-dark-700">
                          {product.subtitle}
                        </p>
                      )}
                    </div>
                    {price && (
                      <div className="text-body-medium text-dark-900">
                        {price}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-body text-dark-700">
              Escribe para buscar productos
            </div>
          )}
        </div>

        {query.trim() && results.length > 0 && (
          <div className="border-t border-light-300 p-4">
            <Link
              href={`/products?search=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="block text-center text-body-medium text-dark-900 transition-colors hover:text-dark-700"
            >
              Ver todos los resultados →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
