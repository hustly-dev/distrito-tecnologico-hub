"use client";

import { useEffect, useRef, useState } from "react";
import { MensagemChat } from "@/types";

interface UseChatOptions {
  initialMessages?: MensagemChat[];
  botName?: string;
}

export function useChat(options?: UseChatOptions) {
  const [messages, setMessages] = useState<MensagemChat[]>(options?.initialMessages ?? []);
  const [isReplying, setIsReplying] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = (text: string, author = "Voce") => {
    const content = text.trim();
    if (!content) return;

    const now = new Date();
    const horario = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        usuario: author,
        conteudo: content,
        horario
      }
    ]);

    setIsReplying(true);
    window.setTimeout(() => {
      const botNow = new Date();
      const botHorario = botNow.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          usuario: options?.botName ?? "Assistente",
          conteudo: "Mensagem recebida. Em breve retornamos com orientacoes sobre o edital.",
          horario: botHorario
        }
      ]);
      setIsReplying(false);
    }, 900);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, isReplying]);

  return {
    messages,
    isReplying,
    sendMessage,
    containerRef
  };
}
