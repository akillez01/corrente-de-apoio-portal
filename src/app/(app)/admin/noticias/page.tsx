import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getAllNews } from "@/lib/data/news";

export const revalidate = 0;

export default async function AdminNoticiasPage() {
  await requireRole("editor_conteudo", "admin");
  const articles = await getAllNews();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Notícias</h1>
          <p className="text-[13px] text-muted">Matérias publicadas aparecem em /noticias, da mais recente para a mais antiga.</p>
        </div>
        <Link href="/admin/noticias/nova" className="rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-white">
          + Nova notícia
        </Link>
      </div>
      {articles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted">Nenhuma notícia cadastrada.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/admin/noticias/${article.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-primary"
            >
              <div>
                <div className="font-semibold">{article.titulo}</div>
                <div className="text-xs text-muted">
                  {new Date(`${article.dataPublicacao}T00:00:00`).toLocaleDateString("pt-BR")} · por {article.autor}
                </div>
              </div>
              <span
                className={
                  article.status === "publicado"
                    ? "rounded-full bg-[#EDF6EF] px-2.5 py-1 text-[11.5px] font-semibold text-[#2F6B4F]"
                    : "rounded-full bg-[#F0F0F0] px-2.5 py-1 text-[11.5px] font-semibold text-[#555555]"
                }
              >
                {article.status === "publicado" ? "Publicada" : "Rascunho"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
