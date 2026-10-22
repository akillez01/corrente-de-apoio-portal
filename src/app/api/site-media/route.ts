import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSessionUser } from "@/lib/auth/session";
import { saveFile } from "@/lib/storage/localStorage";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const FORMATS = {
  "image/jpeg": { extension: "jpg", signature: (data: Buffer) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  "image/png": { extension: "png", signature: (data: Buffer) => data.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  "image/webp": { extension: "webp", signature: (data: Buffer) => data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" },
  "image/avif": { extension: "avif", signature: (data: Buffer) => data.toString("ascii", 4, 8) === "ftyp" && ["avif", "avis"].includes(data.toString("ascii", 8, 12)) },
} as const;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "editor_conteudo" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "A imagem deve ter até 5 MB." }, { status: 400 });
  }

  const format = FORMATS[file.type as keyof typeof FORMATS];
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!format || !format.signature(buffer)) {
    return NextResponse.json(
      { error: "Formato inválido. Use JPEG, PNG, WebP ou AVIF (sem SVG)." },
      { status: 400 },
    );
  }

  let sanitized: Buffer;
  try {
    const image = sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    const expectedFormat = file.type === "image/jpeg" ? "jpeg" : file.type.slice("image/".length);
    if (metadata.format !== expectedFormat) {
      return NextResponse.json({ error: "O conteúdo não corresponde ao formato declarado." }, { status: 400 });
    }

    const oriented = image.rotate();
    if (expectedFormat === "jpeg") sanitized = await oriented.jpeg({ quality: 85 }).toBuffer();
    else if (expectedFormat === "png") sanitized = await oriented.png({ compressionLevel: 9 }).toBuffer();
    else if (expectedFormat === "webp") sanitized = await oriented.webp({ quality: 85 }).toBuffer();
    else sanitized = await oriented.avif({ quality: 65 }).toBuffer();
  } catch {
    return NextResponse.json({ error: "Não foi possível processar a imagem enviada." }, { status: 400 });
  }
  if (sanitized.byteLength > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "A imagem processada excede o limite de 4 MB." }, { status: 400 });
  }

  const filename = `${randomUUID()}.${format.extension}`;
  const key = `site-media/${user.uid}/${filename}`;
  await saveFile(key, sanitized);
  return NextResponse.json({ ok: true, url: `/api/site-media/${user.uid}/${filename}` });
}
