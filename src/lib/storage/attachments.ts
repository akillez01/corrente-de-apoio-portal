import "server-only";
import { saveFile } from "@/lib/storage/localStorage";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/storage/limits";
import type { Attachment } from "@/lib/types/domain";

const MAX_ATTACHMENTS_PER_REQUEST = 5;

function safeFileName(name: string) {
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized.slice(0, 120) || "anexo";
}

export async function uploadAttachment(requestId: string, file: File): Promise<Attachment> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Cada anexo deve ter no máximo ${MAX_UPLOAD_LABEL}.`);
  }

  const path = `requests/${requestId}/${Date.now()}-${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  await saveFile(path, buffer);

  return { nome: file.name, path, contentType, size: buffer.length };
}

export { MAX_ATTACHMENTS_PER_REQUEST };
