# Distrito Tecnologico - Hub Inteligente de Editais

Frontend em `Next.js + React + TypeScript + TailwindCSS`, sem backend e sem integracoes externas.

## Como executar

```bash
npm install
npm run dev
```

## Estrutura

```text
/src
├── app
├── components
├── features
├── hooks
├── layouts
├── mocks
├── types
└── styles
```

## Decisoes arquiteturais

- **Separacao por camadas**: `features` orquestra tela, `components` mantem blocos reutilizaveis, `hooks` concentra regras de estado.
- **Dados mockados locais**: `src/mocks/editais.ts` simula fonte externa para facilitar futura troca por API.
- **Tipagem forte**: interfaces de dominio centralizadas em `src/types`.
- **Responsividade mobile-first**: sidebar vira drawer no mobile, chat geral vira botao flutuante/modal.
