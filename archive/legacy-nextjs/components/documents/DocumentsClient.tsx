'use client';

import React, { useState, useMemo, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import {
    Search,
    Upload,
    Grid3X3,
    List,
    FileText,
    Image,
    Video,
    FileArchive,
    File,
    MoreVertical,
    Download,
    Trash2,
    ExternalLink,
    Filter,
    FolderOpen,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    Plus,
    Loader2,
    Archive,
    ArchiveRestore,
    Info,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteDeliverable, archiveDeliverable, restoreDeliverable } from '@/app/actions/deliverable';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ── Types ────────────────────────────────────────────────────────────────────

interface Deliverable {
    id: string;
    name: string;
    type: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    version: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    description: string | null;
    project: { id: string; name: string };
    task: { id: string; title: string } | null;
    createdBy: { id: string; fullName: string };
    metadata?: any;
}

interface DocumentsClientProps {
    deliverables: Deliverable[];
    projects: { id: string; name: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    SKETCH: 'Sketch',
    RENDER_3D: 'Render 3D',
    DRAWING_2D: 'Desenho 2D',
    DOCUMENT: 'Documento',
    PDF: 'PDF',
    VIDEO: 'Vídeo',
    PHOTO: 'Foto',
    OTHER: 'Outro',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; tooltip: string }> = {
    DRAFT: { label: 'Rascunho', color: 'text-gray-500 bg-gray-100', icon: Clock, tooltip: 'Documento em edição. Envie para revisão quando estiver pronto.' },
    PENDING_REVIEW: { label: 'Em Revisão', color: 'text-yellow-600 bg-yellow-50', icon: AlertCircle, tooltip: 'Aguardando aprovação de um membro do projeto (OWNER ou EDITOR).' },
    APPROVED: { label: 'Aprovado', color: 'text-green-600 bg-green-50', icon: CheckCircle, tooltip: 'Aprovado por um membro do projeto via fluxo de revisão.' },
    APPROVED_WITH_CHANGES: { label: 'Aprovado c/ alterações', color: 'text-blue-600 bg-blue-50', icon: CheckCircle, tooltip: 'Aprovado com ressalvas. Verifique os comentários de revisão.' },
    REJECTED: { label: 'Rejeitado', color: 'text-destructive bg-destructive/10', icon: XCircle, tooltip: 'Documento rejeitado pelo cliente.' },
    DELIVERED: { label: 'Entregue', color: 'text-primary bg-primary/10', icon: CheckCircle, tooltip: 'Documento entregue formalmente ao cliente.' },
};

// Mapa estático de ícones — declarado fora de qualquer componente
// para satisfazer a regra react-hooks/static-components do React Compiler
const FILE_ICON_MAP: Record<string, React.ElementType> = {
    PHOTO: Image,
    VIDEO: Video,
    PDF: FileText,
    DOCUMENT: FileText,
    SKETCH: FileText,
    RENDER_3D: FileText,
    DRAWING_2D: FileText,
    OTHER: File,
};

function getFileIconComponent(type: string, mimeType: string | null): React.ElementType {
    if (type === 'PHOTO' || mimeType?.startsWith('image/')) return Image;
    if (type === 'VIDEO' || mimeType?.startsWith('video/')) return Video;
    if (type === 'PDF' || mimeType === 'application/pdf') return FileText;
    if (type === 'DOCUMENT') return FileText;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return FileArchive;
    return FILE_ICON_MAP[type] ?? File;
}

// Usa React.createElement para evitar a regra static-components do React Compiler
// que proíbe `const Comp = fn(); return <Comp />;` dentro de render
const CardFileIcon = ({ type, mimeType }: { type: string; mimeType: string | null }) =>
    React.createElement(getFileIconComponent(type, mimeType), { className: 'h-14 w-14 text-muted-foreground/30' });

const RowFileIcon = ({ type, mimeType }: { type: string; mimeType: string | null }) =>
    React.createElement(getFileIconComponent(type, mimeType), { className: 'h-4 w-4 text-muted-foreground' });


function formatFileSize(bytes: number | null): string {
    if (!bytes) return '–';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Upload Modal ──────────────────────────────────────────────────────────────

function UploadModal({
    open,
    onOpenChange,
    projects,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    projects: { id: string; name: string }[];
    onSuccess: () => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [projectId, setProjectId] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('DOCUMENT');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setSelectedFile(f);
        if (!name) setName(f.name.replace(/\.[^/.]+$/, ''));
        // Determine type from mime
        if (f.type.startsWith('image/')) setType('PHOTO');
        else if (f.type.startsWith('video/')) setType('VIDEO');
        else if (f.type === 'application/pdf') setType('PDF');
        else setType('DOCUMENT');
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!projectId) { toast.error('Selecione um projeto'); return; }
        if (!fileUrl && !selectedFile) { toast.error('Insira a URL do arquivo ou selecione um arquivo'); return; }
        if (!name.trim()) { toast.error('Informe o nome do documento'); return; }

        // Para upload real via Supabase Storage seria necessário um server action com signed URL.
        // Por ora, se o usuário colou uma URL direta, usamos ela; se selecionou arquivo local,
        // usamos um object URL temporário (demonstração — em produção, fazer upload para Supabase).
        const resolvedUrl = fileUrl || (selectedFile ? URL.createObjectURL(selectedFile) : '');

        startTransition(async () => {
            try {
                // Buscar uma task do projeto para vincular (obrigatório no schema)
                const res = await fetch(`/api/projects/${projectId}/tasks/first`);
                if (!res.ok) throw new Error('Nenhuma tarefa encontrada no projeto selecionado. Crie uma tarefa antes de adicionar documentos.');
                const { taskId } = await res.json();

                const { createDeliverable } = await import('@/app/actions/deliverable');
                const result = await createDeliverable({
                    name: name.trim(),
                    type: type as any,
                    fileUrl: resolvedUrl,
                    fileSize: selectedFile?.size ?? null,
                    mimeType: selectedFile?.type ?? null,
                    projectId,
                    taskId,
                    tags: [],
                    description: null,
                    dueDates: [],
                    version: 1,
                    status: 'DRAFT' as any,
                });

                if (result.ok) {
                    toast.success('Documento adicionado com sucesso!');
                    onSuccess();
                    onOpenChange(false);
                    setSelectedFile(null);
                    setFileUrl('');
                    setName('');
                    setProjectId('');
                } else {
                    toast.error(result.message ?? 'Erro ao adicionar documento');
                }
            } catch (err: any) {
                toast.error(err.message ?? 'Erro ao adicionar documento');
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Documento</DialogTitle>
                    <DialogDescription>
                        Vincule um documento a um projeto. Cole uma URL ou selecione um arquivo local.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label>Nome do documento *</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Planta Baixa Rev03"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Projeto *</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um projeto" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>URL do arquivo</Label>
                        <Input
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="https://... ou selecione abaixo"
                            type="url"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Ou selecione um arquivo local</Label>
                        <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="*/*"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {selectedFile ? selectedFile.name : 'Selecionar arquivo'}
                        </Button>
                        {selectedFile && (
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Adicionar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Action Confirm Dialog ────────────────────────────────────────────────────

function ConfirmActionDialog({
    doc,
    action,
    open,
    onOpenChange,
    onConfirm,
    isPending,
}: {
    doc: Deliverable | null;
    action: 'archive' | 'delete';
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
}) {
    if (!doc) return null;
    const status = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.DRAFT;
    const isArchive = action === 'archive';
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isArchive ? <Archive className="h-5 w-5 text-destructive" /> : <Trash2 className="h-5 w-5 text-destructive" />}
                        {isArchive ? 'Excluir documento' : 'Excluir definitivamente'}
                    </DialogTitle>
                    <DialogDescription>
                        {isArchive 
                            ? 'O documento será movido para a lixeira. Esta ação pode ser revertida.' 
                            : 'O documento será removido deste projeto, mas continuará registrado no banco de dados. Esta ação ocultará o documento permanentemente.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-3 space-y-2">
                    <div className="bg-secondary/50 rounded-lg p-3 flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.project.name}</p>
                            <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1', status.color)}>
                                <status.icon className="h-2.5 w-2.5" />
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isArchive ? <Archive className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />)}
                        {isArchive ? 'Excluir' : 'Excluir definitivamente'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function DocumentCard({
    doc,
    isTrash,
    onAction,
}: {
    doc: Deliverable;
    isTrash: boolean;
    onAction: (doc: Deliverable, action: 'archive' | 'delete' | 'restore') => void;
}) {
    const status = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.DRAFT;
    const StatusIcon = status.icon;

    const isImage = doc.type === 'PHOTO' || doc.mimeType?.startsWith('image/');
    const formattedDate = format(new Date(doc.updatedAt), "d 'de' MMM, yyyy", { locale: ptBR });

    return (
        <div className={cn("group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200", isTrash && "opacity-80 grayscale-[20%]")}>
            {/* Preview area */}
            <div className="relative h-36 bg-muted/50 flex items-center justify-center overflow-hidden">
                {isImage && doc.fileUrl && !doc.fileUrl.startsWith('blob:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={doc.fileUrl}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <CardFileIcon type={doc.type} mimeType={doc.mimeType} />
                )}

                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        title="Abrir"
                    >
                        <Eye className="h-4 w-4 text-foreground" />
                    </a>
                    <a
                        href={doc.fileUrl}
                        download={doc.name}
                        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        title="Baixar"
                    >
                        <Download className="h-4 w-4 text-foreground" />
                    </a>
                </div>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-foreground truncate leading-tight" title={doc.name}>
                            {doc.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {doc.project.name}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0">
                                <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Abrir
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={doc.fileUrl} download={doc.name} className="cursor-pointer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!isTrash ? (
                                <DropdownMenuItem
                                    onClick={() => onAction(doc, 'archive')}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    <DropdownMenuItem onClick={() => onAction(doc, 'restore')} className="cursor-pointer">
                                        <ArchiveRestore className="mr-2 h-4 w-4" />
                                        Restaurar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction(doc, 'delete')} className="text-destructive focus:text-destructive cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir Definitivamente
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full cursor-help', status.color)}>
                                    <StatusIcon className="h-2.5 w-2.5" />
                                    {status.label}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                                <p>{status.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[doc.type] ?? doc.type}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-2 mt-auto">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}

// ── Document Row (list view) ──────────────────────────────────────────────────

function DocumentRow({
    doc,
    isTrash,
    onAction,
}: {
    doc: Deliverable;
    isTrash: boolean;
    onAction: (doc: Deliverable, action: 'archive' | 'delete' | 'restore') => void;
}) {
    const status = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.DRAFT;
    const StatusIcon = status.icon;
    const formattedDate = format(new Date(doc.updatedAt), "d MMM yyyy", { locale: ptBR });

    return (
        <div className={cn("flex items-center gap-4 px-4 py-3 hover:bg-secondary/40 rounded-lg transition-colors group", isTrash && "opacity-80")}>
            <div className="flex-shrink-0 size-9 rounded-lg bg-muted/60 flex items-center justify-center">
                <RowFileIcon type={doc.type} mimeType={doc.mimeType} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground truncate">{doc.project.name}{doc.task ? ` · ${doc.task.title}` : ''}</p>
            </div>

            <span className="hidden sm:block text-xs text-muted-foreground w-20 text-right">{TYPE_LABELS[doc.type] ?? doc.type}</span>

            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className={cn('hidden md:inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full cursor-help', status.color)}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {status.label}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[220px] text-xs">
                        <p>{status.tooltip}</p>
                        {doc.status === 'APPROVED' && (
                            <p className="mt-1 flex items-center gap-1 text-green-600 font-medium">
                                <UserCheck className="h-3 w-3" />
                                Aprovação feita via página do projeto
                            </p>
                        )}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <span className="hidden lg:block text-xs text-muted-foreground w-14 text-right">{formatFileSize(doc.fileSize)}</span>

            <span className="hidden lg:block text-xs text-muted-foreground w-24 text-right">{formattedDate}</span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                </a>
                <a
                    href={doc.fileUrl}
                    download={doc.name}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Download className="h-3.5 w-3.5" />
                </a>
                {!isTrash ? (
                    <button
                        onClick={() => onAction(doc, 'archive')}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Excluir documento"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => onAction(doc, 'restore')}
                            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Restaurar documento"
                        >
                            <ArchiveRestore className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onAction(doc, 'delete')}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Excluir Definitivamente"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onUpload }: { onUpload?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
                <FolderOpen className="size-9 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum documento encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                {onUpload ? 'Adicione documentos vinculados aos seus projetos para começar a organizar sua documentação.' : 'Não há documentos aqui no momento.'}
            </p>
            {onUpload && (
                <Button onClick={onUpload}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar documento
                </Button>
            )}
        </div>
    );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export function DocumentsClient({ deliverables: initial, projects }: DocumentsClientProps) {
    const [deliverables, setDeliverables] = useState(initial);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [showTrash, setShowTrash] = useState(false);
    const [actionDoc, setActionDoc] = useState<{ doc: Deliverable, action: 'archive' | 'delete' } | null>(null);

    // Derived stats
    const stats = useMemo(() => {
        const activeDocs = deliverables.filter(d => d.metadata?.isArchived !== true);
        const total = activeDocs.length;
        const approved = activeDocs.filter((d) => d.status === 'APPROVED' || d.status === 'DELIVERED').length;
        const pending = activeDocs.filter((d) => d.status === 'PENDING_REVIEW').length;
        const totalSize = activeDocs.reduce((s, d) => s + (d.fileSize ?? 0), 0);
        return { total, approved, pending, totalSize };
    }, [deliverables]);

    // Filtered list
    const filtered = useMemo(() => {
        return deliverables.filter((d) => {
            const isArchived = d.metadata?.isArchived === true;
            if (showTrash && !isArchived) return false;
            if (!showTrash && isArchived) return false;

            const matchSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase()) ||
                d.project.name.toLowerCase().includes(search.toLowerCase());
            const matchType = typeFilter === 'ALL' || d.type === typeFilter;
            const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
            const matchProject = projectFilter === 'ALL' || d.project.id === projectFilter;
            return matchSearch && matchType && matchStatus && matchProject;
        });
    }, [deliverables, search, typeFilter, statusFilter, projectFilter, showTrash]);

    function handleAction(doc: Deliverable, action: 'archive' | 'delete' | 'restore') {
        if (action === 'restore') {
            startTransition(async () => {
                const result = await restoreDeliverable(doc.id);
                if (result.ok) {
                    setDeliverables((prev) => prev.map((d) => d.id === doc.id ? { ...d, metadata: { ...d.metadata, isArchived: false } } : d));
                    toast.success('Documento restaurado');
                } else {
                    toast.error(result.message ?? 'Erro ao restaurar');
                }
            });
            return;
        }
        setActionDoc({ doc, action });
    }

    function confirmAction() {
        if (!actionDoc) return;
        startTransition(async () => {
            const { doc, action } = actionDoc;
            if (action === 'archive') {
                const result = await archiveDeliverable(doc.id);
                if (result.ok) {
                    setDeliverables((prev) => prev.map((d) => d.id === doc.id ? { ...d, metadata: { ...d.metadata, isArchived: true } } : d));
                    toast.success('Documento enviado para a lixeira');
                } else {
                    toast.error(result.message ?? 'Erro ao excluir');
                }
            } else if (action === 'delete') {
                const result = await deleteDeliverable(doc.id);
                if (result.ok) {
                    setDeliverables((prev) => prev.filter((d) => d.id !== doc.id));
                    toast.success('Documento excluído definitivamente');
                } else {
                    toast.error(result.message ?? 'Erro ao excluir');
                }
            }
            setActionDoc(null);
        });
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Documentos {showTrash && <span className="text-muted-foreground text-xl font-medium">(Lixeira)</span>}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {showTrash ? 'Documentos arquivados' : 'Gerencie entregáveis e arquivos de todos os projetos'}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant={showTrash ? "default" : "outline"} onClick={() => setShowTrash(!showTrash)}>
                        {showTrash ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                        {showTrash ? 'Voltar aos Documentos' : 'Acessar Lixeira'}
                    </Button>
                    {!showTrash && (
                        <Button onClick={() => setUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total de arquivos', value: stats.total, color: 'text-foreground' },
                    { label: 'Aprovados/Entregues', value: stats.approved, color: 'text-green-600' },
                    { label: 'Em revisão', value: stats.pending, color: 'text-yellow-600' },
                    { label: 'Tamanho total', value: formatFileSize(stats.totalSize), color: 'text-primary' },
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className={cn('text-xl font-bold mt-1', s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar documentos..."
                        className="pl-9 h-9"
                    />
                </div>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="h-9 w-[180px]">
                        <SelectValue placeholder="Todos os projetos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os projetos</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os tipos</SelectItem>
                        {Object.entries(TYPE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os status</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-1 ml-auto">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                    >
                        <Grid3X3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                    >
                        <List className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Results label */}
            {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || projectFilter !== 'ALL') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>{filtered.length} documento(s) encontrado(s)</span>
                    <button
                        onClick={() => { setSearch(''); setTypeFilter('ALL'); setStatusFilter('ALL'); setProjectFilter('ALL'); }}
                        className="text-primary hover:underline text-xs ml-1"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}

            {/* Content */}
            {filtered.length === 0 ? (
                <EmptyState onUpload={showTrash ? undefined : () => setUploadOpen(true)} />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} isTrash={showTrash} onAction={handleAction} />
                    ))}
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* List header */}
                    <div className="grid grid-cols-1 px-4 py-2.5 border-b border-border bg-secondary/30">
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            <span className="flex-1">Nome</span>
                            <span className="hidden sm:block w-20 text-right">Tipo</span>
                            <span className="hidden md:block w-28">Status</span>
                            <span className="hidden lg:block w-14 text-right">Tamanho</span>
                            <span className="hidden lg:block w-24 text-right">Atualizado</span>
                            <span className="w-20 text-right">Ações</span>
                        </div>
                    </div>
                    <div className="divide-y divide-border/50">
                        {filtered.map((doc) => (
                            <DocumentRow key={doc.id} doc={doc} isTrash={showTrash} onAction={handleAction} />
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            <UploadModal
                open={uploadOpen}
                onOpenChange={setUploadOpen}
                projects={projects}
                onSuccess={() => window.location.reload()}
            />

            {/* Archive Confirm Dialog */}
            <ConfirmActionDialog
                doc={actionDoc?.doc || null}
                action={actionDoc?.action || 'archive'}
                open={!!actionDoc}
                onOpenChange={(v) => { if (!v) setActionDoc(null); }}
                onConfirm={confirmAction}
                isPending={isPending}
            />
        </div>
    );
}
