import { BadgeStatus } from "@/components/BadgeStatus";
import { Chat } from "@/components/Chat";
import { Tag } from "@/components/Tag";
import { UploadArea } from "@/components/UploadArea";
import { MainLayout } from "@/layouts/MainLayout";
import { agencias, editais, topicos } from "@/mocks/editais";

interface EditalPageProps {
  editalId: string;
}

export function EditalPage({ editalId }: EditalPageProps) {
  const edital = editais.find((item) => item.id === editalId);

  if (!edital) {
    return (
      <MainLayout agencias={agencias}>
        <section className="rounded-mdx border border-dashed border-district-border bg-white p-6">
          <h1 className="text-lg font-semibold text-gray-900">Edital nao encontrado</h1>
          <p className="mt-2 text-sm text-gray-600">Verifique o link e tente novamente.</p>
        </section>
      </MainLayout>
    );
  }

  const agencia = agencias.find((item) => item.id === edital.agenciaId);
  const editalTopicos = topicos.filter((item) => edital.topicos.includes(item.id));

  return (
    <MainLayout agencias={agencias} activeAgencyId={edital.agenciaId}>
      <article className="space-y-4">
        <header className="rounded-mdx border border-district-border bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900">{edital.nome}</h1>
            <BadgeStatus status={edital.status} />
          </div>

          <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <span className="font-medium">Agencia:</span> {agencia?.sigla ?? "N/D"}
            </p>
            <p>
              <span className="font-medium">Publicacao:</span> {edital.dataPublicacao}
            </p>
            <p>
              <span className="font-medium">Prazo final:</span> {edital.dataLimite}
            </p>
          </div>

          <button
            type="button"
            className="mt-4 h-10 rounded-md bg-district-red px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Download do edital (mock)
          </button>
        </header>

        <section className="rounded-mdx border border-district-border bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Descricao</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{edital.descricao}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {editalTopicos.map((topico) => (
              <Tag key={topico.id} label={topico.nome} />
            ))}
          </div>
        </section>

        <section className="rounded-mdx border border-district-border bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Arquivos do edital</h2>
          <ul className="mt-3 space-y-2">
            {edital.arquivos.map((arquivo) => (
              <li
                key={arquivo.id}
                className="flex items-center justify-between rounded-md border border-district-border px-3 py-2 text-sm"
              >
                <span>{arquivo.nome}</span>
                <span className="text-xs text-gray-500">{arquivo.tamanho}</span>
              </li>
            ))}
          </ul>
        </section>

        <Chat
          title="Chat do edital"
          botName="Especialista do Edital"
          initialMessages={[
            {
              id: "msg-1",
              usuario: "Especialista do Edital",
              conteudo: "Use este canal para tirar duvidas sobre requisitos e documentacao.",
              horario: "09:00"
            }
          ]}
        />

        <UploadArea />
      </article>
    </MainLayout>
  );
}
