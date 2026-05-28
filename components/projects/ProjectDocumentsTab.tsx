"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    FileText,
    Trash2,
    ExternalLink,
    Upload,
    Download,
    Search,
    File,
    MoreHorizontal,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    CornerDownRight,
    MessageSquare,
    Eye,
    ChevronRight,
    Clock,
    Plus,
    X
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { uploadProjectDocument, deleteProjectDocument } from "@/app/actions/project";
import { 
    listDeliverables, 
    createDeliverable, 
    deleteDeliverable, 
    submitForReview, 
    reviewDeliverable, 
    submitNewVersion 
} from "@/app/actions/deliverable";
import { useRouter } from "next/navigation";
import { DeliverableStatus, DeliverableType } from "@prisma/client";

export default function ProjectDocumentsTab({ project }: { project: any }) {
    const router = useRouter();
    
    // Estados Compartilhados e de Navegação Interna
    const [subTab, setSubTab] = useState<"general" | "deliverables">("general");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // --- ESTADOS ABA 1: DOCUMENTOS GERAIS ---
    const [isAddingDoc, setIsAddingDoc] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const documents = (project.attachedDocuments as any[]) || [];
    
    // --- ESTADOS ABA 2: ENTREGÁVEIS TÉCNICOS ---
    const [deliverables, setDeliverables] = useState<any[]>([]);
    const [isAddingDeliverable, setIsAddingDeliverable] = useState(false);
    
    // Formulário de novo entregável
    const [delivName, setDelivName] = useState("");
    const [delivType, setDelivType] = useState<DeliverableType>(DeliverableType.DRAWING_2D);
    const [delivDescription, setDelivDescription] = useState("");
    const [delivFile, setDelivFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string>("");

    // Estado para envio de nova versão
    const [versionTargetDelivId, setVersionTargetDelivId] = useState<string | null>(null);
    const [versionFile, setVersionFile] = useState<File | null>(null);

    // Estado para modal de revisão
    const [reviewTargetDeliv, setReviewTargetDeliv] = useState<any | null>(null);
    const [reviewStatus, setReviewStatus] = useState<DeliverableStatus>(DeliverableStatus.APPROVED);
    const [reviewComment, setReviewComment] = useState("");

    // Carrega entregáveis técnicos ao carregar a página
    useEffect(() => {
        loadDeliverables();
    }, [project.id]);

    async function loadDeliverables() {
        try {
            const result = await listDeliverables(project.id);
            if (result.ok && result.data) {
                setDeliverables(result.data);
            }
        } catch (error) {
            console.error("Erro ao carregar entregáveis:", error);
        }
    }

    // --- FUNÇÕES DOCUMENTOS GERAIS ---
    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    async function handleAddDocument() {
        if (!fileName.trim() || !fileUrl.trim()) return;
        setIsLoading(true);
        try {
            await uploadProjectDocument(project.id, fileUrl, fileName);
            setFileName("");
            setFileUrl("");
            setIsAddingDoc(false);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteDoc(url: string) {
        if (!confirm("Tem certeza que deseja remover este documento?")) return;
        setIsLoading(true);
        try {
            await deleteProjectDocument(project.id, url);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // --- FUNÇÕES ENTREGÁVEIS TÉCNICOS ---
    const filteredDeliverables = deliverables.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Upload físico real via Route Handler
    async function performPhysicalUpload(fileToUpload: File): Promise<any> {
        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);

        setUploadProgress(10);
        const response = await fetch("/api/storage/upload", {
            method: "POST",
            body: uploadData,
        });
        setUploadProgress(70);
        
        const uploadResult = await response.json();
        setUploadProgress(100);
        
        if (!uploadResult.ok) {
            throw new Error(uploadResult.error || "Falha no upload do arquivo físico.");
        }
        
        setTimeout(() => setUploadProgress(null), 1000);
        return uploadResult.data;
    }

    // Criar entregável no banco
    async function handleCreateDeliverable() {
        if (!delivName.trim() || !delivFile) {
            alert("Preencha o nome e selecione o arquivo físico para upload.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Faz upload do arquivo físico no storage
            const uploadInfo = await performPhysicalUpload(delivFile);

            // 2. Associa com o estágio/tarefa do projeto se houver.
            // Para simplificar no MVP, se não houver tarefas no banco, criamos uma tarefa virtual ou usamos nulo
            const defaultTask = project.stages?.[0]?.tasks?.[0]?.id || "";
            const taskId = selectedTaskId || defaultTask;

            if (!taskId) {
                alert("Para criar um entregável, o projeto precisa de pelo menos uma tarefa ativa no Kanban.");
                setIsLoading(false);
                return;
            }

            // 3. Salva no banco de dados
            const result = await createDeliverable({
                name: delivName,
                type: delivType,
                description: delivDescription,
                fileUrl: uploadInfo.fileUrl,
                fileSize: uploadInfo.fileSize,
                mimeType: uploadInfo.mimeType,
                projectId: project.id,
                taskId: taskId,
                version: 1,
                status: DeliverableStatus.DRAFT,
            });

            if (result.ok) {
                setDelivName("");
                setDelivDescription("");
                setDelivFile(null);
                setIsAddingDeliverable(false);
                await loadDeliverables();
            } else {
                alert("Erro ao salvar entregável: " + (result.message || "Erro desconhecido"));
            }
        } catch (error: any) {
            console.error(error);
            alert("Falha no upload: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Deletar entregável
    async function handleDeleteDeliverable(id: string) {
        if (!confirm("Tem certeza que deseja excluir este entregável técnico?")) return;
        setIsLoading(true);
        try {
            const result = await deleteDeliverable(id);
            if (result.ok) {
                await loadDeliverables();
            } else {
                alert(result.message || "Erro ao deletar");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // Enviar para revisão formal do cliente
    async function handleSendForReview(id: string) {
        setIsLoading(true);
        try {
            const result = await submitForReview(id);
            if (result.ok) {
                await loadDeliverables();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // Salvar revisão de entregável
    async function handleSaveReview() {
        if (!reviewTargetDeliv) return;
        setIsLoading(true);
        try {
            const result = await reviewDeliverable(reviewTargetDeliv.id, reviewStatus, reviewComment);
            if (result.ok) {
                setReviewComment("");
                setReviewTargetDeliv(null);
                await loadDeliverables();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // Submeter nova versão física de entregável rejeitado
    async function handleSubmitVersion() {
        if (!versionTargetDelivId || !versionFile) return;
        setIsLoading(true);
        try {
            const uploadInfo = await performPhysicalUpload(versionFile);
            const result = await submitNewVersion(
                versionTargetDelivId,
                uploadInfo.fileUrl,
                uploadInfo.fileSize,
                uploadInfo.mimeType
            );

            if (result.ok) {
                setVersionTargetDelivId(null);
                setVersionFile(null);
                await loadDeliverables();
            } else {
                alert(result.message);
            }
        } catch (error: any) {
            console.error(error);
            alert("Erro no upload de nova revisão: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const getFileType = (name: string) => {
        const ext = name.split('.').pop()?.toUpperCase();
        return ext || "FILE";
    };

    const getStatusBadge = (status: DeliverableStatus) => {
        const config: Record<DeliverableStatus, { text: string; style: string }> = {
            DRAFT: { text: "Rascunho", style: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
            PENDING_REVIEW: { text: "Aguardando Revisão", style: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400" },
            APPROVED: { text: "Aprovado", style: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" },
            APPROVED_WITH_CHANGES: { text: "Ajustes Solicitados", style: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400" },
            REJECTED: { text: "Rejeitado", style: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400" },
            DELIVERED: { text: "Entregue", style: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400" }
        };
        const details = config[status];
        return <Badge className={`${details.style} border-none font-bold rounded-lg px-2.5 py-0.5 text-xs`}>{details.text}</Badge>;
    };

    return (
        <div className="space-y-6">
            
            {/* Header com botões de sub-aba premium */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                    <button 
                        onClick={() => setSubTab("general")} 
                        className={`flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                            subTab === "general" 
                                ? "bg-white dark:bg-[#151f28] text-primary shadow-sm" 
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        Anexos Gerais ({documents.length})
                    </button>
                    <button 
                        onClick={() => setSubTab("deliverables")} 
                        className={`flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                            subTab === "deliverables" 
                                ? "bg-white dark:bg-[#151f28] text-primary shadow-sm" 
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        Entregáveis Técnicos ({deliverables.length})
                    </button>
                </div>
                
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Buscar ${subTab === "general" ? "documentos" : "entregáveis"}...`}
                        className="pl-9 rounded-xl border-gray-200 dark:border-slate-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* ABA 1: DOCUMENTOS GERAIS */}
            {subTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Documentos & Links Rápidos</h3>
                            <Button onClick={() => setIsAddingDoc(!isAddingDoc)} variant={isAddingDoc ? "outline" : "default"} className="rounded-xl">
                                {isAddingDoc ? "Cancelar" : "Novo Documento"}
                            </Button>
                        </div>

                        {isAddingDoc && (
                            <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg">
                                <CardContent className="pt-6 grid gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Nome do Documento</label>
                                            <Input
                                                placeholder="ex: Contrato Arquitetônico Villa"
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                                className="rounded-xl border-gray-200 dark:border-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Link / URL do Arquivo</label>
                                            <Input
                                                placeholder="https://exemplo.com/doc.pdf"
                                                value={fileUrl}
                                                onChange={(e) => setFileUrl(e.target.value)}
                                                className="rounded-xl border-gray-200 dark:border-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleAddDocument} disabled={isLoading} className="w-full sm:w-auto ml-auto rounded-xl">
                                        Salvar Documento
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-card overflow-hidden shadow-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400">Nome</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400 hidden sm:table-cell">Tipo</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400 hidden md:table-cell">Data de Envio</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400 text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDocuments.map((doc, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b border-gray-50 dark:border-slate-800/50">
                                            <TableCell className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span className="line-clamp-1">{doc.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 hidden sm:table-cell">
                                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md font-bold uppercase">
                                                    {getFileType(doc.name)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 hidden md:table-cell text-slate-400 text-sm">
                                                {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("pt-BR") : "N/A"}
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl">
                                                            <DropdownMenuItem onClick={() => window.open(doc.url)} className="rounded-lg">
                                                                <Download className="h-4 w-4 mr-2" /> Download
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive rounded-lg" onClick={() => handleDeleteDoc(doc.url)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredDocuments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                Nenhum documento encontrado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-2 border-dashed border-primary/20 bg-primary/5 p-6 rounded-2xl text-center">
                            <CardContent className="p-0 flex flex-col items-center justify-center space-y-3">
                                <File className="h-8 w-8 text-primary" />
                                <p className="font-semibold text-sm">Links e Anexos Rápidos</p>
                                <p className="text-xs text-muted-foreground px-4">Esta aba armazena links rápidos de referência geral do projeto, como planilhas compartilhadas no Drive ou contratos.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* ABA 2: ENTREGÁVEIS TÉCNICOS */}
            {subTab === "deliverables" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Pranchas & Entregáveis de Engenharia
                            </h3>
                            <Button onClick={() => setIsAddingDeliverable(!isAddingDeliverable)} variant={isAddingDeliverable ? "outline" : "default"} className="rounded-xl">
                                {isAddingDeliverable ? "Cancelar" : "Novo Entregável"}
                            </Button>
                        </div>

                        {/* Dropzone Real e Form de Novo Entregável */}
                        {isAddingDeliverable && (
                            <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-300">
                                <CardContent className="pt-6 grid gap-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Nome do Entregável *</label>
                                            <Input
                                                placeholder="ex: Projeto Arquitetônico Final"
                                                value={delivName}
                                                onChange={(e) => setDelivName(e.target.value)}
                                                className="rounded-xl border-gray-200 dark:border-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Tipo de Entregável *</label>
                                            <Select 
                                                onValueChange={(val) => setDelivType(val as DeliverableType)} 
                                                defaultValue={delivType}
                                            >
                                                <SelectTrigger className="rounded-xl border-gray-200 dark:border-slate-700">
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-200 dark:border-slate-800">
                                                    <SelectItem value={DeliverableType.SKETCH}>Esboço (Sketch)</SelectItem>
                                                    <SelectItem value={DeliverableType.RENDER_3D}>Renderização 3D</SelectItem>
                                                    <SelectItem value={DeliverableType.DRAWING_2D}>Desenho Técnico 2D (CAD/BIM)</SelectItem>
                                                    <SelectItem value={DeliverableType.PDF}>Arquivo PDF</SelectItem>
                                                    <SelectItem value={DeliverableType.DOCUMENT}>Documento / Memorial</SelectItem>
                                                    <SelectItem value={DeliverableType.OTHER}>Outros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-500">Etapa do Kanban Associada *</label>
                                            <Select onValueChange={setSelectedTaskId}>
                                                <SelectTrigger className="rounded-xl border-gray-200 dark:border-slate-700">
                                                    <SelectValue placeholder="Selecione uma tarefa/etapa do Kanban" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-200 dark:border-slate-800">
                                                    {project.stages?.map((stage: any) => 
                                                        stage.tasks?.map((task: any) => (
                                                            <SelectItem key={task.id} value={task.id}>
                                                                {stage.name} ➔ {task.title}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-500">Descrição / Notas técnicas</label>
                                            <Input
                                                placeholder="Descreva detalhes específicos desta versão para auxiliar a revisão."
                                                value={delivDescription}
                                                onChange={(e) => setDelivDescription(e.target.value)}
                                                className="rounded-xl border-gray-200 dark:border-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Upload Físico Zone */}
                                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-primary/50 transition-colors p-6 rounded-2xl text-center relative cursor-pointer bg-slate-50/50 dark:bg-slate-900/10">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setDelivFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
                                        {delivFile ? (
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{delivFile.name}</p>
                                                <p className="text-xs text-slate-400 mt-1">{(delivFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-medium">Clique ou arraste o arquivo físico aqui</p>
                                                <p className="text-xs text-slate-400 mt-1">Formatos suportados: DWG, PDF, PNG, JPG, RVT, PLN (Max 15MB)</p>
                                            </div>
                                        )}
                                    </div>

                                    {uploadProgress !== null && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span>Fazendo upload...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button variant="outline" onClick={() => setIsAddingDeliverable(false)} className="rounded-xl">Cancelar</Button>
                                        <Button onClick={handleCreateDeliverable} disabled={isLoading} className="rounded-xl px-6 bg-primary hover:bg-primary/95 text-background-dark font-bold shadow-lg shadow-primary/20">
                                            Fazer Upload & Salvar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Listagem de Entregáveis */}
                        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-card overflow-hidden shadow-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400">Entregável</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400 text-center">Versão</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400">Status</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400 hidden sm:table-cell">Responsável</TableHead>
                                        <TableHead className="py-3 px-4 font-bold text-xs uppercase text-slate-400 text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDeliverables.map((deliv) => (
                                        <TableRow key={deliv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b border-gray-50 dark:border-slate-800/50">
                                            <TableCell className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                                <div className="flex items-start gap-2.5">
                                                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <span className="line-clamp-1">{deliv.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                                            {deliv.mimeType || "CAD / BIM"} • {(deliv.fileSize / (1024 * 1024)).toFixed(1)} MB
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-center font-bold">
                                                <Badge variant="outline" className="rounded-lg bg-slate-50 dark:bg-slate-800 font-bold">
                                                    v{deliv.version}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                {getStatusBadge(deliv.status)}
                                            </TableCell>
                                            <TableCell className="py-4 px-4 hidden sm:table-cell text-slate-500 font-medium text-sm">
                                                {deliv.createdBy?.fullName || "Profissional"}
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    
                                                    {/* Botões específicos por status */}
                                                    {deliv.status === "DRAFT" && (
                                                        <Button 
                                                            onClick={() => handleSendForReview(deliv.id)} 
                                                            size="sm" 
                                                            className="rounded-lg text-xs font-bold bg-primary hover:bg-primary/95 text-background-dark"
                                                            disabled={isLoading}
                                                        >
                                                            Enviar p/ Revisão
                                                        </Button>
                                                    )}

                                                    {deliv.status === "PENDING_REVIEW" && (
                                                        <Button 
                                                            onClick={() => {
                                                                setReviewTargetDeliv(deliv);
                                                                setReviewStatus(DeliverableStatus.APPROVED);
                                                            }} 
                                                            size="sm" 
                                                            variant="secondary"
                                                            className="rounded-lg text-xs font-bold gap-1"
                                                            disabled={isLoading}
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            Revisar
                                                        </Button>
                                                    )}

                                                    {(deliv.status === "REJECTED" || deliv.status === "APPROVED_WITH_CHANGES") && (
                                                        <Dialog open={versionTargetDelivId === deliv.id} onOpenChange={(open) => setVersionTargetDelivId(open ? deliv.id : null)}>
                                                            <DialogTrigger asChild>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    className="rounded-lg text-xs font-bold gap-1 border-primary/30 text-primary hover:bg-primary/5"
                                                                >
                                                                    <Upload className="h-3 w-3" />
                                                                    Nova Versão
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="rounded-2xl border-gray-200 dark:border-slate-800">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-xl font-bold">Enviar Nova Revisão</DialogTitle>
                                                                    <DialogDescription className="text-sm">
                                                                        Selecione o arquivo da nova revisão corrigida do entregável <strong className="text-slate-900 dark:text-slate-100">{deliv.name}</strong>. A versão será automaticamente incrementada para v{deliv.version + 1}.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4 py-4">
                                                                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 p-6 rounded-2xl text-center relative cursor-pointer">
                                                                        <input 
                                                                            type="file" 
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                            onChange={(e) => {
                                                                                if (e.target.files && e.target.files[0]) {
                                                                                    setVersionFile(e.target.files[0]);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                                                                        {versionFile ? (
                                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{versionFile.name}</p>
                                                                        ) : (
                                                                            <p className="text-xs text-slate-400">Arraste ou selecione a nova revisão física</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <DialogFooter className="gap-2">
                                                                    <Button variant="outline" className="rounded-xl" onClick={() => setVersionTargetDelivId(null)}>Cancelar</Button>
                                                                    <Button onClick={handleSubmitVersion} disabled={isLoading || !versionFile} className="rounded-xl px-6 bg-primary hover:bg-primary/95 text-background-dark font-bold">
                                                                        Submeter Revisão
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}

                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                                                        <a href={deliv.fileUrl}>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl">
                                                            <DropdownMenuItem onClick={() => {
                                                                setReviewTargetDeliv(deliv);
                                                                setReviewStatus(deliv.status);
                                                            }} className="rounded-lg">
                                                                <MessageSquare className="h-4 w-4 mr-2 text-slate-500" /> Ver Feedbacks
                                                            </DropdownMenuItem>
                                                            {deliv.status !== "APPROVED" && deliv.status !== "DELIVERED" && (
                                                                <DropdownMenuItem className="text-destructive rounded-lg" onClick={() => handleDeleteDeliverable(deliv.id)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredDeliverables.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                Nenhum entregável de prancha ou arquivo encontrado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-gray-100 dark:border-slate-800 shadow-md">
                            <CardContent className="p-5 space-y-4">
                                <h4 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Máquina de Estados & Regras
                                </h4>
                                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
                                    <div className="flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                        <p><strong>Rascunho (DRAFT)</strong>: Arquivo pode ser editado ou excluído. Envie para revisão ao concluir.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                        <p><strong>Aguardando Revisão</strong>: Travado para edição do arquiteto, aguardando aprovação do cliente.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <p><strong>Aprovado (APPROVED)</strong>: Travado permanentemente contra modificação, alteração ou exclusão física.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                        <p><strong>Rejeitado / Ajustes</strong>: O arquiteto pode fazer correções e enviar a nova revisão incrementando a versão.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* MODAL DE REVISÃO E HISTÓRICO DE FEEDBACKS */}
            {reviewTargetDeliv && (
                <Dialog open={!!reviewTargetDeliv} onOpenChange={(open) => { if (!open) setReviewTargetDeliv(null); }}>
                    <DialogContent className="max-w-2xl rounded-2xl border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Histórico & Revisão Técnica
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Entregável: <strong className="text-slate-900 dark:text-slate-100">{reviewTargetDeliv.name} (v{reviewTargetDeliv.version})</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Linha do Tempo Histórica */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Linha do Tempo de Interações</h4>
                                <div className="space-y-4 max-h-[250px] overflow-y-auto border border-gray-50 dark:border-slate-850 p-4 rounded-xl">
                                    {reviewTargetDeliv.reviewComments && (reviewTargetDeliv.reviewComments as any[]).length > 0 ? (
                                        (reviewTargetDeliv.reviewComments as any[]).map((rev: any, idx: number) => (
                                            <div key={rev.id || idx} className="flex gap-3 text-sm items-start pb-4 border-b border-gray-50 dark:border-slate-800 last:border-b-0">
                                                <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                                    rev.status === "APPROVED" 
                                                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                                                        : rev.status === "REJECTED"
                                                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                                                        : "bg-slate-50 dark:bg-slate-900/50 text-slate-500"
                                                }`}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex justify-between items-center flex-wrap gap-1">
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{rev.userName}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold">
                                                            {new Date(rev.createdAt).toLocaleDateString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-xs font-semibold text-slate-400">Ação:</span>
                                                        {getStatusBadge(rev.status)}
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-1">{rev.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 text-center py-4">Nenhuma interação ou feedback registrado para este entregável técnico.</p>
                                    )}
                                </div>
                            </div>

                            {/* Formulário de Novo Feedback (Somente se PENDING_REVIEW) */}
                            {reviewTargetDeliv.status === "PENDING_REVIEW" ? (
                                <div className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Avaliar Entregável</h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Button 
                                            type="button" 
                                            variant={reviewStatus === DeliverableStatus.APPROVED ? "default" : "outline"} 
                                            onClick={() => setReviewStatus(DeliverableStatus.APPROVED)}
                                            className={`rounded-xl font-bold ${
                                                reviewStatus === DeliverableStatus.APPROVED 
                                                    ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-500/10" 
                                                    : ""
                                            }`}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant={reviewStatus === DeliverableStatus.APPROVED_WITH_CHANGES ? "default" : "outline"} 
                                            onClick={() => setReviewStatus(DeliverableStatus.APPROVED_WITH_CHANGES)}
                                            className={`rounded-xl font-bold ${
                                                reviewStatus === DeliverableStatus.APPROVED_WITH_CHANGES 
                                                    ? "bg-amber-500 hover:bg-amber-500 text-white shadow-amber-500/10" 
                                                    : ""
                                            }`}
                                        >
                                            <Clock className="h-4 w-4 mr-2" /> Solicitar Ajustes
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant={reviewStatus === DeliverableStatus.REJECTED ? "default" : "outline"} 
                                            onClick={() => setReviewStatus(DeliverableStatus.REJECTED)}
                                            className={`rounded-xl font-bold ${
                                                reviewStatus === DeliverableStatus.REJECTED 
                                                    ? "bg-rose-600 hover:bg-rose-600 text-white shadow-rose-500/10" 
                                                    : ""
                                            }`}
                                        >
                                            <AlertCircle className="h-4 w-4 mr-2" /> Rejeitar
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Comentário de Avaliação *</label>
                                        <Input 
                                            placeholder="Descreva as correções exigidas ou notas sobre a aprovação..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            className="rounded-xl border-gray-200 dark:border-slate-700 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-800 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Este entregável técnico está em status de <strong>{reviewTargetDeliv.status}</strong> e não aguarda avaliações de revisão ativa.</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                            <Button variant="outline" className="rounded-xl" onClick={() => setReviewTargetDeliv(null)}>Fechar</Button>
                            {reviewTargetDeliv.status === "PENDING_REVIEW" && (
                                <Button 
                                    onClick={handleSaveReview} 
                                    disabled={isLoading || !reviewComment.trim()} 
                                    className="rounded-xl px-6 bg-primary hover:bg-primary/95 text-background-dark font-bold shadow-lg shadow-primary/10"
                                >
                                    Gravar Revisão
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}
