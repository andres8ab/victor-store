"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import ImageUpload from "./ImageUpload";
import { createProductVariant } from "@/lib/actions/admin/products";

interface CreateVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
}

export default function CreateVariantModal({
    isOpen,
    onClose,
    productId,
}: CreateVariantModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number | null>(null);
    const [salePrice, setSalePrice] = useState<number | null>(null);
    const [stock, setStock] = useState<number>(0);
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!name) {
                alert("El nombre es requerido");
                setIsSubmitting(false);
                return;
            }
            if (!price) {
                alert("El precio es requerido");
                setIsSubmitting(false);
                return;
            }

            const result = await createProductVariant({
                productId,
                name,
                price: price.toString(),
                salePrice: salePrice ? salePrice.toString() : null,
                inStock: stock,
                images,
                image: images[0] || null, // Use first image as main variant image
                isActive: true,
            });

            if (result.success) {
                onClose();
                // Reset form
                setName("");
                setPrice(null);
                setSalePrice(null);
                setStock(0);
                setImages([]);
            }
        } catch (error) {
            console.error("Error creating variant:", error);
            alert("Error al crear la variante");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            header="Crear Nueva Variante"
            visible={isOpen}
            onHide={onClose}
            className="w-full max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-body-medium text-dark-900">
                            Nombre de la Variante
                        </label>
                        <InputText
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full"
                            placeholder="Ej: Rojo, Talla M, Pack x3"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="price" className="text-body-medium text-dark-900">
                                Precio Normal
                            </label>
                            <InputNumber
                                id="price"
                                value={price}
                                onValueChange={(e) => setPrice(e.value ?? null)}
                                mode="currency"
                                currency="COP"
                                locale="es-CO"
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="salePrice"
                                className="text-body-medium text-dark-900"
                            >
                                Precio Oferta (Opcional)
                            </label>
                            <InputNumber
                                id="salePrice"
                                value={salePrice}
                                onValueChange={(e) => setSalePrice(e.value ?? null)}
                                mode="currency"
                                currency="COP"
                                locale="es-CO"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="stock" className="text-body-medium text-dark-900">
                            Stock Inicial
                        </label>
                        <InputNumber
                            id="stock"
                            value={stock}
                            onValueChange={(e) => setStock(e.value ?? 0)}
                            required
                            className="w-full"
                            useGrouping={false}
                        />
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
                        label={isSubmitting ? "Creando..." : "Crear Variante"}
                        icon="pi pi-check"
                        className="bg-green border-green hover:bg-green/90"
                        loading={isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
}
