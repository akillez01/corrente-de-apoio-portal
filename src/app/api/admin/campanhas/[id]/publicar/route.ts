import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Campaign } from "@/lib/types/domain";

const SITE_MEDIA_URL = /^\/api\/site-media\/[A-Za-z0-9_-]+\/[a-f0-9-]+\.(?:jpg|png|webp|avif)$/;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "editor_conteudo" && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da solicitação inválido." }, { status: 400 });
  }
  const imageUrl =
    typeof body === "object" && body !== null && "imageUrl" in body
      ? (body as { imageUrl?: unknown }).imageUrl
      : undefined;
  if (imageUrl !== undefined && imageUrl !== "" &&
      (typeof imageUrl !== "string" || !SITE_MEDIA_URL.test(imageUrl))) {
    return NextResponse.json({ error: "Imagem pública inválida." }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("campaigns").doc(id);
  const auditRef = db.collection("audit_log").doc();
  const now = new Date().toISOString();
  let campaign: Campaign;
  try {
    campaign = await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) throw new Error("CAMPAIGN_NOT_FOUND");
      const current = { id: snapshot.id, ...snapshot.data() } as Campaign;
      if (current.status !== "aprovado") throw new Error("CAMPAIGN_NOT_APPROVED");
      if (current.aprovadoPorUid && current.aprovadoPorUid === user.uid) {
        throw new Error("SEPARATION_OF_DUTIES");
      }
      tx.update(ref, {
        status: "publicado",
        ...(typeof imageUrl === "string" ? { imageUrl: imageUrl || null } : {}),
        publicadoPor: user.nome ?? user.email ?? user.uid,
        publicadoPorUid: user.uid,
        publicadoEm: now,
        atualizadoEm: now,
      });
      tx.create(auditRef, {
        tipo: "campanha_publicada",
        ator: user.nome ?? user.email ?? user.uid,
        alvo: id,
        detalhes: { slug: current.slug, aprovadoPorUid: current.aprovadoPorUid ?? null },
        timestamp: now,
      });
      return current;
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "CAMPAIGN_NOT_FOUND") return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
    if (code === "CAMPAIGN_NOT_APPROVED") return NextResponse.json({ error: "A campanha não está aguardando publicação." }, { status: 409 });
    if (code === "SEPARATION_OF_DUTIES") {
      return NextResponse.json(
        { error: "A publicação deve ser concluída por uma pessoa diferente de quem aprovou a campanha." },
        { status: 403 },
      );
    }
    throw error;
  }

  revalidatePath("/pt/doar");
  revalidatePath("/pt/transparencia");
  revalidatePath("/en/doar");
  revalidatePath("/en/transparencia");
  revalidatePath(`/pt/campanha/${campaign.slug}`);
  revalidatePath(`/en/campanha/${campaign.slug}`);
  revalidatePath("/pt");
  revalidatePath("/en");

  return NextResponse.json({ ok: true });
}
