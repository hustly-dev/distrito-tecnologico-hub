import Link from "next/link";
import { Agencia, Edital, Topico } from "@/types";
import { BadgeStatus } from "@/components/BadgeStatus";
import { Tag } from "@/components/Tag";

interface CardEditalProps {
  edital: Edital;
  agencia?: Agencia;
  topicos: Topico[];
}

export function CardEdital({ edital, agencia, topicos }: CardEditalProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-mdx border border-district-border bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{edital.nome}</h3>
        <BadgeStatus status={edital.status} />
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Agencia:</span> {agencia?.sigla ?? "N/D"}
        </p>
        <p>
          <span className="font-medium text-gray-700">Publicacao:</span> {edital.dataPublicacao}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-gray-600">{edital.resumo}</p>

      <div className="flex flex-wrap gap-2">
        {topicos.map((topico) => (
          <Tag label={topico.nome} key={topico.id} />
        ))}
      </div>

      <div className="mt-auto pt-2">
        <Link
          href={`/edital/${edital.id}`}
          className="inline-flex h-10 items-center rounded-md bg-district-red px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
