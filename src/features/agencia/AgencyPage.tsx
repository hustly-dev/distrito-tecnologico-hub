"use client";

import { useMemo, useState } from "react";
import { CardEdital } from "@/components/CardEdital";
import { MainLayout } from "@/layouts/MainLayout";
import { agencias, editais, topicos } from "@/mocks/editais";
import { EditalStatus } from "@/types";

interface AgencyPageProps {
  agencyId: string;
}

export function AgencyPage({ agencyId }: AgencyPageProps) {
  const [status, setStatus] = useState<EditalStatus | "">("");
  const agencia = agencias.find((item) => item.id === agencyId);

  const editaisAgencia = useMemo(() => {
    return editais.filter((item) => item.agenciaId === agencyId && (status ? item.status === status : true));
  }, [agencyId, status]);

  if (!agencia) {
    return (
      <MainLayout agencias={agencias}>
        <section className="rounded-mdx border border-dashed border-district-border bg-white p-6">
          <h1 className="text-lg font-semibold text-gray-900">Agencia nao encontrada</h1>
          <p className="mt-2 text-sm text-gray-600">Selecione uma agencia valida no menu lateral.</p>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout agencias={agencias} activeAgencyId={agencyId}>
      <section className="space-y-4">
        <header className="rounded-mdx border border-district-border bg-white p-5">
          <h1 className="text-xl font-bold text-gray-900">{agencia.sigla}</h1>
          <p className="mt-1 text-sm text-gray-600">{agencia.descricao}</p>
        </header>

        <div className="max-w-xs">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Filtrar por status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as EditalStatus | "")}
              className="h-11 rounded-mdx border border-district-border px-3 text-sm outline-none focus:border-district-red focus:ring-2 focus:ring-red-200"
              aria-label="Filtrar editais da agencia por status"
            >
              <option value="">Todos</option>
              <option value="aberto">Aberto</option>
              <option value="encerrado">Encerrado</option>
              <option value="em_breve">Em breve</option>
            </select>
          </label>
        </div>

        {editaisAgencia.length === 0 ? (
          <section className="rounded-mdx border border-dashed border-district-border bg-white p-6 text-center">
            <p className="text-sm text-gray-600">Nao ha editais com o filtro atual.</p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {editaisAgencia.map((edital) => (
              <CardEdital
                key={edital.id}
                edital={edital}
                agencia={agencia}
                topicos={topicos.filter((topico) => edital.topicos.includes(topico.id))}
              />
            ))}
          </section>
        )}
      </section>
    </MainLayout>
  );
}
