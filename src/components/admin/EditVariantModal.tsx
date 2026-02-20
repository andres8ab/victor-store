"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import ImageUpload from "./ImageUpload";
import { updateProductVariant } from "@/lib/actions/admin/products";

type Variant = {
    id: string;
    name: string;
    image: string | null;
    price: number;
    salePrice: number | null;
    inStock: number;
    isActive: boolean;
};

interface EditVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: Variant | null;
    onUpdated: (updated: Variant) => void;
}

export default function EditVariantModal({
    isOpen,
    onClose,
    variant,
    onUpdated,
}: EditVariantModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number | null>(null);
    const [salePrice, setSalePrice] = useState<number | null>(null);
    const [stock, setStock] = useState<number>(0);
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate fields when a variant is selected
    useEffect(() => {
        if (variant) {
            setName(variant.name);
            setPrice(variant.price);
            setSalePrice(variant.salePrice);
            setStock(variant.inStock);
            setImages(variant.image ? [variant.image] : []);
        }
    }, [variant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!variant) return;
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

            const result = await updateProductVariant({
                id: variant.id,
                name,
                price: price.toString(),
                salePrice: salePrice ? salePrice.toString() : null,
                inStock: stock,
                image: images[0] ?? null,
                images,
            });

            if (result.success) {
                onUpdated({
                    ...variant,
                    name,
                    price,
                    salePrice,
                    inStock: stock,
                    image: images[0] ?? null,
                });
                onClose();
            }
        } catch (error) {
            console.error("Error updating variant:", error);
            alert("Error al actualizar la variante");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            header="Editar Variante"
            visible={isOpen}
            onHide={onClose}
            className="w-full max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="edit-name" className="text-body-medium text-dark-900">
                            Nombre de la Variante
                        </label>
                        <InputText
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full"
                            placeholder="Ej: Rojo, Talla M, Pack x3"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="edit-price" className="text-body-medium text-dark-900">
                                Precio Normal
                            </label>
                            <InputNumber
                                id="edit-price"
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
                            <label htmlFor="edit-salePrice" className="text-body-medium text-dark-900">
                                Precio Oferta (Opcional)
                            </label>
                            <InputNumber
                                id="edit-salePrice"
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
                        <label htmlFor="edit-stock" className="text-body-medium text-dark-900">
                            Stock
                        </label>
                        <InputNumber
                            id="edit-stock"
                            value={stock}
                            onValueChange={(e) => setStock(e.value ?? 0)}
                            required
                            className="w-full"
                            useGrouping={false}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-body-medium text-dark-900">Imagen</label>
                        <ImageUpload
                            value={images}
                            onUpload={(url) => setImages([url])}
                            onRemove={() => setImages([])}
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
                        label={isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        icon="pi pi-check"
                        className="bg-green border-green hover:bg-green/90"
                        loading={isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
}
