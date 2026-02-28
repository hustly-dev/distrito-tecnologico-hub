"use client";

import { ReactNode, useState } from "react";
import { Agencia } from "@/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DrawerMobile } from "@/components/DrawerMobile";
import { Chat } from "@/components/Chat";

interface MainLayoutProps {
  agencias: Agencia[];
  activeAgencyId?: string;
  children: ReactNode;
  showGeneralChat?: boolean;
}

export function MainLayout({ agencias, activeAgencyId, children, showGeneralChat = false }: MainLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-district-light">
      <Header onMenuClick={() => setIsDrawerOpen(true)} />

      <DrawerMobile title="Navegacao" isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Sidebar agencias={agencias} activeAgencyId={activeAgencyId} onNavigate={() => setIsDrawerOpen(false)} />
      </DrawerMobile>

      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 grid place-content-center bg-gray-900/60 px-3 md:hidden">
          <div className="w-full max-w-md">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700"
                onClick={() => setIsChatModalOpen(false)}
                aria-label="Fechar chat geral"
              >
                Fechar
              </button>
            </div>
            <Chat title="Chat Geral" botName="Hub Assistente" />
          </div>
        </div>
      )}

      {/* Layout em 3 colunas no desktop e colapso para 1 coluna no mobile. */}
      <main className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-8 pt-24 md:px-6 lg:grid-cols-[250px_minmax(0,1fr)_340px]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Sidebar agencias={agencias} activeAgencyId={activeAgencyId} />
          </div>
        </div>

        <section>{children}</section>

        <aside className="hidden lg:block">
          {showGeneralChat && (
            <div className="sticky top-24">
              <Chat title="Chat Geral" botName="Hub Assistente" />
            </div>
          )}
        </aside>
      </main>

      {showGeneralChat && (
        <button
          type="button"
          onClick={() => setIsChatModalOpen(true)}
          className="fixed bottom-4 right-4 z-30 h-12 rounded-full bg-district-red px-5 text-sm font-semibold text-white shadow-lg md:bottom-6 md:right-6 lg:hidden"
          aria-label="Abrir chat geral"
        >
          Chat Geral
        </button>
      )}
    </div>
  );
}
