import { DistrictLogo } from "@/components/DistrictLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-district-border bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-2 md:flex md:h-16 md:items-center md:justify-between md:py-0 md:px-6">
        <div className="mb-2 flex items-center justify-between gap-3 md:mb-0 md:justify-start">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 items-center rounded-md border border-district-border px-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-100 md:hidden"
            aria-label="Abrir menu de navegacao"
          >
            Menu
          </button>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <DistrictLogo />
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
