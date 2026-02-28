"use client";

import { useEffect, useMemo, useState } from "react";
import { CardEdital } from "@/components/CardEdital";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { useEditaisFiltro } from "@/hooks/useEditaisFiltro";
import { agencias, editais, topicos } from "@/mocks/editais";
import { EditalStatus } from "@/types";
import { MainLayout } from "@/layouts/MainLayout";

export function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [agenciaId, setAgenciaId] = useState("");
  const [status, setStatus] = useState<EditalStatus | "">("");
  const [topicoId, setTopicoId] = useState("");

  useEffect(() => {
    // Simula consumo de API para preparar o front para futura integracao.
    const timer = window.setTimeout(() => setIsLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const filtrados = useEditaisFiltro({
    editais,
    agencias,
    topicos,
    filtros: { termoBusca, agenciaId, status, topicoId }
  });

  const agenciaOptions = useMemo(
    () => agencias.map((agencia) => ({ value: agencia.id, label: `${agencia.sigla} - ${agencia.nome}` })),
    []
  );
  const topicoOptions = useMemo(() => topicos.map((topico) => ({ value: topico.id, label: topico.nome })), []);

  return (
    <MainLayout agencias={agencias} showGeneralChat>
      <div className="space-y-4">
        <SearchInput value={termoBusca} onChange={setTermoBusca} />
        <FilterBar
          agenciaOptions={agenciaOptions}
          topicoOptions={topicoOptions}
          statusOptions={[
            { value: "aberto", label: "Aberto" },
            { value: "encerrado", label: "Encerrado" },
            { value: "em_breve", label: "Em breve" }
          ]}
          selectedAgencia={agenciaId}
          selectedStatus={status}
          selectedTopico={topicoId}
          onAgenciaChange={setAgenciaId}
          onStatusChange={setStatus}
          onTopicoChange={setTopicoId}
        />

        {isLoading ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Carregando editais">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-mdx border border-district-border bg-white/70"
              />
            ))}
          </section>
        ) : filtrados.length === 0 ? (
          <section className="rounded-mdx border border-dashed border-district-border bg-white p-6 text-center">
            <h2 className="text-base font-semibold text-gray-900">Nenhum edital encontrado</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ajuste os filtros para visualizar editais disponiveis no hub.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {filtrados.map((edital) => (
              <CardEdital
                key={edital.id}
                edital={edital}
                agencia={agencias.find((agencia) => agencia.id === edital.agenciaId)}
                topicos={topicos.filter((topico) => edital.topicos.includes(topico.id))}
              />
            ))}
          </section>
        )}
      </div>
    </MainLayout>
  );
}
