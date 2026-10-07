"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onChange?.(result); // In a real app, this would be the URL from storage
            };
            reader.readAsDataURL(file);
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
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {label}
                </Button>
                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
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
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
