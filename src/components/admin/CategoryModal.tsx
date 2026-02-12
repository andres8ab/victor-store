"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { createCategory, updateCategory } from "@/lib/actions/admin/categories";

type Category = {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
};

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    initialData?: Category | null;
}

export default function CategoryModal({
    isOpen,
    onClose,
    categories,
    initialData
}: CategoryModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setSlug(initialData.slug);
                setParentId(initialData.parentId || null);
            } else {
                setName("");
                setSlug("");
                setParentId(null);
            }
        }
    }, [isOpen, initialData]);

    const handleNameChange = (val: string) => {
        setName(val);
        // Only auto-generate slug if we are in create mode, or if the slug matches the old name-generated slug
        // But simplest rule: if user hasn't manually edited slug, keep auto-generating.
        // For simplicity in this refactor, I'll just auto-generate if it's not editing an existing one OR if we want to be smarter.
        // Let's stick to the previous logic but maybe only if it's a new entry? 
        // Actually, for editing, we might want to update slug too if name changes, but usually we don't want to break URLs.
        // Let's only auto-update slug if it's a NEW category.
        if (!initialData) {
            const newSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setSlug(newSlug);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let result;
            if (initialData) {
                result = await updateCategory({
                    id: initialData.id,
                    name,
                    slug,
                    parentId,
                });
            } else {
                result = await createCategory({
                    name,
                    slug,
                    parentId,
                });
            }

            if (result.success) {
                onClose();
                if (!initialData) {
                    setName("");
                    setSlug("");
                    setParentId(null);
                }
            }
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Error al guardar la categoría");
        } finally {
            setIsSubmitting(false);
        }
    };

    const headerText = initialData ? "Editar Categoría" : "Crear Nueva Categoría";
    const buttonText = isSubmitting ? "Guardando..." : (initialData ? "Guardar Cambios" : "Crear Categoría");

    return (
        <Dialog
            header={headerText}
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
                            options={categories.filter(c => c.id !== initialData?.id)} // Prevent selecting itself as parent
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
                        label={buttonText}
                        icon="pi pi-check"
                        className="bg-green border-green hover:bg-green/90"
                        loading={isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
}
