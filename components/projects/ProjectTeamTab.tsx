"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { listUsers } from "@/app/actions/user";
import { associateArchitect, removeArchitect } from "@/app/actions/project";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Mail,
    Phone,
    UserPlus,
    MoreHorizontal,
    Shield,
    ExternalLink,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ProjectTeamTab({ project }: { project: any }) {
    const router = useRouter();
    
    // Map architects from project.members
    const architects = useMemo(() => project.members?.map((m: any) => ({
        id: m.user.id,
        fullName: m.user.fullName,
        email: m.user.email,
        role: m.role,
        avatarUrl: m.user.avatarUrl
    })) || [], [project.members]);
    
    const client = project.client;

    // States for Add Member modal
    const [openAddModal, setOpenAddModal] = useState(false);
    const [systemUsers, setSystemUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedRole, setSelectedRole] = useState("VIEWER");
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch system users when modal opens
    useEffect(() => {
        if (openAddModal && systemUsers.length === 0) {
            const fetchUsers = async () => {
                setIsLoadingUsers(true);
                try {
                    const res = await listUsers();
                    if (res.success && res.data) {
                        // Filter out users who are already in the project
                        const existingIds = new Set(architects.map((a: any) => a.id));
                        const filtered = res.data.filter((u: any) => !existingIds.has(u.id));
                        setSystemUsers(filtered);
                    } else {
                        toast.error("Erro ao carregar usuários");
                    }
                } catch (err) {
                    toast.error("Falha ao carregar usuários");
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [openAddModal, systemUsers.length, architects]);

    const handleAddMember = async () => {
        if (!selectedUserId) {
            toast.error("Selecione um membro");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await associateArchitect(project.id, selectedUserId, selectedRole);
            if (res.success) {
                toast.success("Membro adicionado com sucesso!");
                setOpenAddModal(false);
                setSelectedUserId("");
                setSelectedRole("VIEWER");
                setSystemUsers([]); // Reset list to trigger refetch
                router.refresh();
            } else {
                toast.error(res.message || "Erro ao adicionar membro");
            }
        } catch (err) {
            toast.error("Falha ao adicionar membro");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Deseja realmente remover este membro do projeto?")) return;
        try {
            const res = await removeArchitect(project.id, userId);
            if (res.success) {
                toast.success("Membro removido do projeto");
                setSystemUsers([]); // Reset list to trigger refetch
                router.refresh();
            } else {
                toast.error(res.message || "Erro ao remover membro");
            }
        } catch (err) {
            toast.error("Falha ao remover membro");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "OWNER":
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-none">Proprietário</Badge>;
            case "EDITOR":
                return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 border-none">Editor</Badge>;
            case "VIEWER":
            default:
                return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/10 border-none">Leitor</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Equipe do Projeto</h3>
                <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar Membro
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Membro</label>
                                {isLoadingUsers ? (
                                    <div className="flex items-center text-sm text-muted-foreground gap-2 h-10 px-3 border rounded-md bg-muted/20">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        Carregando usuários...
                                    </div>
                                ) : (
                                    <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um usuário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {systemUsers.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    Nenhum usuário disponível
                                                </div>
                                            ) : (
                                                systemUsers.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>
                                                        {u.fullName} ({u.email})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Função</label>
                                <Select onValueChange={setSelectedRole} value={selectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OWNER">Proprietário (Owner)</SelectItem>
                                        <SelectItem value="EDITOR">Editor (Editor)</SelectItem>
                                        <SelectItem value="VIEWER">Leitor (Viewer)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end pt-4 gap-2">
                                <Button variant="outline" onClick={() => setOpenAddModal(false)}>Cancelar</Button>
                                <Button onClick={handleAddMember} disabled={isSubmitting || !selectedUserId}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Internos</h4>
                    <div className="grid gap-4">
                        {architects.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic pl-1">Nenhum membro interno vinculado ao projeto.</p>
                        ) : (
                            architects.map((arc: any) => (
                                <Card key={arc.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-primary/10">
                                                    <AvatarImage src={arc.avatarUrl} />
                                                    <AvatarFallback className="bg-primary/5 text-primary">
                                                        {arc.fullName?.substring(0, 2).toUpperCase() || 'AR'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="font-semibold text-sm">{arc.fullName}</h5>
                                                        {getRoleBadge(arc.role)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{arc.email}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => alert(`Simular email para: ${arc.email}`)}><Mail className="h-4 w-4 mr-2" /> Enviar Email</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(arc.id)}>Remover do Projeto</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] gap-1">
                                                <Shield className="h-3 w-3" /> Ver Permissões
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stakeholders</h4>
                    <div className="grid gap-4">
                        {client && (
                            <Card className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
                                                    {client.name?.charAt(0) || 'C'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-semibold text-sm">{client.name}</h5>
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Cliente</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{client.email}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                            <a href={`/crm/clients/${client.id}`}>
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <Button variant="secondary" size="sm" className="h-8 gap-2 text-xs">
                                            <Mail className="h-3.5 w-3.5" /> Email
                                        </Button>
                                        <Button variant="secondary" size="sm" className="h-8 gap-2 text-xs">
                                            <Phone className="h-3.5 w-3.5" /> Contato
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-dashed border-2 bg-muted/5">
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <h5 className="text-sm font-medium">Parceiros e Fornecedores</h5>
                                <p className="text-[10px] text-muted-foreground mt-1 px-4">
                                    Vincule construtoras, engenheiros e fornecedores a este projeto.
                                </p>
                                <Button variant="link" size="sm" className="text-xs mt-2">Vincular Agora</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
