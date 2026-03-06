"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

const FILENAME = "catalogo-productos.pdf";

export default function DownloadCatalogButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/catalog-pdf", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Debes iniciar sesión como administrador.");
          return;
        }
        setError("Error al generar el catálogo.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FILENAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al descargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-green bg-transparent px-4 py-2 text-body-medium text-green hover:bg-green/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FileDown className="h-5 w-5" />
        {loading ? "Generando…" : "Descargar catálogo PDF"}
      </button>
      {error && (
        <p className="text-footnote text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
