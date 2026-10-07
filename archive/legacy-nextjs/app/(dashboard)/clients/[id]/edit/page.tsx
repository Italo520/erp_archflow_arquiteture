import { getClientById } from "@/app/actions/client";
import { ClientForm } from "@/components/clients/ClientForm";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClientById(id);

    if (!client) {
        notFound();
    }

    // Serialize dates to avoid warnings
    const serializedClient = JSON.parse(JSON.stringify(client));

    return (
        <div className="w-full py-10 px-6 lg:px-10">
            <h1 className="text-3xl font-bold mb-8">Editar Cliente</h1>
            <ClientForm initialData={serializedClient} />
        </div>
    );
}
