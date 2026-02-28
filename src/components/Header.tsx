import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-district-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 items-center rounded-md border border-district-border px-3 text-sm font-medium text-gray-700 md:hidden"
            aria-label="Abrir menu de navegacao"
          >
            Menu
          </button>
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-content-center rounded-md bg-district-red text-xs font-bold text-white">
              DT
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Distrito Tecnologico</p>
              <p className="text-xs text-gray-500">Hub Inteligente de Editais</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
