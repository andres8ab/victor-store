"use client";

import { useState, useEffect } from "react";
import { Phone, BadgePercent, Truck } from "lucide-react";

const MESSAGES = [
  {
    icon: Phone,
    text: "Línea única call center 3003725519",
  },
  {
    icon: BadgePercent,
    text: "15% de descuento en la primera compra",
  },
  {
    icon: Truck,
    text: "Envío gratis por compras superiores a $170.000",
  },
] as const;

const ROTATE_INTERVAL_MS = 4000;

export default function PromoBar() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => {
        setPrev(i);
        return (i + 1) % MESSAGES.length;
      });
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden bg-dark-900 text-light-100">
      <div className="relative mx-auto flex h-12 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        {MESSAGES.map(({ icon: Icon, text }, i) => {
          const position =
            i === active
              ? "translate-x-0 opacity-100 transition-all duration-700 ease-in-out"
              : i === prev
                ? "-translate-x-full opacity-0 transition-all duration-700 ease-in-out"
                : "translate-x-full opacity-0";
          return (
            <p
              key={text}
              className={`absolute flex items-center gap-2.5 whitespace-nowrap text-body-medium text-light-100 ${position}`}
              aria-hidden={i !== active}
            >
              <Icon className="h-5 w-5 shrink-0 text-primary-400" aria-hidden />
              {text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
