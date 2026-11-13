import type { AssetType } from "../types";
import { ASSET_LABELS, fmtBRL, fmtPct, fmtWeight } from "./assetMeta";
import {
  allocationByClass,
  concentration,
  contributionPlan,
  describeTotals,
  diversificationScore,
  insights,
  PROFILE_LABELS,
  rebalancePlan,
  scoreLabel,
  TARGET_ALLOCATION,
  totalsOf,
  type Position,
  type Profile,
} from "./portfolioAnalysis";

export type Block =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

export type Intent =
  | { type: "perfil" }
  | { type: "aporte"; amount: number | null }
  | { type: "rebalancear" }
  | { type: "diversificacao" }
  | { type: "riscos" }
  | { type: "classe"; asset: AssetType }
  | { type: "resumo" }
  | { type: "ajuda" }
  | { type: "desconhecido" };

export interface BotContext {
  positions: Position[];
  profile: Profile | null;
}

export const MAX_INPUT = 300;
const MAX_AMOUNT = 1_000_000_000_000;

export const QUESTIONS: { text: string; options: string[] }[] = [
  {
    text: "Por quanto tempo você pretende deixar o dinheiro investido?",
    options: ["Menos de 2 anos", "De 2 a 5 anos", "Mais de 5 anos"],
  },
  {
    text: "Se sua carteira caísse 20% em um mês, o que você faria?",
    options: ["Venderia para evitar mais perdas", "Esperaria recuperar", "Aproveitaria para comprar mais"],
  },
  {
    text: "Qual é o seu principal objetivo?",
    options: ["Preservar o patrimônio", "Equilibrar segurança e crescimento", "Maximizar o crescimento"],
  },
];

export const QUICK_ACTIONS: { label: string; text: string }[] = [
  { label: "Resumo da carteira", text: "resumo" },
  { label: "Diversificação", text: "diversificação" },
  { label: "Como rebalancear?", text: "rebalancear" },
  { label: "Onde aportar R$ 1.000?", text: "aportar 1000" },
  { label: "Pontos de atenção", text: "riscos" },
  { label: "Refazer perfil", text: "refazer perfil" },
];

