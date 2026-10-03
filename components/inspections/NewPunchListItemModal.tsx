"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addPunchListItem } from "@/app/actions/inspection";
import { toast } from "sonner";
import { Camera, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewPunchListItemModalProps {
  inspectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const COMMON_ENVIRONMENTS = [
  "Cozinha",
  "Suíte Master",
  "Sala de Estar",
  "Lavabo",
  "Varanda Gourmet",
  "Fachada",
  "Garagem",
  "Área de Serviço"
];

const COMMON_TRADES = [
  "Pintura",
  "Gesso",
  "Elétrica",
  "Hidráulica",
  "Marmoraria",
  "Marcenaria",
  "Esquadrias",
  "Revestimento"
];

export function NewPunchListItemModal({
  inspectionId,
  open,
  onOpenChange,
  onSuccess
}: NewPunchListItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState("");
  const [contractorTrade, setContractorTrade] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  }

  function handleClearPhoto() {
    setSelectedFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!environment.trim()) {
      toast.error("Informe o ambiente da não conformidade");
      return;
    }
    if (!contractorTrade.trim()) {
      toast.error("Informe a especialidade técnica");
      return;
    }
    if (!description.trim()) {
      toast.error("Descreva o ajuste necessário");
      return;
    }
    if (!selectedFile) {
      toast.error("A foto do Antes é obrigatória para registrar a não conformidade");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("environment", environment.trim());
      formData.append("contractorTrade", contractorTrade.trim());
      if (contractorName.trim()) {
        formData.append("contractorName", contractorName.trim());
      }
      formData.append("description", description.trim());
      formData.append("severity", severity);
      formData.append("beforePhoto", selectedFile);

      const res = await addPunchListItem(inspectionId, formData);

      if (res.ok) {
        toast.success("Não conformidade registrada com foto!");
        onOpenChange(false);
        handleClearPhoto();
        setDescription("");
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Erro ao registrar não conformidade");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado ao registrar item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#152026] flex items-center gap-2">
            <Camera className="h-5 w-5 text-gray-700" />
            <span>Registrar Não Conformidade (Antes)</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Captura de Foto Mobile-First */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Foto da Obra (Antes) *
            </Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-52 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Foto do Antes"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CDD5C6] hover:border-[#152026] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#CDD5C6]/10 hover:bg-[#CDD5C6]/20 flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 bg-white rounded-full shadow-sm text-[#152026]">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-[#152026]">
                  Tocar para abrir câmera ou galeria
                </div>
                <div className="text-xs text-gray-500">
                  Fotografe o detalhe do acabamento ou problema
                </div>
              </div>
            )}
          </div>

          {/* Ambiente / Cômodo */}
          <div className="space-y-2">
            <Label htmlFor="environment" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Ambiente / Cômodo *
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_ENVIRONMENTS.map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    environment === env
                      ? "bg-[#152026] text-white border-[#152026]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
            <Input
              id="environment"
              placeholder="Ou digite o nome do ambiente..."
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              required
            />
          </div>

          {/* Especialidade Técnica */}
          <div className="space-y-2">
            <Label htmlFor="contractorTrade" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Especialidade Técnica *
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TRADES.map((trade) => (
                <button
                  key={trade}
                  type="button"
                  onClick={() => setContractorTrade(trade)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    contractorTrade === trade
                      ? "bg-[#152026] text-white border-[#152026]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
            <Input
              id="contractorTrade"
              placeholder="Ex: Marcenaria, Gesso, Pintura..."
              value={contractorTrade}
              onChange={(e) => setContractorTrade(e.target.value)}
              required
            />
          </div>

          {/* Prestador / Responsável */}
          <div className="space-y-2">
            <Label htmlFor="contractorName" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Empresa / Prestador Responsável (Opcional)
            </Label>
            <Input
              id="contractorName"
              placeholder="Ex: Marmoraria Estrela, Empreiteiro Silva..."
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
            />
          </div>

          {/* Severidade */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Severidade do Ajuste
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "LOW", label: "Baixa", color: "hover:border-blue-400 active:bg-blue-50" },
                { key: "MEDIUM", label: "Média", color: "hover:border-amber-400 active:bg-amber-50" },
                { key: "HIGH", label: "Alta", color: "hover:border-orange-400 active:bg-orange-50" },
                { key: "CRITICAL", label: "Crítica", color: "hover:border-red-400 active:bg-red-50" }
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeverity(s.key as any)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    severity === s.key
                      ? "bg-[#152026] text-white border-[#152026]"
                      : `bg-white text-gray-700 border-gray-200 ${s.color}`
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              O que precisa ser corrigido? *
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente a não conformidade para orientação do prestador..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#152026] text-white hover:bg-[#20313a]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Não Conformidade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
