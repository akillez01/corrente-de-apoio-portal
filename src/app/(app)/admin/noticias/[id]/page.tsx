import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getNewsById } from "@/lib/data/news";
import { NewsEditorForm } from "@/components/admin/NewsEditorForm";

export const revalidate = 0;

export default async function EditarNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("editor_conteudo", "admin");
  const article = id === "nova" ? null : await getNewsById(id);
  if (id !== "nova" && !article) notFound();

  return (
    <div className="mx-auto max-w-[820px]">
      <Link href="/admin/noticias" className="text-[13px] text-muted hover:text-ink">
        ← Voltar para notícias
      </Link>
      <h1 className="mb-4 mt-2 font-serif text-2xl font-semibold">{article ? "Editar notícia" : "Nova notícia"}</h1>
      {article?.status === "publicado" && (
        <p className="mb-4 text-[13px]">
          <Link href={`/pt/noticias/${article.slug}`} className="text-primary underline">
            Ver no site
          </Link>
        </p>
      )}
      <NewsEditorForm key={article?.atualizadoEm ?? "nova"} article={article} />
    </div>
  );
}
