import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface InspectionPDFData {
  project: {
    name: string;
    clientName?: string | null;
    address?: string | null;
  };
  inspection: {
    title: string;
    date: Date;
    weatherCondition?: string | null;
    generalNotes?: string | null;
    inspectorName: string;
  };
  items: Array<{
    environment: string;
    contractorTrade: string;
    contractorName?: string | null;
    description: string;
    severity: string;
    status: string;
    dueDate?: Date | string | null;
    resolutionNotes?: string | null;
  }>;
}

export async function generateInspectionPDF(data: InspectionPDFData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // ArchFlow Brand Colors
  const brandPrimary: [number, number, number] = [205, 213, 198];
  const brandForeground: [number, number, number] = [21, 32, 38];
  const brandSecondary: [number, number, number] = [183, 188, 191];

  // 1. Header Background
  doc.setFillColor(...brandPrimary);
  doc.rect(0, 0, pageWidth, 36, "F");

  // 2. Title & Project Info
  doc.setTextColor(...brandForeground);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ArchFlow ERP - Relatório de Vistoria Técnica", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const clientInfo = data.project.clientName ? ` | Cliente: ${data.project.clientName}` : "";
  doc.text(`Obra: ${data.project.name}${clientInfo}`, 14, 23);

  const formattedDate = format(new Date(data.inspection.date), "dd/MM/yyyy", { locale: ptBR });
  const weather = data.inspection.weatherCondition ? ` | Clima: ${data.inspection.weatherCondition}` : "";
  doc.text(`Vistoria: ${data.inspection.title} | Data: ${formattedDate}${weather}`, 14, 29);

  // 3. Resumo Executivo / KPIs
  const total = data.items.length;
  const pending = data.items.filter(i => i.status === "PENDING" || i.status === "IN_PROGRESS").length;
  const resolved = data.items.filter(i => i.status === "RESOLVED").length;

  doc.setFillColor(245, 247, 248);
  doc.roundedRect(14, 42, pageWidth - 28, 14, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandForeground);
  doc.text(
    `Resumo do Canteiro: ${total} Itens Inspecionados  •  ${pending} Pendentes  •  ${resolved} Resolvidos`,
    18,
    51
  );

  // 4. Tabela de Não Conformidades (Punch List)
  const tableRows = data.items.map((item, idx) => {
    const contractor = item.contractorName ? ` (${item.contractorName})` : "";
    const statusText = item.status === "RESOLVED" ? "RESOLVIDO" : "PENDENTE";
    return [
      (idx + 1).toString(),
      item.environment,
      `${item.contractorTrade}${contractor}`,
      item.description,
      item.severity,
      statusText
    ];
  });

  autoTable(doc, {
    startY: 62,
    head: [["#", "Ambiente", "Especialidade / Responsável", "Descrição da Não Conformidade", "Severidade", "Status"]],
    body: tableRows,
    headStyles: {
      fillColor: brandForeground,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 30, 30]
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { cellWidth: 40 },
      3: { cellWidth: "auto" },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 251]
    }
  });

  // 5. Termo de Responsabilidade & Assinaturas
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  const signatureY = Math.min(finalY + 25, pageHeight - 35);

  doc.setDrawColor(...brandSecondary);
  doc.line(20, signatureY, 85, signatureY);
  doc.line(pageWidth - 85, signatureY, pageWidth - 20, signatureY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Arquiteto: ${data.inspection.inspectorName}`, 20, signatureY + 5);
  doc.text("Responsável Técnico / CAU", 20, signatureY + 9);

  doc.text("Responsável da Obra / Empreiteiro", pageWidth - 85, signatureY + 5);
  doc.text("Visto de Notificação / Recebimento", pageWidth - 85, signatureY + 9);

  // Rodapé com paginação
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Página ${i} de ${totalPages} - Gerado via ArchFlow ERP`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}
