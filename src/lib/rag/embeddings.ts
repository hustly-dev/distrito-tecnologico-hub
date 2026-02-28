const OPENAI_EMBEDDINGS_ENDPOINT = "https://api.openai.com/v1/embeddings";
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

interface OpenAIEmbeddingsResponse {
  data: Array<{
    index: number;
    embedding: number[];
  }>;
}

function getEmbeddingConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;
  return { apiKey, model };
}

async function requestEmbeddings(inputs: string[]): Promise<number[][]> {
  const { apiKey, model } = getEmbeddingConfig();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }

  const response = await fetch(OPENAI_EMBEDDINGS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: inputs,
      encoding_format: "float"
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Falha ao gerar embeddings: ${details}`);
  }

  const data = (await response.json()) as OpenAIEmbeddingsResponse;
  const sorted = [...data.data].sort((a, b) => a.index - b.index);
  return sorted.map((item) => item.embedding);
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const sanitized = texts.map((text) => text.trim()).filter(Boolean);
  if (sanitized.length === 0) return [];

  const batchSize = 50;
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < sanitized.length; i += batchSize) {
    const batch = sanitized.slice(i, i + batchSize);
    const embeddings = await requestEmbeddings(batch);
    allEmbeddings.push(...embeddings);
  }
  return allEmbeddings;
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const [embedding] = await requestEmbeddings([trimmed]);
  return embedding ?? null;
}

export function toPgVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
