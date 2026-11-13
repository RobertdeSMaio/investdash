# InvestDash — Frontend

React + Vite + TypeScript + TailwindCSS v4

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Funcionalidades

- **Carteira** — adicione Ações BR, FIIs, ETFs, Stocks EUA e Renda Fixa com ticker, quantidade, preço médio e total aportado
- **Cotações** — brapi.dev via backend (`/api/market/quote`, que guarda o token), uma requisição por ticker com cache de 60s; câmbio PTAX do Banco Central para converter Stocks EUA
- **Acompanhamento** — desempenho da carteira vs CDI (base 100, períodos 1M/3M/6M/1A), evolução diária registrada do patrimônio, destaques do dia e rastreio por ativo
- **Análise** — alocação por classe, peso por ativo, concentração, nota de diversificação, comparação com o perfil e pontos de atenção
- **Sugestões** — assistente por regras (sem IA externa): questionário de perfil, resumo, diversificação, rebalanceamento e plano de aporte por classe; conteúdo educativo
- **Juros Simples** — calculadora com período em meses ou anos + aportes mensais/anuais
- **Juros Compostos** — calculadora com período em meses ou anos + aportes mensais/anuais
- **Tema claro/escuro** — alternável pelo ícone ☀️/🌙 no navbar
- **Auth completo** — login, registro, confirmação de e-mail, reset de senha

## Como os cálculos funcionam

Toda a matemática fica em `src/utils/interest.ts` e é simulada mês a mês (a mesma fonte alimenta cards, gráficos, tabela e comparação):

- **Taxa** — vale na unidade do período: "Meses" → % ao mês; "Anos" → % ao ano. Taxa anual vira mensal por equivalência `(1+r)^(1/12)−1` nos compostos e por proporcionalidade `r/12` nos simples.
- **Juros compostos** — incidem sobre o saldo acumulado (principal + aportes + juros).
- **Juros simples** — incidem só sobre o capital aportado (principal + aportes), nunca sobre juros passados.
- **Aportes** — entram no final do mês (mensal) ou no final de cada 12º mês (anual) e passam a render a partir do mês seguinte.

## Segurança

- **Sessão** — access token só em memória; refresh token em `sessionStorage` (a sessão termina ao fechar a aba). Logout automático após 30 min de inatividade e revogação do refresh token no servidor ao sair.
- **Domínios permitidos** — a CSP em `vercel.json` só libera conexões para o próprio site, `investdash-back.vercel.app` e `api.bcb.gov.br`. Qualquer outro domínio é bloqueado pelo navegador. Ao trocar o backend de domínio, atualize o `connect-src`.
- **Cabeçalhos** — HSTS, anti-iframe (clickjacking), `nosniff`, `Referrer-Policy: no-referrer` e `Permissions-Policy` restritiva.
- **Segredos** — variáveis `VITE_*` são públicas (vão no JavaScript). Nunca coloque tokens nelas; segredos ficam no backend.
- **Links por e-mail** — tokens de confirmação e redefinição de senha são removidos da URL logo após a leitura.
