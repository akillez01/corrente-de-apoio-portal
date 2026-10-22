// Opções dos cadastros públicos de projetos ("Projetar") e pontos ("Integrar").

export const APOIOS_PROJETO = [
  "Voluntários",
  "Recursos financeiros",
  "Materiais ou equipamentos",
  "Espaço",
  "Divulgação",
  "Orientação técnica",
] as const;

export const APOIO_LABELS_EN: Record<string, string> = {
  Voluntários: "Volunteers",
  "Recursos financeiros": "Financial resources",
  "Materiais ou equipamentos": "Materials or equipment",
  Espaço: "Space",
  Divulgação: "Outreach",
  "Orientação técnica": "Technical guidance",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Aceita URL http(s) ou @perfil do Instagram; devolve null se não for nenhum dos dois.
export function normalizeLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^@[A-Za-z0-9._]{1,30}$/.test(trimmed)) return `https://instagram.com/${trimmed.slice(1)}`;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
