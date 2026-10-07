import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { storageProvider } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type;
    const fileSize = file.size;

    // Converte o arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Faz o upload físico
    const uploadResult = await storageProvider.uploadFile(buffer, filename, mimeType);

    return NextResponse.json({
      ok: true,
      data: {
        fileKey: uploadResult.fileKey,
        fileUrl: uploadResult.fileUrl,
        filename,
        mimeType,
        fileSize,
      },
    });
  } catch (error: any) {
    console.error("Upload Route error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Erro no upload do arquivo" }, { status: 500 });
  }
}
