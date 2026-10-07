import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StorageProvider {
  uploadFile(file: Buffer, filename: string, mimeType: string): Promise<{ fileKey: string; fileUrl: string }>;
  getFile(fileKey: string): Promise<{ data: Buffer; mimeType: string }>;
  deleteFile(fileKey: string): Promise<void>;
}

export class DiskStorageProvider implements StorageProvider {
  private storageDir: string;

  constructor() {
    // Grava na pasta oculta .storage/ no diretório raiz do projeto
    this.storageDir = path.resolve(process.cwd(), ".storage");
  }

  private async ensureStorageDir() {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<{ fileKey: string; fileUrl: string }> {
    await this.ensureStorageDir();

    // Limpa o nome original do arquivo e extrai a extensão com segurança
    const ext = path.extname(filename).toLowerCase();
    const hash = crypto.randomBytes(16).toString("hex");
    const safeName = `${hash}${ext}`;

    const filePath = path.join(this.storageDir, safeName);
    await fs.writeFile(filePath, file);

    // Mapeia chaves de metadados para sabermos o mimetype posteriormente
    const metaPath = `${filePath}.meta`;
    await fs.writeFile(metaPath, JSON.stringify({ originalName: filename, mimeType }));

    const fileUrl = `/api/storage/download?key=${safeName}`;
    return { fileKey: safeName, fileUrl };
  }

  async getFile(fileKey: string): Promise<{ data: Buffer; mimeType: string }> {
    // Evita Path Traversal de forma absoluta
    const safeKey = path.basename(fileKey);
    const filePath = path.join(this.storageDir, safeKey);

    try {
      const data = await fs.readFile(filePath);
      
      // Lê o mimetype do arquivo .meta correspondente
      const metaPath = `${filePath}.meta`;
      let mimeType = "application/octet-stream";
      try {
        const metaData = await fs.readFile(metaPath, "utf-8");
        const meta = JSON.parse(metaData);
        if (meta && typeof meta === "object" && typeof meta.mimeType === "string") {
          mimeType = meta.mimeType;
        }
      } catch {
        // Fallback se não houver meta file
      }

      return { data, mimeType };
    } catch (error) {
      console.error("Storage get error:", error);
      throw new Error("Arquivo não encontrado ou erro de leitura.");
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    const safeKey = path.basename(fileKey);
    const filePath = path.join(this.storageDir, safeKey);

    try {
      await fs.unlink(filePath);
      try {
        await fs.unlink(`${filePath}.meta`);
      } catch {}
    } catch (error) {
      console.error("Storage delete error:", error);
    }
  }
}

// Exporta singleton padrão
export const storageProvider: StorageProvider = new DiskStorageProvider();
