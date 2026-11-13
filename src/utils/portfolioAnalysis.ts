import type { AssetType, PortfolioAsset, Quote } from "../types";
import { ASSET_LABELS, ASSET_TYPES, fmtBRL, fmtPct, fmtWeight } from "./assetMeta";

export type Profile = "conservador" | "moderado" | "arrojado";

export const PROFILE_LABELS: Record<Profile, string> = {
  conservador: "Conservador",
  moderado: "Moderado",
  arrojado: "Arrojado",
};

export const TARGET_ALLOCATION: Record<Profile, Record<AssetType, number>> = {
  conservador: { renda_fixa: 0.7, fii: 0.1, acao: 0.1, etf: 0.05, stock: 0.05 },
  moderado: { renda_fixa: 0.45, fii: 0.15, acao: 0.2, etf: 0.1, stock: 0.1 },
  arrojado: { renda_fixa: 0.2, fii: 0.15, acao: 0.35, etf: 0.15, stock: 0.15 },
};

export interface Position extends PortfolioAsset {
  cost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPct: number;
  weight: number;
  dayChangePct: number | null;
}

export interface Totals {
  cost: number;
  current: number;
  pl: number;
  plPct: number;
  contributions: number;
  count: number;
}

export interface ClassSlice {
  type: AssetType;
  value: number;
  weight: number;
  count: number;
  pl: number;
}

export interface Concentration {
  top: Position | null;
  topWeight: number;
  top3Weight: number;
  hhi: number;
  effectiveN: number;
}

export type Severity = "info" | "atencao" | "alerta";

export interface Insight {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}

export interface RebalanceLine {
  type: AssetType;
  current: number;
  currentWeight: number;
  targetWeight: number;
  diff: number;
}

export function buildPositions(
  assets: PortfolioAsset[],
  quotes: Record<string, Quote>,
  usdBrl: number | null,
): Position[] {
  const base = assets.map((a) => {
    const q = quotes[a.ticker];
    const fx = q?.currency === "USD" ? usdBrl : 1;
    const price = q && fx ? q.price * fx : undefined;
    const cost = a.avgPrice * a.quantity;
    const currentValue = price !== undefined ? price * a.quantity : cost;
    const profitLoss = currentValue - cost;
    return {
      ...a,
      currentPrice: price,
      cost,
      currentValue,
      profitLoss,
      profitLossPct: cost > 0 ? (profitLoss / cost) * 100 : 0,
      weight: 0,
      dayChangePct: q ? q.changePct : null,
    };
  });
  const total = base.reduce((s, p) => s + p.currentValue, 0);
  return base.map((p) => ({ ...p, weight: total > 0 ? p.currentValue / total : 0 }));
}

export function totalsOf(positions: Position[]): Totals {
  const cost = positions.reduce((s, p) => s + p.cost, 0);
  const current = positions.reduce((s, p) => s + p.currentValue, 0);
  return {
    cost,
    current,
    pl: current - cost,
    plPct: cost > 0 ? ((current - cost) / cost) * 100 : 0,
    contributions: positions.reduce((s, p) => s + (p.contributions ?? 0), 0),
    count: positions.length,
  };
}

export function allocationByClass(positions: Position[]): ClassSlice[] {
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  return ASSET_TYPES.map((type) => {
    const items = positions.filter((p) => p.type === type);
    const value = items.reduce((s, p) => s + p.currentValue, 0);
    return {
      type,
      value,
      weight: total > 0 ? value / total : 0,
      count: items.length,
      pl: items.reduce((s, p) => s + p.profitLoss, 0),
    };
  });
}

export function concentration(positions: Position[]): Concentration {
  const sorted = [...positions].sort((a, b) => b.weight - a.weight);
  const hhi = positions.reduce((s, p) => s + p.weight * p.weight, 0);
  return {
    top: sorted[0] ?? null,
    topWeight: sorted[0]?.weight ?? 0,
    top3Weight: sorted.slice(0, 3).reduce((s, p) => s + p.weight, 0),
    hhi,
    effectiveN: hhi > 0 ? 1 / hhi : 0,
  };
}

export function diversificationScore(positions: Position[]): number {
  if (!positions.length) return 0;
  const c = concentration(positions);
  const classes = allocationByClass(positions).filter((s) => s.weight >= 0.02).length;
  const byCount = Math.min(c.effectiveN / 10, 1) * 45;
  const byClass = Math.min(classes / 4, 1) * 30;
  const byTop =
    c.topWeight <= 0.1 ? 25 : c.topWeight >= 0.5 ? 0 : (25 * (0.5 - c.topWeight)) / 0.4;
  return Math.round(byCount + byClass + byTop);
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Boa";
  if (score >= 50) return "Razoável";
  if (score >= 25) return "Baixa";
  return "Muito baixa";
}

