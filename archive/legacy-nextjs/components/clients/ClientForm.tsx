"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clientSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/app/actions/client";
import { useRouter } from "next/navigation";
import { Loader2, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  ClientStatus,
  ClientLegalType,
  ClientCategory,
  ContactPreference,
} from "@prisma/client";

interface ClientFormProps {
  initialData?: any;
}

// Helpers para máscaras
const formatPhone = (val: string) => {
  const clean = val.replace(/\D/g, "");
  if (clean.length <= 10) {
    return clean
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return clean
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

const formatDocument = (
  val: string,
  type: ClientLegalType | null | undefined,
) => {
  const clean = val.replace(/\D/g, "");
  if (type === ClientLegalType.PF) {
    return clean
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else if (type === ClientLegalType.PJ) {
    return clean
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
  return clean.slice(0, 14);
};

const formatCep = (val: string) => {
  return val
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
};

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: initialData
      ? {
          ...initialData,
          legalType: initialData.legalType || ClientLegalType.PF,
          category: initialData.category || ClientCategory.RESIDENTIAL,
          contactPreference:
            initialData.contactPreference || ContactPreference.EMAIL,
          notes: initialData.notes || "",
          address: initialData.address || {
            cep: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
          },
        }
      : {
          name: "",
          email: "",
          phone: "",
          document: "",
          legalType: ClientLegalType.PF,
          razaoSocial: "",
          inscricaoEstadual: "",
          category: ClientCategory.RESIDENTIAL,
          contactPreference: ContactPreference.EMAIL,
          notes: "",
          address: {
            cep: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
          },
          status: ClientStatus.PROSPECT,
        },
  });

  const watchLegalType = form.watch("legalType");

  // Limpa o documento ao alternar o tipo de pessoa para evitar conflito de validação
  // form e initialData são estáveis e não precisam causar re-execução do efeito
  useEffect(() => {
    if (initialData?.legalType !== watchLegalType) {
      form.setValue("document", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchLegalType]);

  async function onSubmit(values: any) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let result;
      if (initialData?.id) {
        result = await updateClient(initialData.id, {
          ...values,
          id: initialData.id,
        });
      } else {
        result = await createClient(values);
      }

      if (!result.ok) {
        console.error(result.error);
        if (typeof result.error === "object") {
          // Trata erros de campos vindos do Zod
          const fieldErrors = Object.entries(result.error)
            .map(([field, msgs]: any) => `${field}: ${msgs.join(", ")}`)
            .join(" | ");
          setErrorMessage(`Erros de validação: ${fieldErrors}`);
        } else {
          setErrorMessage(
            result.message || "Erro desconhecido ao salvar o cliente.",
          );
        }
      } else {
        setSuccessMessage(
          `Cliente ${initialData ? "atualizado" : "criado"} com sucesso! Redirecionando...`,
        );
        setTimeout(() => {
          router.push("/clients");
          router.refresh();
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        `Erro ao ${initialData ? "atualizar" : "criar"} cliente: ` +
          error.message,
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCepSearch() {
    let cep = form.getValues("address.cep");
    if (!cep) return;
    cep = cep.replace(/\D/g, "");
    if (cep.length < 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        form.setValue("address.street", data.logradouro);
        form.setValue("address.neighborhood", data.bairro);
        form.setValue("address.city", data.localidade);
        form.setValue("address.state", data.uf);
        form.setFocus("address.number");
      } else {
        alert("CEP não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Erro ao buscar CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full bg-card p-8 rounded-2xl border border-border shadow-xl"
      >
        {errorMessage && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in duration-300">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 animate-bounce" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="legalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Tipo de Pessoa *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Selecione o tipo de pessoa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value={ClientLegalType.PF}>
                        Pessoa Física (PF)
                      </SelectItem>
                      <SelectItem value={ClientLegalType.PJ}>
                        Pessoa Jurídica (PJ)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    {watchLegalType === ClientLegalType.PF ? "CPF *" : "CNPJ *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        watchLegalType === ClientLegalType.PF
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const formatted = formatDocument(
                          e.target.value,
                          watchLegalType,
                        );
                        field.onChange(formatted);
                      }}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    {watchLegalType === ClientLegalType.PJ
                      ? "Nome Fantasia *"
                      : "Nome Completo *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        watchLegalType === ClientLegalType.PJ
                          ? "Minha Empresa S/A"
                          : "João da Silva"
                      }
                      {...field}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Email *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="joao@exemplo.com"
                      type="email"
                      {...field}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchLegalType === ClientLegalType.PJ && (
              <>
                <FormField
                  control={form.control}
                  name="razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-muted-foreground">
                        Razão Social *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Razão Social Comercial Ltda"
                          {...field}
                          value={field.value || ""}
                          className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inscricaoEstadual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-muted-foreground">
                        Inscrição Estadual
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000.000"
                          {...field}
                          value={field.value || ""}
                          className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Categoria do Cliente *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value={ClientCategory.RESIDENTIAL}>
                        Residencial
                      </SelectItem>
                      <SelectItem value={ClientCategory.COMMERCIAL}>
                        Comercial
                      </SelectItem>
                      <SelectItem value={ClientCategory.INSTITUTIONAL}>
                        Institucional
                      </SelectItem>
                      <SelectItem value={ClientCategory.INDUSTRIAL}>
                        Industrial
                      </SelectItem>
                      <SelectItem value={ClientCategory.DESIGNER}>
                        Designer / Parceiro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Preferência de Contato *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Selecione a preferência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value={ContactPreference.EMAIL}>
                        E-mail
                      </SelectItem>
                      <SelectItem value={ContactPreference.PHONE}>
                        Telefone
                      </SelectItem>
                      <SelectItem value={ContactPreference.WHATSAPP}>
                        WhatsApp
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <FormField
              control={form.control}
              name="address.cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    CEP
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value);
                          field.onChange(formatted);
                        }}
                        className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCepSearch}
                      disabled={cepLoading}
                      className="rounded-xl flex-shrink-0"
                    >
                      {cepLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="font-semibold text-muted-foreground">
                    Rua
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rua das Flores"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Número
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Complemento
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apto 101"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Bairro
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Centro"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Cidade
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="São Paulo"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-muted-foreground">
                    Estado
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SP"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Observações de Relacionamento
          </h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-muted-foreground">
                  Notas sobre o Cliente
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Registros de interações passadas, preferências estéticas, necessidades específicas do cliente..."
                    {...field}
                    className="min-h-[120px] rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-xl px-8 bg-primary hover:bg-primary/95 text-background-dark font-bold shadow-lg shadow-primary/20 transition-all"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
