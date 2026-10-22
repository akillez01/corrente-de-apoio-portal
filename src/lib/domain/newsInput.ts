import { isSafeLocalImagePath } from "@/lib/types/siteContent";

export interface NewsInput {
  titulo: string;
  resumo: string;
  corpo: string;
  imageUrl: string;
  imageAlt: string;
  dataPublicacao: string;
  status: "rascunho" | "publicado";
}

// Valida o corpo enviado pelo editor de notícias; devolve null se algo for inválido.
export function parseNewsInput(body: unknown): NewsInput | null {
  if (typeof body !== "object" || body === null) return null;
  const get = (key: string) => {
    const value = Reflect.get(body, key);
    return typeof value === "string" ? value.trim() : "";
  };
  const input = {
    titulo: get("titulo"),
    resumo: get("resumo"),
    corpo: get("corpo"),
    imageUrl: get("imageUrl"),
    imageAlt: get("imageAlt"),
    dataPublicacao: get("dataPublicacao"),
    status: get("status") as NewsInput["status"],
  };
  const valid =
    input.titulo && input.titulo.length <= 160 &&
    input.resumo && input.resumo.length <= 400 &&
    input.corpo && input.corpo.length <= 20_000 &&
    (input.imageUrl === "" || isSafeLocalImagePath(input.imageUrl)) &&
    (input.imageUrl === "" || input.imageAlt) &&
    input.imageAlt.length <= 300 &&
    /^\d{4}-\d{2}-\d{2}$/.test(input.dataPublicacao) &&
    (input.status === "rascunho" || input.status === "publicado");
  return valid ? input : null;
}
