"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSiteInspection } from "@/app/actions/inspection";
import { toast } from "sonner";
import { Plus, Sun, CloudRain, Cloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewInspectionDialogProps {
  projectId: string;
  onSuccess?: () => void;
}

export function NewInspectionDialog({ projectId, onSuccess }: NewInspectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [weatherCondition, setWeatherCondition] = useState<string>("Ensolarado");
  const [generalNotes, setGeneralNotes] = useState("");
  const router = useRouter();

  const weatherOptions = [
    { label: "Ensolarado", icon: Sun },
    { label: "Nublado", icon: Cloud },
    { label: "Chuvoso", icon: CloudRain }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor, informe o título da vistoria");
      return;
    }

    setLoading(true);
    try {
      const res = await createSiteInspection(projectId, {
        title,
        weatherCondition,
        generalNotes
      });

      if (res.ok) {
        toast.success("Vistoria técnica iniciada com sucesso!");
        setOpen(false);
        setTitle("");
        setGeneralNotes("");
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Erro ao criar vistoria");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado ao criar vistoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#152026] text-white hover:bg-[#20313a] flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nova Vistoria</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#152026]">
            Iniciar Vistoria Técnica
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Identificação da Vistoria *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Vistoria #03 - Conferência de Gesso e Iluminação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Condições Climáticas na Obra
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {weatherOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = weatherCondition === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setWeatherCondition(opt.label)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-[#CDD5C6]/30 border-[#152026] text-[#152026] font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="generalNotes" className="text-sm font-semibold text-gray-700">
              Observações Gerais do Canteiro
            </Label>
            <Textarea
              id="generalNotes"
              placeholder="Ex: Mestre de obras presente, instalações conforme projeto preliminar..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
              Iniciar Vistoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
