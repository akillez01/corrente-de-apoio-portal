import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-header text-white">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-4 px-6 py-4">
        <Link href="/pt" className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#D9A441,#a87a1f)] font-serif text-lg font-bold text-header">
            ✦
          </div>
          <div className="font-serif text-lg font-semibold leading-tight">
            Corrente de Apoio
            <small className="block font-sans text-[11px] font-normal opacity-70">
              Sistema de apoio social · ICEFLU
            </small>
          </div>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-1 text-[13px]">
          <Link href="/pt" className="rounded-lg px-3 py-1.5 opacity-90 hover:opacity-100">
            Campanhas
          </Link>
          <Link href="/pt/como-funciona" className="rounded-lg px-3 py-1.5 opacity-90 hover:opacity-100">
            Como funciona
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
