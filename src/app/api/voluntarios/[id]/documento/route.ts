import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getVolunteer, VOLUNTEER_DIRECTORY_ROLES } from "@/lib/data/volunteers";
import { readFile } from "@/lib/storage/localStorage";

// Currículo/documento do voluntário — só para a equipe.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user?.role || !VOLUNTEER_DIRECTORY_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const volunteer = await getVolunteer(id);
  if (!volunteer?.documentoPath) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }
  const buffer = await readFile(volunteer.documentoPath);
  const filename = (volunteer.documentoNome ?? "documento").replace(/[\r\n"\\]/g, "_").slice(0, 120);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
