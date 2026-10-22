import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { readFile } from "@/lib/storage/localStorage";

function downloadName(name: string) {
  return name.replace(/[\r\n"\\]/g, "_").slice(0, 120) || "comprovante";
}

// Comprovante de repasse: público quando a campanha já tem prestação de contas
// divulgada (é conteúdo público por definição); antes disso, só financeiro/admin.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [campaignId, ...rest] = path;
  const filename = rest.join("/");
  if (!campaignId || !filename) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const db = getAdminDb();
  const campaignSnap = await db.collection("campaigns").doc(campaignId).get();
  if (!campaignSnap.exists) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }
  const campaign = campaignSnap.data()!;

  if (campaign.status !== "prestacao_publicada") {
    const user = await getSessionUser();
    if (!user || (user.role !== "financeiro" && user.role !== "admin")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
  }

  const storagePath = `transfers/${campaignId}/${filename}`;
  const transferSnap = await db
    .collection("transfers")
    .where("campaignId", "==", campaignId)
    .where("comprovanteUrl", "==", storagePath)
    .limit(1)
    .get();
  if (transferSnap.empty) {
    return NextResponse.json({ error: "Comprovante não encontrado." }, { status: 404 });
  }

  const buffer = await readFile(storagePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${downloadName(filename)}"`,
      "Cache-Control": campaign.status === "prestacao_publicada" ? "public, max-age=3600" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
