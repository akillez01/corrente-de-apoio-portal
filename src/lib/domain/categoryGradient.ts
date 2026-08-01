const CATEGORY_GRADIENT: Record<string, string> = {
  Saúde: "linear-gradient(160deg,#3A7A5C,#1B3A2D)",
  Moradia: "linear-gradient(160deg,#8A6A2F,#4D3A15)",
  default: "linear-gradient(160deg,#5FA37E,#2F6B4F)",
};

export function categoryGradient(categoria: string) {
  return CATEGORY_GRADIENT[categoria] ?? CATEGORY_GRADIENT.default;
}
