"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getArrayParam,
  removeParams,
  toggleArrayParam,
} from "@/lib/utils/query";

const CATEGORIES = [
  "componentes-electricos",
  "herramientas",
  "cableado",
  "iluminacion",
  "interruptores",
  "enchufes",
] as const;
const BRANDS = ["schneider", "siemens", "general-electric", "philips", "osram"] as const;
const COLORS = ["negro", "blanco", "gris", "plateado"] as const;
const PRICES = [
  { id: "0-50000", label: "$0 - $50.000" },
  { id: "50000-100000", label: "$50.000 - $100.000" },
  { id: "100000-200000", label: "$100.000 - $200.000" },
  { id: "200000-", label: "Más de $200.000" },
] as const;

type GroupKey = "category" | "brand" | "color" | "price";

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useMemo(() => `?${searchParams.toString()}`, [searchParams]);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<GroupKey, boolean>>({
    category: true,
    brand: true,
    color: true,
    price: true,
  });

  const activeCounts = {
    category: getArrayParam(search, "category").length,
    brand: getArrayParam(search, "brand").length,
    color: getArrayParam(search, "color").length,
    price: getArrayParam(search, "price").length,
  };

  useEffect(() => {
    setOpen(false);
  }, [search]);

  const onToggle = (key: GroupKey, value: string) => {
    const url = toggleArrayParam(pathname, search, key, value);
    router.push(url, { scroll: false });
  };

  const clearAll = () => {
    const url = removeParams(pathname, search, [
      "category",
      "brand",
      "color",
      "price",
      "page",
    ]);
    router.push(url, { scroll: false });
  };

  const Group = ({
    title,
    children,
    k,
  }: {
    title: string;
    children: import("react").ReactNode;
    k: GroupKey;
  }) => (
    <div className="border-b border-light-300 py-4">
      <button
        className="flex w-full items-center justify-between text-body-medium text-dark-900"
        onClick={() => setExpanded((s) => ({ ...s, [k]: !s[k] }))}
        aria-expanded={expanded[k]}
        aria-controls={`${k}-section`}
      >
        <span>{title}</span>
        <span className="text-caption text-dark-700">
          {expanded[k] ? "−" : "+"}
        </span>
      </button>
      <div
        id={`${k}-section`}
        className={`${expanded[k] ? "mt-3 block" : "hidden"}`}
      >
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between md:hidden">
        <button
          className="rounded-md border border-light-300 px-3 py-2 text-body-medium"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          Filtrar
        </button>
        <button
          className="text-caption text-dark-700 underline"
          onClick={clearAll}
        >
          Limpiar
        </button>
      </div>

      <aside className="sticky top-20 hidden h-fit min-w-60 rounded-lg border border-light-300 bg-light-100 p-4 md:block">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-body-medium text-dark-900">Filtros</h3>
          <button
            className="text-caption text-dark-700 underline"
            onClick={clearAll}
          >
            Limpiar
          </button>
        </div>

        <Group
          title={`Categoría ${activeCounts.category ? `(${activeCounts.category})` : ""
            }`}
          k="category"
        >
          <ul className="space-y-2">
            {CATEGORIES.map((c) => {
              const checked = getArrayParam(search, "category").includes(c);
              const label = c
                .split("-")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ");
              return (
                <li key={c} className="flex items-center gap-2">
                  <input
                    id={`category-${c}`}
                    type="checkbox"
                    className="h-4 w-4 accent-dark-900"
                    checked={checked}
                    onChange={() => onToggle("category" as GroupKey, c)}
                  />
                  <label
                    htmlFor={`category-${c}`}
                    className="text-body text-dark-900"
                  >
                    {label}
                  </label>
                </li>
              );
            })}
          </ul>
        </Group>

        <Group
          title={`Marca ${activeCounts.brand ? `(${activeCounts.brand})` : ""}`}
          k="brand"
        >
          <ul className="space-y-2">
            {BRANDS.map((b) => {
              const checked = getArrayParam(search, "brand").includes(b);
              const label = b
                .split("-")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ");
              return (
                <li key={b} className="flex items-center gap-2">
                  <input
                    id={`brand-${b}`}
                    type="checkbox"
                    className="h-4 w-4 accent-dark-900"
                    checked={checked}
                    onChange={() => onToggle("brand" as GroupKey, b)}
                  />
                  <label
                    htmlFor={`brand-${b}`}
                    className="text-body text-dark-900"
                  >
                    {label}
                  </label>
                </li>
              );
            })}
          </ul>
        </Group>

        <Group
          title={`Color ${activeCounts.color ? `(${activeCounts.color})` : ""}`}
          k="color"
        >
          <ul className="grid grid-cols-2 gap-2">
            {COLORS.map((c) => {
              const checked = getArrayParam(search, "color").includes(c);
              return (
                <li key={c} className="flex items-center gap-2">
                  <input
                    id={`color-${c}`}
                    type="checkbox"
                    className="h-4 w-4 accent-dark-900"
                    checked={checked}
                    onChange={() => onToggle("color", c)}
                  />
                  <label
                    htmlFor={`color-${c}`}
                    className="text-body capitalize"
                  >
                    {c[0].toUpperCase() + c.slice(1)}
                  </label>
                </li>
              );
            })}
          </ul>
        </Group>

        <Group
          title={`Precio ${activeCounts.price ? `(${activeCounts.price})` : ""}`}
          k="price"
        >
          <ul className="space-y-2">
            {PRICES.map((p) => {
              const checked = getArrayParam(search, "price").includes(p.id);
              return (
                <li key={p.id} className="flex items-center gap-2">
                  <input
                    id={`price-${p.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-dark-900"
                    checked={checked}
                    onChange={() => onToggle("price", p.id)}
                  />
                  <label htmlFor={`price-${p.id}`} className="text-body">
                    {p.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </Group>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[80%] overflow-auto bg-light-100 p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-body-medium">Filtros</h3>
              <button
                className="text-caption text-dark-700 underline"
                onClick={clearAll}
              >
                Limpiar
              </button>
            </div>
            {/* Reuse the same desktop content by rendering the component again */}
            <div className="md:hidden">
              <Group title="Categoría" k="category">
                <ul className="space-y-2">
                  {CATEGORIES.map((c) => {
                    const checked = getArrayParam(search, "category").includes(c);
                    const label = c
                      .split("-")
                      .map((word) => word[0].toUpperCase() + word.slice(1))
                      .join(" ");
                    return (
                      <li key={c} className="flex items-center gap-2">
                        <input
                          id={`m-category-${c}`}
                          type="checkbox"
                          className="h-4 w-4 accent-dark-900"
                          checked={checked}
                          onChange={() => onToggle("category", c)}
                        />
                        <label htmlFor={`m-category-${c}`} className="text-body">
                          {label}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Group>

              <Group title="Marca" k="brand">
                <ul className="space-y-2">
                  {BRANDS.map((b) => {
                    const checked = getArrayParam(search, "brand").includes(b);
                    const label = b
                      .split("-")
                      .map((word) => word[0].toUpperCase() + word.slice(1))
                      .join(" ");
                    return (
                      <li key={b} className="flex items-center gap-2">
                        <input
                          id={`m-brand-${b}`}
                          type="checkbox"
                          className="h-4 w-4 accent-dark-900"
                          checked={checked}
                          onChange={() => onToggle("brand", b)}
                        />
                        <label htmlFor={`m-brand-${b}`} className="text-body">
                          {label}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Group>

              <Group title="Color" k="color">
                <ul className="grid grid-cols-2 gap-2">
                  {COLORS.map((c) => {
                    const checked = getArrayParam(search, "color").includes(c);
                    return (
                      <li key={c} className="flex items-center gap-2">
                        <input
                          id={`m-color-${c}`}
                          type="checkbox"
                          className="h-4 w-4 accent-dark-900"
                          checked={checked}
                          onChange={() => onToggle("color", c)}
                        />
                        <label
                          htmlFor={`m-color-${c}`}
                          className="text-body capitalize"
                        >
                          {c[0].toUpperCase() + c.slice(1)}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Group>

              <Group title="Precio" k="price">
                <ul className="space-y-2">
                  {PRICES.map((p) => {
                    const checked = getArrayParam(search, "price").includes(
                      p.id,
                    );
                    return (
                      <li key={p.id} className="flex items-center gap-2">
                        <input
                          id={`m-price-${p.id}`}
                          type="checkbox"
                          className="h-4 w-4 accent-dark-900"
                          checked={checked}
                          onChange={() => onToggle("price", p.id)}
                        />
                        <label
                          htmlFor={`m-price-${p.id}`}
                          className="text-body"
                        >
                          {p.label}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Group>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
