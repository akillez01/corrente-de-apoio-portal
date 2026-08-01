import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getRequestById } from "@/lib/data/requests";
import { readFile } from "@/lib/storage/localStorage";

// Serve anexos privados de pedidos sob autenticação + checagem de papel a cada
// request — equivalente funcional a uma signed URL de curta duração.
export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const [requestId, ...rest] = params.path;
  const filename = rest.join("/");
  if (!requestId || !filename) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const request = await getRequestById(requestId);
  if (!request) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  const allowed = user.role === "curador" || user.role === "admin" || user.uid === request.requerenteId;
  if (!allowed) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const storagePath = `requests/${requestId}/${filename}`;
  const attachment = request.anexos.find((a) => a.path === storagePath);
  if (!attachment) return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });

  const buffer = await readFile(storagePath);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.contentType,
      "Content-Disposition": `inline; filename="${attachment.nome}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
