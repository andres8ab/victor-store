"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CategoryModal from "./CategoryModal";

type Category = {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
};

export default function CreateCategoryButton({ categories }: { categories: Category[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors cursor-pointer"
            >
                <Plus className="h-5 w-5" />
                Nueva Categoría
            </button>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
            />
        </>
    );
}
