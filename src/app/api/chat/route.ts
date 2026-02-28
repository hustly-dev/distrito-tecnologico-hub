import { NextResponse } from "next/server";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages?: ChatTurn[];
  botName?: string;
}

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
          { role: "system", content: buildSystemPrompt(payload.botName) },
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

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Erro inesperado ao processar chat." }, { status: 500 });
  }
}
