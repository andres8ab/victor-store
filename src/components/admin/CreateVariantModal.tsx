"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import ImageUpload from "./ImageUpload";
import { createProductVariant } from "@/lib/actions/admin/products";

type Color = {
    id: string;
    name: string;
};

type Size = {
    id: string;
    name: string;
};

interface CreateVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    colors: Color[];
    sizes: Size[];
}

export default function CreateVariantModal({
    isOpen,
    onClose,
    productId,
    colors,
    sizes,
}: CreateVariantModalProps) {
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState<number | null>(null);
    const [salePrice, setSalePrice] = useState<number | null>(null);
    const [stock, setStock] = useState<number>(0);
    const [colorId, setColorId] = useState<string | null>(null);
    const [sizeId, setSizeId] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!price) {
                alert("El precio es requerido");
                setIsSubmitting(false);
                return;
            }

            const result = await createProductVariant({
                productId,
                sku,
                price: price.toString(),
                salePrice: salePrice ? salePrice.toString() : null,
                colorId,
                sizeId,
                inStock: stock,
                images,
                isActive: true,
            });

            if (result.success) {
                onClose();
                // Reset form
                setSku("");
                setPrice(null);
                setSalePrice(null);
                setStock(0);
                setColorId(null);
                setSizeId(null);
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
                        <label htmlFor="sku" className="text-body-medium text-dark-900">
                            SKU
                        </label>
                        <InputText
                            id="sku"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            required
                            className="w-full"
                            placeholder="Ej: BAT-WIL-800"
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="color" className="text-body-medium text-dark-900">
                                Color
                            </label>
                            <Dropdown
                                id="color"
                                value={colorId}
                                onChange={(e) => setColorId(e.value)}
                                options={colors}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Seleccionar"
                                className="w-full"
                                showClear
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="size" className="text-body-medium text-dark-900">
                                Medida/Talla
                            </label>
                            <Dropdown
                                id="size"
                                value={sizeId}
                                onChange={(e) => setSizeId(e.value)}
                                options={sizes}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Seleccionar"
                                className="w-full"
                                showClear
                            />
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
