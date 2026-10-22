import { NextResponse } from "next/server";
import { readFile } from "@/lib/storage/localStorage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params;
  if (segments.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(segments[0]) ||
      !/^[a-f0-9-]+\.(?:jpg|png|webp|avif)$/.test(segments[1])) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }

  const key = `site-media/${segments.join("/")}`;
  let image: Buffer;
  try {
    image = await readFile(key);
  } catch (error) {
    if ((error as { name?: string }).name === "NoSuchKey" ||
        (error as { code?: string }).code === "ENOENT") {
      return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
    }
    throw error;
  }

  const extension = segments[1].split(".").pop();
  const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(image.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
