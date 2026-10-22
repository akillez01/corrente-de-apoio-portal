import Lenis from "lenis";

// Camada de movimento do portal: scroll suave (Lenis) + reveals de entrada
// (IntersectionObserver) + navbar solida ao rolar. Adaptado do "Guia de
// Movimento" de outro projeto do Achilles, sem as pecas pesadas (abertura em
// canvas, cursor customizado, galeria pinada) — nao fazem sentido para um
// portal de doacao/voluntariado, onde a prioridade e clareza e conversao.

let lenis: Lenis | null = null;
let revealObserver: IntersectionObserver | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
let navScrollHandler: (() => void) | null = null;

function ensureLenis() {
  if (lenis || typeof window === "undefined") return;
  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    autoRaf: true,
    // honra prefers-reduced-motion automaticamente (lerp vira 1:1, sem inercia)
    respectReducedMotion: true,
  });
}

// Revela elementos marcados com data-motion ao entrarem na viewport.
// data-motion="reveal" -> fade + subida
// data-motion="mask"   -> fade + clip-path
// data-motion="zoom"   -> fade + leve zoom-in
function buildReveals() {
  if (typeof window === "undefined") return;
  revealObserver?.disconnect();

  const els = document.querySelectorAll<HTMLElement>("[data-motion]:not(.visible)");
  if (els.length === 0) return;

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
  );

  els.forEach((el) => revealObserver?.observe(el));

  // Rede de seguranca: se por algum motivo o observer nao disparar, garante
  // que nada fique invisivel pra sempre.
  if (fallbackTimer) clearTimeout(fallbackTimer);
  fallbackTimer = setTimeout(() => {
    document.querySelectorAll("[data-motion]").forEach((el) => el.classList.add("visible"));
  }, 6000);
}

// Adiciona .scrolled em elementos .js-nav quando a pagina rola, pra dar
// solidez/sombra na navbar (ela nasce translucida sobre o hero).
function buildChrome() {
  if (typeof window === "undefined") return;
  const nav = document.querySelector<HTMLElement>(".js-nav");
  if (!nav) return;

  if (navScrollHandler) window.removeEventListener("scroll", navScrollHandler);
  navScrollHandler = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  navScrollHandler();
  window.addEventListener("scroll", navScrollHandler, { passive: true });
}

export function initMotion() {
  ensureLenis();
  buildChrome();
  buildReveals();
}

// Chamar apos navegacao client-side (layout do App Router persiste entre
// rotas, entao os elementos [data-motion] da pagina nova precisam ser
// re-escaneados).
export function refreshMotion() {
  buildChrome();
  buildReveals();
  lenis?.resize();
}

export function scrollToMotion(target: string | HTMLElement) {
  lenis?.scrollTo(target);
}
