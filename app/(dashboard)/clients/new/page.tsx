import { Metadata } from "next";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = {
    title: "Novo Cliente | ArchFlow",
    description: "Adicionar novo cliente à base",
};

export default function NewClientPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Novo Cliente</h2>
            </div>
            <div className="w-full">
                <ClientForm />
            </div>
        </div>
    );
}