const CLASS_NOTES: Record<AssetType, string> = {
  acao: "Ações representam participação em empresas: oscilam mais, mas têm maior potencial de crescimento e dividendos no longo prazo.",
  fii: "Fundos imobiliários costumam distribuir rendimentos mensais. Diversificar entre segmentos (logística, lajes, recebíveis, shoppings) reduz o risco de vacância.",
  etf: "ETFs replicam índices e dão diversificação imediata com custo baixo.",
  stock: "Ativos no exterior reduzem a dependência da economia brasileira e trazem exposição ao dólar.",
  renda_fixa: "A renda fixa é a base da carteira e o lugar da reserva de emergência, de preferência com liquidez diária.",
};

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function parseAmount(text: string): number | null {
  const m = /(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s*(mil|k)?\b/i.exec(text);
  if (!m) return null;
  let value = Number(m[1].replace(/\./g, "") + (m[2] ? `.${m[2]}` : ""));
  if (m[3]) value *= 1000;
  return Number.isFinite(value) && value > 0 && value <= MAX_AMOUNT ? value : null;
}

export function parseIntent(raw: string): Intent {
  const text = normalize(raw.slice(0, MAX_INPUT));
  const amount = parseAmount(text);

  if (/perfil|questionario|refazer/.test(text)) return { type: "perfil" };
  if (/aport|investir|aplicar|onde colocar|onde por/.test(text)) return { type: "aporte", amount };
  if (/rebalanc|realoc|reequilibr/.test(text)) return { type: "rebalancear" };
  if (/divers|concentr/.test(text)) return { type: "diversificacao" };
  if (/risco|atencao|alerta|problema|cuidado/.test(text)) return { type: "riscos" };
  if (/\bfiis?\b|fundos? imobiliario/.test(text)) return { type: "classe", asset: "fii" };
  if (/renda fixa|tesouro|\bcdb|\blci|\blca|reserva/.test(text)) return { type: "classe", asset: "renda_fixa" };
  if (/\betfs?\b/.test(text)) return { type: "classe", asset: "etf" };
  if (/stock|exterior|eua|internacional|dolar/.test(text)) return { type: "classe", asset: "stock" };
  if (/\bacao\b|\bacoes\b/.test(text)) return { type: "classe", asset: "acao" };
  if (/resumo|como esta|visao geral|patrimonio|minha carteira/.test(text)) return { type: "resumo" };
  if (/ajuda|^oi\b|^ola\b|menu|o que voce/.test(text)) return { type: "ajuda" };
  return { type: "desconhecido" };
}

const HELP: Block[] = [
  { kind: "text", text: "Posso ajudar com:" },
  {
    kind: "list",
    items: [
      "Resumo da carteira",
      "Diversificação e concentração",
      "Como rebalancear de acordo com o seu perfil",
      "Onde aportar um valor (ex.: \"aportar 2.500\")",
      "Pontos de atenção",
      "Informações por classe (ações, FIIs, ETFs, exterior, renda fixa)",
    ],
  },
];

export function needsProfile(intent: Intent): boolean {
  return intent.type === "aporte" || intent.type === "rebalancear";
}

export function reply(intent: Intent, ctx: BotContext): Block[] {
  const { positions, profile } = ctx;

  if (intent.type === "ajuda") return HELP;
  if (intent.type === "desconhecido") {
    return [{ kind: "text", text: "Não entendi a pergunta." }, ...HELP];
  }
  if (intent.type === "classe") {
    return classReply(intent.asset, positions, profile);
  }
  if (!positions.length) {
    return [{ kind: "text", text: "Sua carteira ainda está vazia. Cadastre seus ativos na aba Carteira para que eu possa analisá-la." }];
  }

  const totals = totalsOf(positions);

  switch (intent.type) {
    case "resumo": {
      const score = diversificationScore(positions);
      const biggest = [...allocationByClass(positions)].sort((a, b) => b.weight - a.weight)[0];
      return [
        { kind: "text", text: describeTotals(totals) },
        {
          kind: "list",
          items: [
            `Diversificação: ${score}/100 (${scoreLabel(score).toLowerCase()})`,
            `Maior classe: ${ASSET_LABELS[biggest.type]} com ${fmtWeight(biggest.weight)}`,
            profile ? `Perfil: ${PROFILE_LABELS[profile]}` : "Perfil ainda não definido",
          ],
        },
      ];
    }

    case "diversificacao": {
      const score = diversificationScore(positions);
      const c = concentration(positions);
      const classes = allocationByClass(positions).filter((s) => s.weight >= 0.02);
      const related = insights(positions, profile).filter((i) =>
        ["concentracao-alta", "concentracao-media", "poucas-classes", "poucas-acoes", "poucos-fiis"].includes(i.id),
      );
      return [
        { kind: "text", text: `Sua nota de diversificação é ${score}/100 (${scoreLabel(score).toLowerCase()}).` },
        {
          kind: "list",
          items: [
            `Classes com peso relevante: ${classes.map((s) => ASSET_LABELS[s.type]).join(", ") || "nenhuma"}`,
            `Maior posição: ${c.top?.ticker ?? "—"} com ${fmtWeight(c.topWeight)}`,
            `As 3 maiores posições somam ${fmtWeight(c.top3Weight)}`,
            `Equivale a ${c.effectiveN.toFixed(1).replace(".", ",")} ativos de mesmo peso`,
          ],
        },
        ...(related.length
          ? [{ kind: "list" as const, items: related.map((i) => `${i.title}: ${i.detail}`) }]
          : [{ kind: "text" as const, text: "Não encontrei concentrações preocupantes." }]),
      ];
    }

    case "riscos": {
      const list = insights(positions, profile).slice(0, 8);
      return list.length
        ? [
            { kind: "text", text: "Estes são os pontos que merecem atenção:" },
            { kind: "list", items: list.map((i) => `${i.title}: ${i.detail}`) },
          ]
        : [{ kind: "text", text: "Não encontrei pontos de atenção relevantes na carteira." }];
    }

    case "rebalancear": {
      if (!profile) return [];
      const plan = rebalancePlan(positions, profile);
      const tolerance = totals.current * 0.01;
      return [
        { kind: "text", text: `Comparando com a alocação de referência do perfil ${PROFILE_LABELS[profile].toLowerCase()}:` },
        {
          kind: "table",
          head: ["Classe", "Atual", "Alvo", "Ajuste"],
          rows: plan.map((l) => [
            ASSET_LABELS[l.type],
            fmtWeight(l.currentWeight),
            fmtWeight(l.targetWeight),
            Math.abs(l.diff) < tolerance ? "Ok" : l.diff > 0 ? `+ ${fmtBRL(l.diff)}` : `− ${fmtBRL(-l.diff)}`,
          ]),
        },
        {
          kind: "text",
          text: "Prefira corrigir os desvios com novos aportes nas classes abaixo do alvo. Vender para rebalancear pode gerar imposto de renda sobre o lucro.",
        },
      ];
    }

    case "aporte": {
      if (!profile) return [];
      if (intent.amount === null) {
        return [{ kind: "text", text: "Qual valor você pretende aportar? Ex.: \"aportar 2.000\"." }];
      }
      const plan = contributionPlan(positions, profile, intent.amount);
      const newTotal = totals.current + intent.amount;
      const slices = allocationByClass(positions);
      return [
        {
          kind: "text",
          text: `Para aportar ${fmtBRL(intent.amount)} aproximando a carteira do perfil ${PROFILE_LABELS[profile].toLowerCase()}:`,
        },
        {
          kind: "table",
          head: ["Classe", "Valor", "Peso depois"],
          rows: plan.map((p) => {
            const current = slices.find((s) => s.type === p.type)?.value ?? 0;
            return [ASSET_LABELS[p.type], fmtBRL(p.amount), fmtWeight((current + p.amount) / newTotal)];
          }),
        },
        {
          kind: "text",
          text: "A escolha dos ativos dentro de cada classe é sua: prefira os que você já estudou e que têm peso menor na carteira.",
        },
      ];
    }

    default:
      return HELP;
  }
}

function classReply(asset: AssetType, positions: Position[], profile: Profile | null): Block[] {
  const slice = allocationByClass(positions).find((s) => s.type === asset)!;
  const items = positions.filter((p) => p.type === asset).sort((a, b) => b.weight - a.weight);
  const facts = [
    `Peso na carteira: ${fmtWeight(slice.weight)}${profile ? ` (referência do perfil: ${fmtWeight(TARGET_ALLOCATION[profile][asset])})` : ""}`,
    `Ativos: ${items.length ? items.map((p) => p.ticker).join(", ") : "nenhum"}`,
  ];
  if (items.length) {
    const cost = items.reduce((s, p) => s + p.cost, 0);
    facts.push(`Resultado da classe: ${fmtBRL(slice.pl)} (${fmtPct(cost > 0 ? (slice.pl / cost) * 100 : 0)})`);
  }
  return [
    { kind: "text", text: `${ASSET_LABELS[asset]}:` },
    { kind: "list", items: facts },
    { kind: "text", text: CLASS_NOTES[asset] },
  ];
}
