import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Folder, FileText, Upload, Download, Search, Filter, HardDrive, Image, Check, Eye } from "lucide-react";

interface DocItem {
  id: string;
  name: string;
  category: "Plantas" | "Modelagem 3D" | "Contratos" | "Vistorias" | "Renders";
  size: string;
  project: string;
  uploadedAt: string;
  extension: "pdf" | "dwg" | "ifc" | "jpg" | "docx";
}

const mockDocs: DocItem[] = [
  {
    id: "1",
    name: "Planta_Baixa_Executiva_R04.pdf",
    category: "Plantas",
    size: "14.2 MB",
    project: "Residencial Alphaville Villa 4",
    uploadedAt: "2026-10-02",
    extension: "pdf",
  },
  {
    id: "2",
    name: "Modelo_BIM_Arquitetura_LOD350.ifc",
    category: "Modelagem 3D",
    size: "48.6 MB",
    project: "Edifício Horizonte",
    uploadedAt: "2026-09-28",
    extension: "ifc",
  },
  {
    id: "3",
    name: "Contrato_Prestacao_Servicos_Assinado.pdf",
    category: "Contratos",
    size: "1.8 MB",
    project: "Casa Jardins",
    uploadedAt: "2026-09-15",
    extension: "pdf",
  },
  {
    id: "4",
    name: "Laudo_Vistoria_Fundacao_01.pdf",
    category: "Vistorias",
    size: "8.4 MB",
    project: "Residencial Alphaville Villa 4",
    uploadedAt: "2026-10-01",
    extension: "pdf",
  },
  {
    id: "5",
    name: "Render_Fachada_Diurna_Final.jpg",
    category: "Renders",
    size: "9.1 MB",
    project: "Loft Industrial Pinheiros",
    uploadedAt: "2026-09-20",
    extension: "jpg",
  },
];

export function DocumentsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [docs, setDocs] = useState<DocItem[]>(mockDocs);

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Plantas", "Modelagem 3D", "Contratos", "Vistorias", "Renders"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos & Arquivos Técnicos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Central de pranchas, memoriais, modelos BIM e contratos de projetos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const newDoc: DocItem = {
                    id: String(Date.now()),
                    name: file.name,
                    category: "Plantas",
                    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    project: "Projeto Geral",
                    uploadedAt: new Date().toISOString().split("T")[0],
                    extension: "pdf",
                  };
                  setDocs([newDoc, ...docs]);
                }
              }}
            />
            <Button size="sm" className="gap-2 pointer-events-none">
              <Upload className="size-4" />
              Fazer Upload de Arquivo
            </Button>
          </label>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome do arquivo ou projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="h-8 text-xs shrink-0"
            >
              {cat === "all" ? "Todos os Arquivos" : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Arquivos */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Nome do Arquivo</th>
                  <th className="py-3 px-4">Projeto Vinculado</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Tamanho</th>
                  <th className="py-3 px-4">Data de Envio</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Nenhum documento encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="size-4" />
                        </div>
                        <span className="truncate max-w-xs">{doc.name}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{doc.project}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{doc.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{doc.size}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Visualizar"
                            className="size-7"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Download"
                            className="size-7"
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
