"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface ChartProps {
    title: string;
    description?: string;
    children: ReactNode;
    loading?: boolean;
    error?: boolean;
    errorMessage?: string;
    className?: string;
}

export function Chart({
    title,
    description,
    children,
    loading = false,
    error = false,
    errorMessage = "Não foi possível carregar os dados.",
    className = "",
}: ChartProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-[250px]">
                        <div className="space-y-3 w-full">
                            <Skeleton className="h-[200px] w-full rounded-lg" />
                            <div className="flex justify-center gap-4">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-3 text-destructive/50" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                ) : (
                    <div className="h-[250px] w-full">
                        {children}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
