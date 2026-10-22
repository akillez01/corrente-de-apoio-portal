import "server-only";
import { mkdir, readFile as fsReadFile, writeFile } from "fs/promises";
import { dirname, resolve, sep } from "path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Backend de anexos: Cloudflare R2 (S3-compatível) quando R2_BUCKET está definido
// (necessário na Vercel, onde o disco é efêmero); caso contrário, disco local em STORAGE_DIR.
const STORAGE_ROOT = resolve(process.env.STORAGE_DIR ?? "./.data/uploads");

let r2Client: S3Client | null = null;

function getR2(): { client: S3Client; bucket: string } | null {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) return null;
  if (!r2Client) {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new Error("Credenciais do R2 incompletas (R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY).");
    }
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
  }
  return { client: r2Client, bucket };
}

function resolvePath(relativePath: string): string {
  const full = resolve(STORAGE_ROOT, relativePath);
  if (full !== STORAGE_ROOT && !full.startsWith(STORAGE_ROOT + sep)) {
    throw new Error("Caminho de arquivo inválido.");
  }
  return full;
}

// Mesma guarda contra path traversal, aplicada à chave do objeto no R2.
function safeKey(relativePath: string): string {
  const segments = relativePath.split("/");
  if (relativePath.startsWith("/") || segments.some((s) => s === ".." || s === "." || s === "")) {
    throw new Error("Caminho de arquivo inválido.");
  }
  return relativePath;
}

export async function saveFile(relativePath: string, buffer: Buffer): Promise<void> {
  const r2 = getR2();
  if (r2) {
    await r2.client.send(new PutObjectCommand({ Bucket: r2.bucket, Key: safeKey(relativePath), Body: buffer }));
    return;
  }
  const full = resolvePath(relativePath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, buffer);
}

export async function readFile(relativePath: string): Promise<Buffer> {
  const r2 = getR2();
  if (r2) {
    const res = await r2.client.send(new GetObjectCommand({ Bucket: r2.bucket, Key: safeKey(relativePath) }));
    if (!res.Body) throw new Error("Arquivo não encontrado.");
    return Buffer.from(await res.Body.transformToByteArray());
  }
  return fsReadFile(resolvePath(relativePath));
}
