# InvestDash — Frontend

React + Vite + TypeScript + TailwindCSS v4

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## .env

```
VITE_API_URL=https://seu-backend.vercel.app/api
```

## Funcionalidades

- **Carteira** — adicione Ações BR, FIIs, ETFs, Stocks EUA e Renda Fixa com ticker, quantidade, preço médio e total aportado
- **Cotações** — visualize as cotações atuais dos ativos da carteira (integrar com brapi.dev para dados reais)
- **Juros Simples** — calculadora com período em meses ou anos + aportes mensais/anuais
- **Juros Compostos** — calculadora com período em meses ou anos + aportes mensais/anuais
- **Tema claro/escuro** — alternável pelo ícone ☀️/🌙 no navbar
- **Auth completo** — login, registro, confirmação de e-mail, reset de senha

## Cotações reais (opcional)

Substitua a função `fetchQuotes` em `src/pages/Home.tsx` por:

```ts
import api from "../services/api";

async function fetchQuotes(tickers: string[]) {
  const res = await fetch(
    `https://brapi.dev/api/quote/${tickers.join(",")}?token=SEU_TOKEN`
  );
  const data = await res.json();
  // mapear data.results para o formato Quote
}
```
