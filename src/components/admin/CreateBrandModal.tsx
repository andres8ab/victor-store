"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import ImageUpload from "./ImageUpload";
import { createBrand } from "@/lib/actions/admin/brands";


interface CreateBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBrandModal({
    isOpen,
    onClose,
}: CreateBrandModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-generate slug from name
    useEffect(() => {
        if (!slug && name) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [name, slug]);

    // Better slugify on name change if slug hasn't been manually edited? 
    // Actually, usually it's better to just let user type name and fill slug, but if they edit slug, stop auto-filling.
    // For simplicity, I will just auto-fill on name change if slug is empty or matches previous slugified name.

    const handleNameChange = (val: string) => {
        setName(val);
        const newSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setSlug(newSlug);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createBrand({
                name,
                slug,
                logoUrl,
            });

            if (result.success) {
                onClose();
                // Reset form
                setName("");
                setSlug("");
                setLogoUrl(null);
            }
        } catch (error) {
            console.error("Error creating brand:", error);
            alert("Error al crear la marca");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            header="Crear Nueva Marca"
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
                            placeholder="Ej: Nike"
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
                            placeholder="Ej: nike"
                        />
                        <small className="text-dark-500">
                            Identificador único para la URL. Se genera automáticamente pero puede editarse.
                        </small>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-body-medium text-dark-900">Logo</label>
                        <ImageUpload
                            value={logoUrl ? [logoUrl] : []}
                            onUpload={(url) => setLogoUrl(url)}
                            onRemove={() => setLogoUrl(null)}
                            maxFiles={1}
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
                        label={isSubmitting ? "Creando..." : "Crear Marca"}
                        icon="pi pi-check"
                        className="bg-green border-green hover:bg-green/90"
                        loading={isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
}
