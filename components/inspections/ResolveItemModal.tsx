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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolvePunchListItem } from "@/app/actions/inspection";
import { toast } from "sonner";
import { Camera, CheckCircle2, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResolveItemModalProps {
  item: {
    id: string;
    environment: string;
    contractorTrade: string;
    contractorName?: string | null;
    description: string;
    beforePhotoUrl: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ResolveItemModal({
  item,
  open,
  onOpenChange,
  onSuccess
}: ResolveItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
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
    if (!item) return;

    if (!resolutionNotes.trim()) {
      toast.error("Informe a observação técnica da correção realizada");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resolutionNotes", resolutionNotes.trim());
      if (selectedFile) {
        formData.append("afterPhoto", selectedFile);
      }

      const res = await resolvePunchListItem(item.id, formData);

      if (res.ok) {
        toast.success("Não conformidade marcada como resolvida!");
        onOpenChange(false);
        handleClearPhoto();
        setResolutionNotes("");
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Erro ao resolver item");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado ao resolver item");
    } finally {
      setLoading(false);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#152026] flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Registrar Correção da Pendência</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Resumo do Item Original */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1 text-sm">
            <div className="font-semibold text-gray-900">
              {item.environment} • {item.contractorTrade}
              {item.contractorName ? ` (${item.contractorName})` : ""}
            </div>
            <p className="text-xs text-gray-600 italic">
              &quot;{item.description}&quot;
            </p>
          </div>

          {/* Comparativo: Foto do Antes */}
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Foto Original do Problema (Antes)
            </Label>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-black/5 h-44 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.beforePhotoUrl}
                alt="Foto do Antes"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Foto do Depois */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Foto da Obra Corrigida (Depois)
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
              <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/20 h-44 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Foto do Depois"
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
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-xl p-4 text-center cursor-pointer transition-colors bg-emerald-50/30 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1.5"
              >
                <Camera className="h-6 w-6 text-emerald-700" />
                <div className="text-sm font-semibold text-emerald-900">
                  Fotografar serviço executado / corrigido
                </div>
                <div className="text-xs text-gray-500">
                  Toque para acionar câmera no canteiro
                </div>
              </div>
            )}
          </div>

          {/* Observações de Resolução */}
          <div className="space-y-2">
            <Label htmlFor="resolutionNotes" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Observação Técnica de Liberação *
            </Label>
            <Textarea
              id="resolutionNotes"
              placeholder="Ex: Peça recalibrada pelo prestador, conferida e aprovada na vistoria..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
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
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aprovar & Resolver
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
