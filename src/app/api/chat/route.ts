import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateEmbedding, toPgVectorLiteral } from "@/lib/rag/embeddings";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages?: ChatTurn[];
  botName?: string;
  noticeId?: string;
}

type RagSearchLevel = "baixo" | "medio" | "alto";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function buildSystemPrompt(botName?: string) {
  return `
Voce e ${botName ?? "um assistente"} no Hub Inteligente de Editais.
Responda sempre em portugues do Brasil, com objetividade e linguagem clara.
Contexto principal:
- apoiar usuarios na leitura de editais, prazos, requisitos e documentacao;
- sugerir proximos passos praticos;
- sinalizar quando faltar informacao.
Evite inventar dados e, em caso de duvida, deixe isso explicito.
`.trim();
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function rankChunks(question: string, chunks: Array<{ content: string; fileName: string }>, topK = 6) {
  const tokens = tokenize(question);
  if (tokens.length === 0) return chunks.slice(0, topK);

  return [...chunks]
    .map((chunk) => {
      const lower = chunk.content.toLowerCase();
      const score = tokens.reduce((acc, token) => acc + (lower.includes(token) ? 1 : 0), 0);
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function clipText(value: string, maxChars = 1100) {
  return value.length <= maxChars ? value : `${value.slice(0, maxChars)}...`;
}

function getRagConfig(level: RagSearchLevel) {
  if (level === "baixo") return { topK: 4, minRank: 0.16 };
  if (level === "alto") return { topK: 12, minRank: 0.03 };
  return { topK: 8, minRank: 0.08 };
}

export async function POST(request: Request) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Chave GROQ_API_KEY nao configurada no servidor." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as ChatRequestBody;
    const incomingMessages = payload.messages ?? [];
    if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
      return NextResponse.json({ error: "Envie ao menos uma mensagem." }, { status: 400 });
    }

    const history = incomingMessages.slice(-12).map((message) => ({
      role: message.role,
      content: message.content
    }));

    const lastUserQuestion = [...incomingMessages].reverse().find((message) => message.role === "user")?.content ?? "";
    let ragContext = "";
    let ragSources: string[] = [];
    let hasRetrievedContext = false;

    if (payload.noticeId) {
      const supabase = await createSupabaseServerClient();
      const ragSettingsResult = await supabase
        .from("rag_settings")
        .select("search_level,use_legacy_fallback")
        .eq("id", true)
        .maybeSingle();

      const searchLevel = (ragSettingsResult.data?.search_level as RagSearchLevel | undefined) ?? "medio";
      const useLegacyFallback = ragSettingsResult.data?.use_legacy_fallback ?? true;
      const ragConfig = getRagConfig(searchLevel);
      const queryEmbedding = process.env.OPENAI_API_KEY
        ? await generateEmbedding(lastUserQuestion).catch(() => null)
        : null;

      const [noticeResult, hybridResult] = await Promise.all([
        supabase
          .from("notices")
          .select("id,title,summary,description")
          .eq("id", payload.noticeId)
          .maybeSingle(),
        supabase.rpc("search_notice_chunks_hybrid", {
          p_notice_id: payload.noticeId,
          p_query: lastUserQuestion,
          p_query_embedding: queryEmbedding ? toPgVectorLiteral(queryEmbedding) : null,
          p_match_count: ragConfig.topK
        })
      ]);

      const notice = noticeResult.data;
      let topChunks: Array<{ content: string; fileName: string }> = [];

      if (!hybridResult.error && hybridResult.data) {
        topChunks = (hybridResult.data as Array<{ content: string; file_name: string; rank?: number }>).filter((row) => {
          if (!lastUserQuestion.trim()) return true;
          if (typeof row.rank !== "number") return true;
          return row.rank >= ragConfig.minRank;
        }).map((row) => ({
          content: row.content,
          fileName: row.file_name ?? "arquivo"
        }));
      }

      if (topChunks.length === 0 && useLegacyFallback) {
        const ftsResult = await supabase.rpc("search_notice_chunks_fts", {
          p_notice_id: payload.noticeId,
          p_query: lastUserQuestion,
          p_match_count: ragConfig.topK
        });

        if (!ftsResult.error && ftsResult.data) {
          topChunks = (ftsResult.data as Array<{ content: string; file_name: string }>).map((row) => ({
            content: row.content,
            fileName: row.file_name ?? "arquivo"
          }));
        }
      }

      if (topChunks.length === 0 && useLegacyFallback) {
        // Fallback final: recuperacao lexical local em memoria, mesmo sem match FTS.
        const { data: chunkRows } = await supabase
          .from("document_chunks")
          .select("content,documents!inner(file_name,notice_id)")
          .eq("documents.notice_id", payload.noticeId)
          .limit(300);
        const rawChunks =
          chunkRows?.map((row) => {
            const documentsData = Array.isArray(row.documents) ? row.documents[0] : row.documents;
            return {
              content: row.content as string,
              fileName: (documentsData?.file_name as string | undefined) ?? "arquivo"
            };
          }) ?? [];
        topChunks = rankChunks(lastUserQuestion, rawChunks, 6);
      }

      hasRetrievedContext = topChunks.length > 0;
      ragSources = Array.from(new Set(topChunks.map((chunk) => chunk.fileName)));
      const contexts = topChunks.map((chunk, index) => ({
        citation: `[${index + 1}]`,
        fileName: chunk.fileName,
        content: clipText(chunk.content, 1100)
      }));

      ragContext = [
        notice
          ? `Resumo do edital:\nTitulo: ${notice.title}\nResumo: ${notice.summary}\nDescricao: ${notice.description}\n`
          : "",
        ...contexts.map((chunk) => `Trecho ${chunk.citation} (${chunk.fileName}):\n${chunk.content}`)
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `${buildSystemPrompt(payload.botName)}
${hasRetrievedContext
  ? `Use estritamente o contexto recuperado quando ele existir.
Se nao houver contexto suficiente para responder com seguranca, diga explicitamente.
Sempre que possivel, cite de forma resumida os arquivos base da resposta.
Ao usar o contexto RAG, adicione citacoes curtas no formato [1], [2] ao fim das frases principais.`
  : `Quando nao houver contexto RAG suficiente, use um modo simples de assistente (sem inventar fatos), explicando que a resposta pode precisar de validacao no edital oficial.`}`
          },
          ...(ragContext ? [{ role: "system", content: `Contexto RAG:\n${ragContext}` }] : []),
          ...history
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Falha ao consultar IA.", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content as string | undefined;
    if (!content) {
      return NextResponse.json({ error: "Resposta da IA vazia." }, { status: 502 });
    }

    return NextResponse.json({ content, sources: ragSources });
  } catch {
    return NextResponse.json({ error: "Erro inesperado ao processar chat." }, { status: 500 });
  }
}
