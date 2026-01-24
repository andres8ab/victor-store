"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onRemove: (url: string) => void;
    value: string[];
    maxFiles?: number;
}

export default function ImageUpload({
    onUpload,
    onRemove,
    value,
    maxFiles = 5,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (value.length + files.length > maxFiles) {
            alert(`Máximo ${maxFiles} imágenes permitidas`);
            return;
        }

        setIsUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error("Error al subir imagen");
                }

                const data = await res.json();
                onUpload(data.url);
            }
        } catch (error) {
            console.error(error);
            alert("Error al subir la imagen");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-light-300"
                    >
                        <div className="absolute right-2 top-2 z-10">
                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                className="rounded-full bg-red p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt="Product image"
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {value.length < maxFiles && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-light-300 bg-light-100 py-6 text-dark-500 transition-colors hover:bg-light-200"
                    >
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark-500 border-t-transparent" />
                                <span>Subiendo...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="mb-2 h-6 w-6" />
                                <span className="text-body-small">
                                    Click para subir imágenes
                                </span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
