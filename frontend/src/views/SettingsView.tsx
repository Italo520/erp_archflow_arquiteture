import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sun, Moon, Laptop, Palette, Bell, Shield, Building, User } from "lucide-react";

export function SettingsView() {
  const { theme, setTheme, palette, setPalette } = useTheme();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalize a aparência, notificações e preferências da organização ArchFlow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aparência & Tema */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <CardTitle>Aparência & Identidade Visual</CardTitle>
            </div>
            <CardDescription>
              Alterne entre o tema Claro, Escuro e escolha a paleta de cores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modo Claro / Escuro / Sistema */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                Modo de Exibição
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2 h-10"
                >
                  <Sun className="size-4 text-amber-500" />
                  Claro
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2 h-10"
                >
                  <Moon className="size-4 text-primary" />
                  Escuro
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2 h-10"
                >
                  <Laptop className="size-4" />
                  Sistema
                </Button>
              </div>
            </div>

            {/* Seletor de Paleta */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                Paleta de Cores
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPalette("blue")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    palette === "blue"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="size-5 rounded-full bg-[#1677ff] border border-white/20 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Azul Ant Design</div>
                    <div className="text-xs text-muted-foreground">Original Legado</div>
                  </div>
                </div>

                <div
                  onClick={() => setPalette("sage")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    palette === "sage"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="size-5 rounded-full bg-[#9EB7A8] border border-white/20 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Verde Sálvia</div>
                    <div className="text-xs text-muted-foreground">Estilo Arquitetônico</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perfil do Escritório */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="size-5 text-primary" />
              <CardTitle>Escritório de Arquitetura</CardTitle>
            </div>
            <CardDescription>Dados cadastrais exibidos nos relatórios e contratos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Nome do Escritório
              </label>
              <input
                type="text"
                defaultValue="ArchFlow Arquitetura & Interiores"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Responsável Técnico / CAU
              </label>
              <input
                type="text"
                defaultValue="Arq. Ítalo Guimarães - CAU/BR A12345-6"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                E-mail de Contato
              </label>
              <input
                type="email"
                defaultValue="contato@archflow.com.br"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações & Alertas */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-5 text-primary" />
              <CardTitle>Notificações em Tempo Real</CardTitle>
            </div>
            <CardDescription>Configuração de eventos e alertas operacionais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <div className="text-sm font-medium text-foreground">Prazos de Tarefas</div>
                <div className="text-xs text-muted-foreground">Alertar quando uma tarefa estiver a 48h do vencimento</div>
              </div>
              <input type="checkbox" defaultChecked className="size-4 accent-primary rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <div className="text-sm font-medium text-foreground">Aprovação de Entregáveis</div>
                <div className="text-xs text-muted-foreground">Notificar quando o cliente revisar um entregável</div>
              </div>
              <input type="checkbox" defaultChecked className="size-4 accent-primary rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-foreground">Novas Vistorias</div>
                <div className="text-xs text-muted-foreground">Alertas de laudos e vistorias agendadas</div>
              </div>
              <input type="checkbox" defaultChecked className="size-4 accent-primary rounded cursor-pointer" />
            </div>
          </CardContent>
        </Card>

        {/* Segurança e Sessão */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <CardTitle>Segurança & Acessos</CardTitle>
            </div>
            <CardDescription>Políticas de permissão e autenticação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Autenticado como Administrador. O sistema opera com RBAC (Controle de Acesso Baseado em Papéis): ADMIN, ARCHITECT e VIEWER.
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full text-xs">
                Ver Logs de Auditoria do Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