export function insights(positions: Position[], profile?: Profile | null): Insight[] {
  const out: Insight[] = [];
  if (!positions.length) return out;

  const c = concentration(positions);
  const slices = allocationByClass(positions);
  const slice = (t: AssetType) => slices.find((s) => s.type === t)!;
  const usedClasses = slices.filter((s) => s.weight >= 0.02).length;

  if (c.top && c.topWeight > 0.25) {
    out.push({
      id: "concentracao-alta",
      severity: "alerta",
      title: `${c.top.ticker} concentra ${fmtWeight(c.topWeight)} da carteira`,
      detail: "Uma única posição acima de 25% expõe muito o patrimônio a um só emissor.",
    });
  } else if (c.top && c.topWeight > 0.15) {
    out.push({
      id: "concentracao-media",
      severity: "atencao",
      title: `${c.top.ticker} representa ${fmtWeight(c.topWeight)} da carteira`,
      detail: "Acima de 15% em um ativo já merece acompanhamento próximo.",
    });
  }

  if (usedClasses < 3) {
    out.push({
      id: "poucas-classes",
      severity: "atencao",
      title: `Carteira com ${usedClasses} classe(s) de ativo`,
      detail: "Combinar classes diferentes reduz o impacto de crises em um único mercado.",
    });
  }

  if (slice("renda_fixa").weight < 0.05) {
    out.push({
      id: "sem-renda-fixa",
      severity: "alerta",
      title: "Pouca ou nenhuma renda fixa",
      detail: "A reserva de emergência (6 a 12 meses de gastos) costuma ficar em renda fixa com liquidez diária.",
    });
  }

  const acoes = slice("acao");
  if (acoes.weight > 0.2 && acoes.count < 5) {
    out.push({
      id: "poucas-acoes",
      severity: "atencao",
      title: `Ações somam ${fmtWeight(acoes.weight)} em apenas ${acoes.count} papel(is)`,
      detail: "Com poucos papéis, o resultado depende demais de poucas empresas.",
    });
  }

  const fiis = slice("fii");
  if (fiis.weight > 0.1 && fiis.count < 3) {
    out.push({
      id: "poucos-fiis",
      severity: "info",
      title: `FIIs concentrados em ${fiis.count} fundo(s)`,
      detail: "Diversificar entre segmentos (logística, lajes, papel, shoppings) reduz o risco de vacância.",
    });
  }

  if (slice("stock").weight === 0 && slice("etf").weight === 0 && profile && profile !== "conservador") {
    out.push({
      id: "sem-exterior",
      severity: "info",
      title: "Sem exposição internacional",
      detail: "Ativos no exterior protegem contra riscos específicos do Brasil e do real.",
    });
  }

  positions
    .filter((p) => p.currentPrice !== undefined && p.profitLossPct <= -20)
    .forEach((p) =>
      out.push({
        id: `queda-${p.id}`,
        severity: "atencao",
        title: `${p.ticker} acumula ${fmtPct(p.profitLossPct, 1)}`,
        detail: "Revise se os motivos que levaram à compra continuam válidos antes de decidir.",
      }),
    );

  const semCotacao = positions.filter((p) => p.type !== "renda_fixa" && p.currentPrice === undefined);
  if (semCotacao.length) {
    out.push({
      id: "sem-cotacao",
      severity: "info",
      title: `${semCotacao.length} ativo(s) sem cotação atual`,
      detail: `${semCotacao.map((p) => p.ticker).join(", ")} estão avaliados pelo preço médio de compra.`,
    });
  }

  if (profile) {
    rebalancePlan(positions, profile)
      .filter((l) => Math.abs(l.currentWeight - l.targetWeight) >= 0.1)
      .forEach((l) =>
        out.push({
          id: `desvio-${l.type}`,
          severity: "atencao",
          title: `${ASSET_LABELS[l.type]}: ${fmtWeight(l.currentWeight)} (alvo ${fmtWeight(l.targetWeight)})`,
          detail: `Desvio de mais de 10 pontos em relação ao perfil ${PROFILE_LABELS[profile].toLowerCase()}.`,
        }),
      );
  }

  const order: Record<Severity, number> = { alerta: 0, atencao: 1, info: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

export function rebalancePlan(positions: Position[], profile: Profile): RebalanceLine[] {
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  const target = TARGET_ALLOCATION[profile];
  return allocationByClass(positions).map((s) => ({
    type: s.type,
    current: s.value,
    currentWeight: s.weight,
    targetWeight: target[s.type],
    diff: target[s.type] * total - s.value,
  }));
}

export function contributionPlan(
  positions: Position[],
  profile: Profile,
  amount: number,
): { type: AssetType; amount: number }[] {
  if (!(amount > 0)) return [];
  const total = positions.reduce((s, p) => s + p.currentValue, 0) + amount;
  const target = TARGET_ALLOCATION[profile];
  const slices = allocationByClass(positions);
  const deficits = slices.map((s) => ({ type: s.type, gap: Math.max(target[s.type] * total - s.value, 0) }));
  const gapSum = deficits.reduce((s, d) => s + d.gap, 0);
  const plan = deficits.map((d) => ({
    type: d.type,
    amount: gapSum > 0 ? (d.gap / gapSum) * amount : target[d.type] * amount,
  }));
  return plan.filter((p) => p.amount >= 0.01).sort((a, b) => b.amount - a.amount);
}

export function profileFromAnswers(answers: number[]): Profile {
  const sum = answers.reduce((s, a) => s + a, 0);
  if (sum <= 4) return "conservador";
  if (sum <= 7) return "moderado";
  return "arrojado";
}

export function describeTotals(t: Totals): string {
  return `Patrimônio de ${fmtBRL(t.current)} em ${t.count} ativo(s), resultado de ${fmtBRL(t.pl)} (${fmtPct(t.plPct)}) sobre ${fmtBRL(t.cost)} investidos.`;
}
