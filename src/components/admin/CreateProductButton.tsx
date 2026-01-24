"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateProductModal from "./CreateProductModal";

type Category = {
    id: string;
    name: string;
};

type Brand = {
    id: string;
    name: string;
};

export default function CreateProductButton({
    categories,
    brands,
}: {
    categories: Category[];
    brands: Brand[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors"
            >
                <Plus className="h-5 w-5" />
                Nuevo Producto
            </button>

            <CreateProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                brands={brands}
            />
        </>
    );
}
