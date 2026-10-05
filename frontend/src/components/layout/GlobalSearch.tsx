import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Building2,
  Users,
  Folder,
  Calendar,
  ClipboardCheck,
  Activity,
  BarChart3,
  Settings,
  X,
  Loader2,
  ExternalLink,
  Command,
} from "lucide-react";
import { projectApi, clientApi } from "../../services/api";
import { Project } from "../../types/project";
import { Client } from "../../types/client";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Projetos" | "Clientes" | "Módulos";
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATIC_MODULES: SearchResultItem[] = [
  { id: "mod-proj", title: "Projetos (Kanban)", subtitle: "Fluxo de projetos e pipeline", category: "Módulos", to: "/projects", icon: Building2 },
  { id: "mod-client", title: "Clientes", subtitle: "Gestão de pessoas físicas e jurídicas", category: "Módulos", to: "/clients", icon: Users },
  { id: "mod-insp", title: "Vistorias Técnicas", subtitle: "Laudos fotográficos e punch list", category: "Módulos", to: "/inspections", icon: ClipboardCheck },
  { id: "mod-act", title: "Atividades & Prazos", subtitle: "Reuniões e entregas do escritório", category: "Módulos", to: "/activities", icon: Activity },
  { id: "mod-sched", title: "Cronograma Geral", subtitle: "Calendário mensal e prazos", category: "Módulos", to: "/schedule", icon: Calendar },
  { id: "mod-docs", title: "Documentos & Plantas", subtitle: "Armazenamento e especificações DWG/PDF", category: "Módulos", to: "/documents", icon: Folder },
  { id: "mod-rep", title: "Relatórios Executivos", subtitle: "DRE, margens e evolução de obras", category: "Módulos", to: "/reports", icon: BarChart3 },
  { id: "mod-sett", title: "Configurações", subtitle: "Preferências visuais e parâmetros", category: "Módulos", to: "/settings", icon: Settings },
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search execution
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();

      // Search modules
      const matchingModules = STATIC_MODULES.filter(
        (m) => m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q)
      );

      // Search remote items
      let matchingProjects: SearchResultItem[] = [];
      let matchingClients: SearchResultItem[] = [];

      try {
        const [projRes, clientRes] = await Promise.allSettled([
          projectApi.list({ search: query, size: 5 }),
          clientApi.list({ search: query, size: 5 }),
        ]);

        if (projRes.status === "fulfilled" && projRes.value?.content) {
          matchingProjects = projRes.value.content.map((p: Project) => ({
            id: `proj-${p.id}`,
            title: p.name,
            subtitle: `${p.code || "ARQ"} • ${p.clientName || "Cliente não informado"} • ${p.status || "Ativo"}`,
            category: "Projetos" as const,
            to: `/projects/${p.id}`,
            icon: Building2,
          }));
        }

        if (clientRes.status === "fulfilled" && clientRes.value?.content) {
          matchingClients = clientRes.value.content.map((c: Client) => ({
            id: `client-${c.id}`,
            title: c.name,
            subtitle: `${c.legalType === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"} • ${c.email || c.phone || "Sem contato"}`,
            category: "Clientes" as const,
            to: "/clients",
            icon: Users,
          }));
        }
      } catch (err) {
        console.error("Erro na busca global:", err);
      }

      setResults([...matchingProjects, ...matchingClients, ...matchingModules]);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery("");
    navigate({ to: item.to });
  };

  return (
    <div ref={containerRef} className="relative w-48 sm:w-60 md:w-72 lg:w-80">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Buscar projetos, clientes... (Ctrl+K)"
          className="w-full h-8 pl-8 pr-12 text-xs rounded-lg border border-input bg-background/80 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <div className="absolute right-2 hidden sm:flex items-center gap-0.5 pointer-events-none text-[10px] text-muted-foreground border border-border px-1 rounded bg-muted/40 font-mono">
            <span>⌘</span>
            <span>K</span>
          </div>
        )}
      </div>

      {/* Floating Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-10 mt-1 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-xs">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Pesquisando no ArchFlow...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </div>
          )}

          {!loading && !query && (
            <div className="p-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Acesso Rápido a Módulos
              </span>
              <div className="mt-1 space-y-1">
                {STATIC_MODULES.slice(0, 4).map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleSelect(mod)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-secondary transition-colors text-xs text-foreground group"
                    >
                      <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{mod.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{mod.subtitle}</p>
                      </div>
                      <ExternalLink className="size-3 text-muted-foreground/40 group-hover:text-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3 p-1">
              {(["Projetos", "Clientes", "Módulos"] as const).map((cat) => {
                const groupItems = results.filter((r) => r.category === cat);
                if (groupItems.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 block">
                      {cat} ({groupItems.length})
                    </span>
                    {groupItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-secondary transition-colors text-xs text-foreground group"
                        >
                          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
