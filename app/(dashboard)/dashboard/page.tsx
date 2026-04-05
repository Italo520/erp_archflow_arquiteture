import { getDashboardMetrics } from "@/app/actions/dashboard";
import { getCurrentUser } from "@/app/actions/auth";
import { KPICard } from "@/components/dashboard/KPICard";
import { DeadlineAlerts } from "@/components/dashboard/DeadlineAlerts";
import { TodayActivities } from "@/components/dashboard/TodayActivities";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Briefcase, CheckCircle, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    const metrics = await getDashboardMetrics(user?.id);

    const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
    // Capitalize first letter of formatted date
    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    // Format currency
    const formattedRevenue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(metrics.kpi.monthlyRevenue);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-foreground">Dashboard</h2>
                    {/* Saudação personalizada could be "Olá, {user?.name}" if name available */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <p className="text-sm md:text-base">Bem-vindo de volta!</p>
                        <span>•</span>
                        <p className="capitalize text-sm md:text-base">{formattedDate}</p>
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total de Clientes"
                    value={metrics.kpi.totalClients}
                    icon={Users}
                    trendLabel="ativos na base"
                />
                <KPICard
                    title="Projetos Ativos"
                    value={metrics.kpi.activeProjects}
                    icon={Briefcase}
                    intent="positive"
                />
                <KPICard
                    title="Receita do Mês"
                    value={formattedRevenue}
                    icon={DollarSign}
                    intent="positive"
                    // trend={12} // Example trend
                    trendLabel="faturado (estimado)"
                />
                <KPICard
                    title="Concluídos (Total)"
                    value="-"
                    icon={CheckCircle}
                    trendLabel="essa semana"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">

                {/* Charts Section - Takes 4 cols on large screens (approx 60%) */}
                <div className="col-span-1 lg:col-span-4 min-w-0">
                    <DashboardCharts
                        productivityData={metrics.charts.productivity}
                        projectDistribution={metrics.charts.projectDistribution}
                    />
                </div>

                {/* Side Panel - Takes 3 cols on large screens (approx 40%) */}
                <div className="col-span-1 lg:col-span-3 min-w-0 space-y-4">
                    <div className="min-h-[300px] h-fit">
                        <DeadlineAlerts projects={metrics.lists.urgentProjects} />
                    </div>
                    <div className="min-h-[400px] h-fit">
                        <TodayActivities activities={metrics.lists.todaysAgenda} />
                    </div>
                </div>
            </div>
        </div>
    );
}
