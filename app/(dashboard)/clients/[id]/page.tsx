import { getClientById } from "@/app/actions/client";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
    Edit, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Calendar, 
    Clock, 
    DollarSign, 
    Briefcase, 
    Activity, 
    CheckCircle2, 
    User,
    Building2,
    CalendarDays,
    ArrowUpRight,
    Sparkles
} from "lucide-react";
import { DeleteClientButton } from "@/components/clients/DeleteClientButton";
import { ClientCategory, ContactPreference, ActivityStatus } from "@prisma/client";

// Formatação amigável para exibição
const formatDocumentDisplay = (doc?: string | null, type?: string | null) => {
    if (!doc) return "-";
    const clean = doc.replace(/\D/g, "");
    if (type === "PF" && clean.length === 11) {
        return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (type === "PJ" && clean.length === 14) {
        return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return doc;
};

const getCategoryBadge = (category: ClientCategory | null) => {
    if (!category) return null;
    const labels: Record<ClientCategory, { text: string; style: string }> = {
        RESIDENTIAL: { text: "Residencial", style: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50" },
        COMMERCIAL: { text: "Comercial", style: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50" },
        INSTITUTIONAL: { text: "Institucional", style: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50" },
        INDUSTRIAL: { text: "Industrial", style: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/50" },
        DESIGNER: { text: "Parceiro / Designer", style: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50" }
    };
    const details = labels[category];
    return <Badge variant="outline" className={`${details.style} rounded-lg px-2.5 py-0.5 font-medium`}>{details.text}</Badge>;
};

const getPreferenceBadge = (pref: ContactPreference | null) => {
    if (!pref) return "-";
    const labels: Record<ContactPreference, string> = {
        EMAIL: "E-mail",
        PHONE: "Telefone",
        WHATSAPP: "WhatsApp"
    };
    return labels[pref] || pref;
};

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClientById(id);

    if (!client) {
        notFound();
    }

    const timeLogs = client.timeLogs || [];
    const totalHours = timeLogs.reduce((sum: number, log: any) => sum + log.duration, 0);
    const billableLogs = timeLogs.filter((log: any) => log.billable);
    const billableHours = billableLogs.reduce((sum: number, log: any) => sum + log.duration, 0);
    const totalBilledValue = billableLogs.reduce((sum: number, log: any) => {
        const rate = log.billRate ? Number(log.billRate) : 0;
        return sum + (log.duration * rate);
    }, 0);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 w-full">
            {/* Header premium do CRM */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#151f28] p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary flex items-center justify-center">
                        {client.legalType === "PJ" ? (
                            <Building2 className="h-8 w-8" />
                        ) : (
                            <User className="h-8 w-8" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                {client.name}
                            </h1>
                            <Badge className={`rounded-xl px-3 py-1 font-bold ${
                                client.status === 'ACTIVE' 
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                    : client.status === 'PROSPECT'
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400'
                                    : 'bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-400'
                            }`}>
                                {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'PROSPECT' ? 'Prospect' : 'Inativo'}
                            </Badge>
                            {getCategoryBadge(client.category)}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                            <CalendarDays className="h-4 w-4" />
                            Cliente desde {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                            {client.lastInteractionAt && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                    <span>Última interação em {new Date(client.lastInteractionAt).toLocaleDateString("pt-BR")}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
                    <Button variant="outline" asChild className="rounded-xl flex-1 md:flex-none">
                        <Link href={`/clients/${client.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Dados
                        </Link>
                    </Button>
                    <DeleteClientButton clientId={client.id} clientName={client.name} />
                </div>
            </div>

            {/* Abas e Painéis */}
            <Tabs defaultValue="overview" className="w-full space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6 py-2">Visão Geral</TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-lg px-6 py-2">Projetos ({client._count.projects})</TabsTrigger>
                    <TabsTrigger value="activities" className="rounded-lg px-6 py-2">Atividades ({client.activities?.length || 0})</TabsTrigger>
                    <TabsTrigger value="finance" className="rounded-lg px-6 py-2">Apropriação & Finanças</TabsTrigger>
                </TabsList>

                {/* ABA 1: VISÃO GERAL */}
                <TabsContent value="overview" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Contatos */}
                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Informações de Contato</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {client.email && (
                                    <div className="flex items-center gap-3 border border-gray-50 dark:border-slate-800/50 p-3.5 rounded-xl hover:border-primary/30 transition-colors">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                        <div className="truncate">
                                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">E-mail Comercial</span>
                                            <a href={`mailto:${client.email}`} className="text-sm font-semibold text-primary hover:underline truncate">{client.email}</a>
                                        </div>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-3 border border-gray-50 dark:border-slate-800/50 p-3.5 rounded-xl">
                                        <Phone className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Telefone</span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{client.phone}</span>
                                        </div>
                                    </div>
                                )}
                                {client.website && (
                                    <div className="flex items-center gap-3 border border-gray-50 dark:border-slate-800/50 p-3.5 rounded-xl hover:border-primary/30 transition-colors">
                                        <Globe className="h-5 w-5 text-slate-400" />
                                        <div className="truncate">
                                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Website</span>
                                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{client.website}</a>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 border border-gray-50 dark:border-slate-800/50 p-3.5 rounded-xl">
                                    <Calendar className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">Preferência de Contato</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getPreferenceBadge(client.contactPreference)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dados Fiscais / Legais */}
                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Estrutura Fiscal / Legal</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800/50">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Tipo de Pessoa</span>
                                    <Badge variant="secondary" className="rounded-lg">{client.legalType === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800/50">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">{client.legalType === "PJ" ? "CNPJ" : "CPF"}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatDocumentDisplay(client.document, client.legalType)}</span>
                                </div>
                                {client.legalType === "PJ" && (
                                    <>
                                        <div className="flex flex-col py-2 border-b border-gray-50 dark:border-slate-800/50">
                                            <span className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Razão Social</span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{client.razaoSocial || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800/50">
                                            <span className="text-xs text-slate-400 font-semibold uppercase">Inscrição Estadual</span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{client.inscricaoEstadual || "-"}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Endereço */}
                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Endereço de Correspondência</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(client.address as any)?.street ? (
                                    <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Logradouro</span>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{(client.address as any).street}, {(client.address as any).number}</p>
                                            </div>
                                            {(client.address as any).complement && (
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Complemento</span>
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{(client.address as any).complement}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Bairro e CEP</span>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{(client.address as any).neighborhood} — CEP {(client.address as any).cep}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Cidade / UF</span>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{(client.address as any).city} — {(client.address as any).state}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">Nenhum endereço completo cadastrado para este cliente.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Observações */}
                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Observações Internas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                                    {client.notes || "Nenhuma observação interna arquivada."}
                                </p>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                {/* ABA 2: PROJETOS */}
                <TabsContent value="projects" className="outline-none">
                    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Projetos Relacionados</CardTitle>
                            <CardDescription>Portfólio de projetos e estágios operacionais associados a este cliente.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {client.projects && client.projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {client.projects.map((project: any) => (
                                        <div key={project.id} className="border border-gray-100 dark:border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:border-primary/20 transition-all group">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                                                    {project.name}
                                                </h4>
                                                <div className="flex gap-2 items-center text-xs text-slate-500">
                                                    <span className="font-medium">Tipo: {project.projectType || "Não especificado"}</span>
                                                    <span>•</span>
                                                    <span>Área: {project.totalArea ? `${project.totalArea} m²` : "-"}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild className="rounded-lg group-hover:bg-primary group-hover:text-background-dark font-bold gap-1 transition-all">
                                                <Link href={`/projects/${project.id}`}>
                                                    Acessar
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                                    <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum projeto registrado para este cliente.</p>
                                    <div className="mt-4">
                                        <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold shadow-lg shadow-primary/10">
                                            <Link href="/projects">Criar Projeto</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA 3: ATIVIDADES (AGENDA) */}
                <TabsContent value="activities" className="outline-none">
                    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Compromissos & Agenda</CardTitle>
                            <CardDescription>Visitas técnicas, reuniões, apresentações e contatos ativos com este cliente.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {client.activities && client.activities.length > 0 ? (
                                <div className="space-y-4">
                                    {client.activities.map((act: any) => {
                                        const typeLabels: Record<string, string> = {
                                            MEETING: "Reunião",
                                            CALL: "Ligação",
                                            EMAIL: "E-mail",
                                            SITE_VISIT: "Visita Técnica",
                                            DESIGN: "Projeto/Desenho",
                                            REVISION: "Revisão",
                                            APPROVAL: "Aprovação",
                                            ADMIN: "Administrativo",
                                            OTHER: "Outros"
                                        };

                                        return (
                                            <div key={act.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-50 dark:border-slate-800/80 rounded-2xl gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors bg-slate-50/20 dark:bg-slate-900/10">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                                                        act.status === "COMPLETED" 
                                                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                                                            : act.status === "CANCELLED"
                                                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                                                            : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                                                    }`}>
                                                        <Activity className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{act.title}</h4>
                                                            <Badge variant="outline" className="text-[10px] rounded-md font-medium">
                                                                {typeLabels[act.type] || act.type}
                                                            </Badge>
                                                            <Badge className={`text-[10px] rounded-md px-1.5 py-0 font-bold ${
                                                                act.status === "COMPLETED"
                                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-none"
                                                                    : act.status === "CANCELLED"
                                                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-none"
                                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-none"
                                                            }`}>
                                                                {act.status === "COMPLETED" ? "Concluído" : act.status === "CANCELLED" ? "Cancelado" : "Agendado"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{act.description || "Sem descrição registrada."}</p>
                                                        {act.location && (
                                                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{act.location}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-gray-100 dark:border-slate-800/80 font-semibold flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
                                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                                    <span>{new Date(act.startTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                                                    {act.duration && (
                                                        <>
                                                            <span className="text-slate-300 dark:text-slate-700">|</span>
                                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>{act.duration} min</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                                    <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum compromisso agendado para este cliente.</p>
                                    <div className="mt-4">
                                        <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold shadow-lg shadow-primary/10">
                                            <Link href="/activities">Agendar Atividade</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA 4: FINANÇAS E APROPRIAÇÃO DE HORAS (TIME TRACKING) */}
                <TabsContent value="finance" className="space-y-6 outline-none">
                    
                    {/* Painel Consolidado Premium */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-md bg-white dark:bg-[#151f28] p-5 flex flex-col justify-between hover:border-primary/40 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tempo Total Apropriado</span>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl text-[20px]"><Clock className="h-5 w-5" /></span>
                            </div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalHours.toFixed(1)} h</span>
                                <span className="text-xs text-slate-400 font-semibold mb-1">registradas</span>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-md bg-white dark:bg-[#151f28] p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Horas Faturáveis</span>
                                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-2 rounded-xl text-[20px]"><CheckCircle2 className="h-5 w-5" /></span>
                            </div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{billableHours.toFixed(1)} h</span>
                                <span className="text-xs text-slate-400 font-semibold mb-1">({totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%) faturáveis</span>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-md bg-white dark:bg-[#151f28] p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Faturamento Acumulado</span>
                                <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-xl text-[20px]"><DollarSign className="h-5 w-5" /></span>
                            </div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                                    {totalBilledValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold mb-1">estimado</span>
                            </div>
                        </Card>

                    </div>

                    {/* Tabela de Logs de Tempo */}
                    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Lançamentos de Tempo Recentes</CardTitle>
                            <CardDescription>Apropriação de esforço dedicada a projetos arquitetônicos deste cliente.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {timeLogs.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                                <th className="py-3.5 px-4 rounded-l-xl">Data</th>
                                                <th className="py-3.5 px-4">Projeto</th>
                                                <th className="py-3.5 px-4">Categoria</th>
                                                <th className="py-3.5 px-4 text-right">Duração</th>
                                                <th className="py-3.5 px-4 text-center">Faturável</th>
                                                <th className="py-3.5 px-4 text-right rounded-r-xl">Valor Estimado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                                            {timeLogs.map((log: any) => {
                                                const catLabels: Record<string, string> = {
                                                    DESIGN: "Desenho",
                                                    REVIEW: "Revisão",
                                                    MEETING: "Reunião",
                                                    ADMIN: "Administrativo",
                                                    DELIVERY: "Entrega",
                                                    OTHER: "Outros"
                                                };
                                                const rate = log.billRate ? Number(log.billRate) : 0;
                                                const val = log.billable ? (log.duration * rate) : 0;

                                                return (
                                                    <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                                                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                                            {new Date(log.date).toLocaleDateString("pt-BR")}
                                                        </td>
                                                        <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                                                            {log.project?.name || "Projeto Desconhecido"}
                                                        </td>
                                                        <td className="py-4 px-4 text-slate-500">
                                                            <Badge variant="outline" className="text-[11px] rounded-lg">
                                                                {catLabels[log.category] || log.category}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                                                            {log.duration.toFixed(1)} h
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            {log.billable ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 border-none font-bold rounded-lg text-[10px]">Sim</Badge>
                                                            ) : (
                                                                <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-950/30 dark:text-slate-400 border-none font-medium rounded-lg text-[10px]">Não</Badge>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                                                            {log.billable ? (
                                                                val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-slate-600">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                                    <Clock className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum log de tempo apropriado para este cliente.</p>
                                    <div className="mt-4">
                                        <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold shadow-lg shadow-primary/10">
                                            <Link href="/time-tracking">Apropriar Horas</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
