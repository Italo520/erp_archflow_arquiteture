import { generateInspectionPDF } from "@/lib/reports/inspection-pdf";

describe("Inspection PDF Engine", () => {
  it("gera buffer PDF válido com os dados da vistoria", async () => {
    const mockData = {
      project: {
        name: "Residência Alphaville",
        clientName: "João da Silva",
        address: "Av. Principal 100"
      },
      inspection: {
        title: "Vistoria #01",
        date: new Date("2026-10-03"),
        weatherCondition: "Ensolarado",
        inspectorName: "Italo Sampaio"
      },
      items: [
        {
          environment: "Cozinha",
          contractorTrade: "Gesso",
          contractorName: "Gesso Luxo",
          description: "Forro desnivelado",
          severity: "HIGH",
          status: "PENDING"
        },
        {
          environment: "Lavabo",
          contractorTrade: "Marmoraria",
          contractorName: "Pedra Nobre",
          description: "Bancada polida",
          severity: "MEDIUM",
          status: "RESOLVED"
        }
      ]
    };

    const pdfBuffer = await generateInspectionPDF(mockData as any);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(500);
  });
});
