"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { createCategory } from "@/lib/actions/admin/categories";

type Category = {
    id: string;
    name: string;
};

interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export default function CreateCategoryModal({
    isOpen,
    onClose,
    categories,
}: CreateCategoryModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameChange = (val: string) => {
        setName(val);
        const newSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setSlug(newSlug);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createCategory({
                name,
                slug,
                parentId,
            });

            if (result.success) {
                onClose();
                // Reset form
                setName("");
                setSlug("");
                setParentId(null);
            }
        } catch (error) {
            console.error("Error creating category:", error);
            alert("Error al crear la categoría");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            header="Crear Nueva Categoría"
            visible={isOpen}
            onHide={onClose}
            className="w-full max-w-lg"
            modal
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-body-medium text-dark-900">
                            Nombre
                        </label>
                        <InputText
                            id="name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            required
                            className="w-full"
                            placeholder="Ej: Baterías"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="slug" className="text-body-medium text-dark-900">
                            Slug (URL)
                        </label>
                        <InputText
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            className="w-full"
                            placeholder="Ej: baterias"
                        />
                        <small className="text-dark-500">
                            Identificador único para la URL.
                        </small>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="category"
                            className="text-body-medium text-dark-900"
                        >
                            Categoría Padre (Opcional)
                        </label>
                        <Dropdown
                            id="category"
                            value={parentId}
                            onChange={(e) => setParentId(e.value)}
                            options={categories}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleccionar Categoría Padre"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-light-300">
                    <Button
                        type="button"
                        label="Cancelar"
                        icon="pi pi-times"
                        className="p-button-text text-dark-700"
                        onClick={onClose}
                    />
                    <Button
                        type="submit"
                        label={isSubmitting ? "Creando..." : "Crear Categoría"}
                        icon="pi pi-check"
                        className="bg-green border-green hover:bg-green/90"
                        loading={isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
}
