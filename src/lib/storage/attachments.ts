import "server-only";
import { saveFile } from "@/lib/storage/localStorage";
import type { Attachment } from "@/lib/types/domain";

export async function uploadAttachment(requestId: string, file: File): Promise<Attachment> {
  const path = `requests/${requestId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  await saveFile(path, buffer);

  return { nome: file.name, path, contentType, size: buffer.length };
}
