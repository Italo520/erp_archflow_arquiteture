import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ClientAvatarProps {
    className?: string;
    avatarUrl?: string | null;
    name: string;
}

export function ClientAvatar({ className, avatarUrl, name }: ClientAvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
                className
            )}
        >
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    className="aspect-square h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-600 font-medium">
                    {initials}
                </div>
            )}
        </div>
    );
}
