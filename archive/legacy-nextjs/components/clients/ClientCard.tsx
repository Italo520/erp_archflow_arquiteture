import React from "react";
import Link from "next/link";
import { Client } from "@prisma/client";
import { ClientAvatar } from "./ClientAvatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Assuming Badge exists or I might need to make a simple one if not
import { Phone, Mail, MapPin } from "lucide-react";

// Fallback Badge if not in components/ui
function FallbackBadge({ children, variant = "default" }: { children: React.ReactNode, variant?: string }) {
    const colors = variant === "destructive" ? "bg-red-500" : "bg-primary";
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === "outline" ? "text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"} ${variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}`}>{children}</span>;
}

interface ClientCardProps {
    client: Client & {
        _count?: {
            projects: number;
        };
    };
}

export function ClientCard({ client }: ClientCardProps) {
    // Determine status color
    const statusColor =
        client.status === "ACTIVE" ? "bg-green-100 text-green-800" :
            client.status === "INACTIVE" ? "bg-gray-100 text-gray-800" :
                client.status === "PROSPECT" ? "bg-blue-100 text-blue-800" :
                    "bg-red-100 text-red-800"; // BLOCKED

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
                <ClientAvatar name={client.name} avatarUrl={client.avatar} className="h-12 w-12" />
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate text-lg">{client.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                        {client.razaoSocial || client.category || "Cliente"}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                    </div>
                )}
                {/* Address handling assuming address is JSON */}
                {(client.address as any)?.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{(client.address as any).city}, {(client.address as any).state}</span>
                    </div>
                )}
                <div className="flex gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                        {client.status}
                    </span>
                    {client._count?.projects !== undefined && (
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                            {client._count.projects} Projetos
                        </span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/clients/${client.id}`}>
                        Ver Detalhes
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
