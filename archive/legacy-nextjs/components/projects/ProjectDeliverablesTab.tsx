"use client";
import Image from "next/image";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Image as ImageIcon,
    Download,
    MoreVertical,
    Plus,
    FileImage,
    Layout
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ProjectDeliverablesTab({ project }: { project: any }) {
    const deliverables = project.deliverables || [];

    const getFileIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'SKETCH':
            case 'DRAWING_2D':
                return <FileImage className="h-10 w-10 text-blue-500" />;
            case 'RENDER_3D':
                return <ImageIcon className="h-10 w-10 text-primary" />;
            case 'PDF':
            case 'DOCUMENT':
                return <FileText className="h-10 w-10 text-red-500" />;
            default:
                return <Layout className="h-10 w-10 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED':
                return <Badge className="bg-green-600">Aprovado</Badge>;
            case 'PENDING_REVIEW':
                return <Badge variant="secondary" className="bg-yellow-500 text-white">Em Revisão</Badge>;
            case 'DRAFT':
                return <Badge variant="outline">Rascunho</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Entregáveis e Pranchas</h3>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Entregável
                </Button>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {deliverables.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
                        <div className="aspect-video bg-muted flex items-center justify-center relative">
                            {item.type === 'RENDER_3D' && item.fileUrl ? (
                                <Image
                                    src={item.fileUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                getFileIcon(item.type)
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 shadow-sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Nova Versão</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                            <div>
                                <h4 className="font-semibold text-sm line-clamp-1" title={item.name}>{item.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">V{item.version || 1} • {item.type}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                {getStatusBadge(item.status)}
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    Download
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {deliverables.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl bg-muted/5">
                        <div className="bg-muted/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Nenhum entregável cadastrado</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Clique em "Novo Entregável" para adicionar renders, pranchas e outros ativos ao projeto.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
