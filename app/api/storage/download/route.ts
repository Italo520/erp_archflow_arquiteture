import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { storageProvider } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Não autorizado. Faça login para acessar o arquivo.", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return new NextResponse("Parâmetro de chave (key) ausente.", { status: 400 });
  }

  try {
    const fileResult = await storageProvider.getFile(key);

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", fileResult.mimeType);
    responseHeaders.set("Content-Length", fileResult.data.length.toString());
    
    // Servir inline para PDFs e Imagens, senão forçar download de anexo
    const isInline = /^(image\/|application\/pdf)/.test(fileResult.mimeType);
    responseHeaders.set(
      "Content-Disposition",
      `${isInline ? "inline" : "attachment"}; filename="${key}"`
    );

    return new NextResponse(new Uint8Array(fileResult.data), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Download Route error:", error);
    return new NextResponse("Arquivo não encontrado.", { status: 404 });
  }
}
