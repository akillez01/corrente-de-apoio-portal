export function SiteFooter() {
  return (
    <footer className="bg-[#0F2D23] px-6 py-10 text-white">
      <div className="mx-auto max-w-[1140px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-serif text-xl font-semibold">Rede Sol</div>
            <p className="mt-1.5 max-w-[420px] text-[12.5px] text-white/80">
              Apoio comunitario para saude, logistica e promocao social em comunidades da
              floresta com acesso fluvial.
            </p>
          </div>
          <div className="text-[12.5px]">
            <div>(31) 98861-2313</div>
            <a className="mt-1 block underline-offset-2 hover:underline" href="mailto:as.social.iceflu@gmail.com">
              as.social.iceflu@gmail.com
            </a>
          </div>
        </div>
        <div className="mt-6 border-t border-white/15 pt-4 text-[11.5px] text-white/75">
          Todos os direitos reservados © 2026 · Rede Sol
        </div>
      </div>
    </footer>
  );
}
