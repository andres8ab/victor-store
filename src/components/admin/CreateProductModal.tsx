"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import ImageUpload from "./ImageUpload";
import { createProduct } from "@/lib/actions/admin/products";

type Category = {
    id: string;
    name: string;
};

type Brand = {
    id: string;
    name: string;
};

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    brands: Brand[];
}

export default function CreateProductModal({
    isOpen,
    onClose,
    categories,
    brands,
}: CreateProductModalProps) {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createProduct({
                name,
                description,
                categoryId: categoryId,
                brandId: brandId,
                images,
                isPublished: false,
            });

            if (result.success) {
                toast.current?.show({
                    severity: "success",
                    summary: "Producto creado",
                    detail: `"${name}" fue creado correctamente`,
                    life: 3000,
                });
                // Reset form
                setName("");
                setDescription("");
                setCategoryId(null);
                setBrandId(null);
                setImages([]);
                // Redirect to the product edit page after a short delay
                setTimeout(() => {
                    onClose();
                    router.push(`/admin/products/${result.product.id}`);
                }, 800);
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudo crear el producto. Intenta nuevamente.",
                    life: 5000,
                });
            }
        } catch (error) {
            console.error("Error creating product:", error);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Ocurrió un error inesperado. Por favor intenta nuevamente.",
                life: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                modal
                header="Crear Nuevo Producto"
                visible={isOpen}
                onHide={onClose}
                className="w-full max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-body-medium text-dark-900">
                                Nombre/Título
                            </label>
                            <InputText
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full"
                                placeholder="Ej: Batería Willard 800Amp"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="description"
                                className="text-body-medium text-dark-900"
                            >
                                Descripción
                            </label>
                            <InputTextarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                className="w-full"
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="category"
                                    className="text-body-medium text-dark-900"
                                >
                                    Categoría
                                </label>
                                <Dropdown
                                    id="category"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.value)}
                                    options={categories}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Seleccionar Categoría"
                                    className="w-full"
                                    showClear
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="brand" className="text-body-medium text-dark-900">
                                    Marca
                                </label>
                                <Dropdown
                                    id="brand"
                                    value={brandId}
                                    onChange={(e) => setBrandId(e.value)}
                                    options={brands}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Seleccionar Marca"
                                    className="w-full"
                                    showClear
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-body-medium text-dark-900">Imágenes</label>
                            <ImageUpload
                                value={images}
                                onUpload={(url) => setImages([...images, url])}
                                onRemove={(url) => setImages(images.filter((img) => img !== url))}
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
                            label={isSubmitting ? "Creando..." : "Crear Producto"}
                            icon="pi pi-check"
                            className="bg-green border-green hover:bg-green/90"
                            loading={isSubmitting}
                        />
                    </div>
                </form>
            </Dialog>
        </>
    );
}
