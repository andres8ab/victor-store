"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BrandModal from "./BrandModal";

export default function CreateBrandButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center cursor-pointer gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors"
            >
                <Plus className="h-5 w-5" />
                Nueva Marca
            </button>

            <BrandModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
