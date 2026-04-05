"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    projectSchema,
    ArchitecturalStyleEnum,
    ConstructionTypeEnum
} from "@/lib/validations";
import { createProject, updateProject } from "@/app/actions/project";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/shared/ImageUpload";

type ProjectFormProps = {
    initialData?: Partial<z.infer<typeof projectSchema>> & { id?: string };
    isEditing?: boolean;
};

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<any>({
        resolver: zodResolver(projectSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            status: initialData?.status || "PLANNING",
            clientId: initialData?.clientId || "",
            projectType: initialData?.projectType || "",
            address: initialData?.address || "",
            startDate: initialData?.startDate ? new Date(initialData.startDate as any) : undefined,
            estimatedEndDate: initialData?.estimatedEndDate ? new Date(initialData.estimatedEndDate as any) : undefined,
            totalArea: initialData?.totalArea || 0,
            plannedCost: initialData?.plannedCost || 0,
            architecturalStyle: initialData?.architecturalStyle || null,
            constructionType: initialData?.constructionType || null,
            numberOfFloors: initialData?.numberOfFloors || 1,
            numberOfRooms: initialData?.numberOfRooms || 0,
            hasBasement: initialData?.hasBasement || false,
            hasGarage: initialData?.hasGarage || false,
            environmentalLicenseRequired: initialData?.environmentalLicenseRequired || false,
            projectTags: initialData?.projectTags || [],
        },
    });

    async function onSubmit(data: any) {
        setIsLoading(true);
        setError("");

        try {
            let result;
            if (isEditing && initialData?.id) {
                result = await updateProject(initialData.id, data);
            } else {
                result = await createProject(data);
            }

            if (result.success) {
                if (isEditing) {
                    router.push(`/projects/${result.data?.id || initialData?.id}`);
                } else {
                    router.push('/dashboard/projects?view=kanban');
                }
                router.refresh();
            } else {
                setError(typeof result.error === 'string' ? result.error : "Erro de validação");
            }
        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro ao salvar o projeto.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    {error}
                </div>
            )}

            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex mb-4">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="architecture">Detalhes Arquitetônicos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Gerais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <Label>Imagem de Capa / Thumbnail</Label>
                                <ImageUpload
                                    // @ts-ignore
                                    value={form.watch("thumbnailUrl")}
                                    // @ts-ignore
                                    onChange={(url) => form.setValue("thumbnailUrl", url)}
                                    label="Upload Thumbnail"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Projeto</Label>
                                    <Input id="name" {...form.register("name")} />
                                    {form.formState.errors.name && <p className="text-sm text-destructive">{String(form.formState.errors.name.message)}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        onValueChange={(val: string) => form.setValue("status", val)}
                                        defaultValue={form.getValues("status")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLANNING">Planejamento</SelectItem>
                                            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                                            <SelectItem value="COMPLETED">Concluído</SelectItem>
                                            <SelectItem value="ON_HOLD">Pausado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="projectType">Tipo de Obra</Label>
                                    <Input id="projectType" {...form.register("projectType")} placeholder="Ex: Residencial Unifamiliar" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Endereço</Label>
                                    <Input id="address" {...form.register("address")} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Data de Início</Label>
                                    <Input type="date" id="startDate" {...form.register("startDate")} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimatedEndDate">Previsão de Entrega</Label>
                                    <Input type="date" id="estimatedEndDate" {...form.register("estimatedEndDate")} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="architecture">
                    <Card>
                        <CardHeader>
                            <CardTitle>Especificações Técnicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Estilo Arquitetônico</Label>
                                    <Select
                                        onValueChange={(val: string) => form.setValue("architecturalStyle", val as any)}
                                        defaultValue={form.getValues("architecturalStyle") || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o estilo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(ArchitecturalStyleEnum.enum).map((style) => (
                                                <SelectItem key={style} value={style}>{style}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tipo Construtivo</Label>
                                    <Select
                                        onValueChange={(val: string) => form.setValue("constructionType", val as any)}
                                        defaultValue={form.getValues("constructionType") || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(ConstructionTypeEnum.enum).map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="totalArea">Área Total (m²)</Label>
                                    <Input
                                        type="number"
                                        id="totalArea"
                                        {...form.register("totalArea", { valueAsNumber: true })}
                                        step="0.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plannedCost">Custo Estimado (R$)</Label>
                                    <Input
                                        type="number"
                                        id="plannedCost"
                                        {...form.register("plannedCost", { valueAsNumber: true })}
                                        step="0.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberOfFloors">Nº de Pavimentos</Label>
                                    <Input
                                        type="number"
                                        id="numberOfFloors"
                                        {...form.register("numberOfFloors", { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberOfRooms">Nº de Cômodos</Label>
                                    <Input
                                        type="number"
                                        id="numberOfRooms"
                                        {...form.register("numberOfRooms", { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hasBasement"
                                        checked={form.watch("hasBasement")}
                                        // @ts-ignore
                                        onCheckedChange={(checked) => form.setValue("hasBasement", checked === true)}
                                    />
                                    <Label htmlFor="hasBasement">Possui Subsolo?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hasGarage"
                                        checked={form.watch("hasGarage")}
                                        // @ts-ignore
                                        onCheckedChange={(checked) => form.setValue("hasGarage", checked === true)}
                                    />
                                    <Label htmlFor="hasGarage">Possui Garagem?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="environmentalLicenseRequired"
                                        checked={form.watch("environmentalLicenseRequired")}
                                        // @ts-ignore
                                        onCheckedChange={(checked) => form.setValue("environmentalLicenseRequired", checked === true)}
                                    />
                                    <Label htmlFor="environmentalLicenseRequired">Licença Ambiental?</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : isEditing ? "Atualizar Projeto" : "Criar Projeto"}
                </Button>
            </div>
        </form>
    );
}
