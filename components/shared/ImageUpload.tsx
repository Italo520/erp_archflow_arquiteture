"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange?: (value: string) => void;
    onRemove?: () => void;
    disabled?: boolean;
    label?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled,
    label = "Upload Image"
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | undefined>(value);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file to server
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload image");
            }

            const data = await response.json();

            // Call onChange with the public URL from the server
            onChange?.(data.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            // Revert preview on failure
            setPreview(value);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onRemove?.();
        onChange?.("");
    };

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={preview} />
                <AvatarFallback className="bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground opacity-50" />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? "Uploading..." : label}
                </Button>
                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={handleRemove}
                        className="text-destructive hover:text-destructive/90"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Remover
                    </Button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={disabled || isUploading}
                />
            </div>
        </div>
    );
}
