import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-[#103427] text-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-4 px-6 py-4">
        <Link href="/pt" className="flex items-center gap-3">
          <img
            src="https://optim.tildacdn.one/tild3166-6538-4637-b234-343136396538/-/cover/212x212/center/center/-/format/webp/BLOCO_1_-_LOGOTIPO.png.webp"
            alt="Logo Rede Sol"
            className="h-11 w-11 rounded-full border border-white/25 bg-white object-cover"
          />
          <div className="font-serif text-lg font-semibold leading-tight">
            Rede Sol
            <small className="block font-sans text-[11px] font-normal opacity-75">
              Assistencia social e saude na Amazonia
            </small>
          </div>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-1 text-[13px]">
          <Link href="/pt" className="rounded-lg px-3 py-1.5 opacity-90 hover:opacity-100">
            Campanhas
          </Link>
          <Link href="/pt#frentes" className="rounded-lg px-3 py-1.5 opacity-90 hover:opacity-100">
            Frentes de acao
          </Link>
          <Link href="/pt/como-funciona" className="rounded-lg px-3 py-1.5 opacity-90 hover:opacity-100">
            Como funciona
          </Link>
          <Link href="/pt/voluntarios" className="rounded-lg px-3 py-1.5 opacity-90 hover:opacity-100">
            Voluntarios
          </Link>
          <Link
            href="/login"
            className="ml-1 rounded-lg border border-white/25 px-3 py-1.5 font-medium opacity-95 transition hover:bg-white/10 hover:opacity-100"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
