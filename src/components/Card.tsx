import Image from "next/image";
import Link from "next/link";

export type BadgeTone = "red" | "green" | "orange";

export interface CardProps {
  title: string;
  description?: string;
  subtitle?: string;
  meta?: string | string[];
  imageSrc: string;
  imageAlt?: string;
  price?: string | number;
   salePrice?: string | number;
  href?: string;
  badge?: { label: string; tone?: BadgeTone };
  className?: string;
}

const toneToBg: Record<BadgeTone, string> = {
  red: "text-red",
  green: "text-green",
  orange: "text-orange",
};

export default function Card({
  title,
  description,
  subtitle,
  meta,
  imageSrc,
  imageAlt = title,
  price,
  salePrice,
  href,
  badge,
  className = "",
}: CardProps) {
  const formatPrice = (value: string | number | undefined) => {
    if (value === undefined) return undefined;
    const num =
      typeof value === "number" ? value : Number.parseFloat(value ?? "");
    if (Number.isNaN(num)) return undefined;
    return `$${num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const basePriceFormatted = formatPrice(price);
  const salePriceFormatted = formatPrice(salePrice);

  const hasValidSale =
    salePriceFormatted !== undefined &&
    basePriceFormatted !== undefined &&
    (() => {
      const baseNum =
        typeof price === "number" ? price : Number.parseFloat(String(price));
      const saleNum =
        typeof salePrice === "number"
          ? salePrice
          : Number.parseFloat(String(salePrice));
      return !Number.isNaN(baseNum) &&
        !Number.isNaN(saleNum) &&
        saleNum < baseNum;
    })();

  const displayPrice = hasValidSale
    ? salePriceFormatted
    : basePriceFormatted ?? salePriceFormatted;

  const content = (
    <article
      className={`group rounded-xl bg-white shadow-sm ring-1 ring-light-300 transition duration-300 ease-out hover:shadow-lg hover:shadow-dark-900/10 hover:ring-primary-500/60 motion-safe:hover:-translate-y-1 ${className}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-white">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={720}
          height={720}
          // sizes="(min-width: 1280px) 360px, (min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
          className="object-contain w-auto h-full transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
        />
        {displayPrice && (
          <span className="absolute top-2 right-2 rounded-md bg-white/90 px-2 py-1 text-body-medium font-medium text-dark-900 shadow-sm ring-1 ring-light-300">
            {hasValidSale ? (
              <>
                <span className="text-green">{displayPrice}</span>
                <span className="ml-2 text-caption text-dark-700 line-through">
                  {basePriceFormatted}
                </span>
              </>
            ) : (
              displayPrice
            )}
          </span>
        )}
        {href && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 translate-y-full bg-primary-500 py-2.5 text-center transition-transform duration-300 ease-out motion-safe:group-hover:translate-y-0"
          >
            <span className="text-caption font-semibold uppercase tracking-wide text-dark-900">
              Ver detalle →
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        {badge && (
          <span
            className={`mb-2 inline-block rounded-full bg-light-200 px-2 py-0.5 text-caption ${toneToBg[badge.tone ?? "green"]}`}
          >
            {badge.label}
          </span>
        )}
        <h3 className="mb-1 line-clamp-2 wrap-break-word text-body text-dark-900 transition-colors group-hover:text-primary-600">
          {title}
        </h3>
        {description && (
          <p className="text-body text-dark-700">{description}</p>
        )}
        {subtitle && <p className="text-body text-dark-700">{subtitle}</p>}
        {meta && (
          <p className="mt-1 text-caption text-dark-700">
            {Array.isArray(meta) ? meta.join(" • ") : meta}
          </p>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link
      href={href}
      aria-label={title}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
