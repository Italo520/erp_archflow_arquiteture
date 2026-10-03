import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/server-utils";
import { generateInspectionPDF } from "@/lib/reports/inspection-pdf";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; inspectionId: string }> }
) {
  try {
    const { id: projectId, inspectionId } = await params;
    await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

    const inspection = await prisma.siteInspection.findUnique({
      where: { id: inspectionId },
      include: {
        project: true,
        inspector: true,
        items: true
      }
    });

    if (!inspection) {
      return new NextResponse("Vistoria não encontrada", { status: 404 });
    }

    const tradeFilter = req.nextUrl.searchParams.get("trade");
    const statusFilter = req.nextUrl.searchParams.get("status");

    let items = inspection.items;
    if (tradeFilter) {
      items = items.filter(i => i.contractorTrade.toLowerCase() === tradeFilter.toLowerCase());
    }
    if (statusFilter) {
      items = items.filter(i => i.status === statusFilter);
    }

    const pdfBuffer = await generateInspectionPDF({
      project: {
        name: inspection.project.name,
        clientName: inspection.project.clientName,
        address: inspection.project.address
      },
      inspection: {
        title: inspection.title,
        date: inspection.date,
        weatherCondition: inspection.weatherCondition,
        generalNotes: inspection.generalNotes,
        inspectorName: inspection.inspector?.fullName || "Arquiteto Responsável"
      },
      items
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vistoria-${inspection.id.slice(0, 8)}.pdf"`
      }
    });
  } catch (error: any) {
    console.error("PDF export error:", error);
    return new NextResponse(error.message || "Erro ao exportar PDF", { status: 500 });
  }
}
