import Link from "next/link";
import { Agencia } from "@/types";

interface SidebarProps {
  agencias: Agencia[];
  activeAgencyId?: string;
  onNavigate?: () => void;
}

export function Sidebar({ agencias, activeAgencyId, onNavigate }: SidebarProps) {
  return (
    <aside className="rounded-mdx border border-district-border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Agencias</h2>
      <nav aria-label="Menu lateral de agencias" className="space-y-2">
        <Link
          href="/hub"
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Todos os editais
        </Link>
        {agencias.map((agencia) => (
          <Link
            href={`/agencia/${agencia.id}`}
            onClick={onNavigate}
            key={agencia.id}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
              activeAgencyId === agencia.id
                ? "bg-red-50 text-district-red dark:bg-red-950/40"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            {agencia.sigla}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
