"use client";

import { useState } from "react";
import { updateProduct } from "@/lib/actions/admin/products";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  categoryId: string | null;
  brandId: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Brand = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product: Product;
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: product.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string || null,
      brandId: formData.get("brandId") as string || null,
      isPublished: product.isPublished,
    };

    try {
      await updateProduct(data);
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-body-medium text-dark-900 mb-2"
        >
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={product.name}
          required
          className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-green"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-body-medium text-dark-900 mb-2"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={product.description}
          required
          rows={4}
          className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-green"
        />
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="block text-body-medium text-dark-900 mb-2"
        >
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product.categoryId || ""}
          className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-green"
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="brandId"
          className="block text-body-medium text-dark-900 mb-2"
        >
          Marca
        </label>
        <select
          id="brandId"
          name="brandId"
          defaultValue={product.brandId || ""}
          className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-green"
        >
          <option value="">Sin marca</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
