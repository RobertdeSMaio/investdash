import type { PricePoint, RatePoint } from "../services/marketData";
import type { Position } from "./portfolioAnalysis";

export interface IndexPoint {
  date: string;
  portfolio: number | null;
  cdi: number | null;
}

export interface Performance {
  points: IndexPoint[];
  coveredTickers: string[];
  portfolioReturn: number | null;
  cdiReturn: number | null;
  assetReturns: Record<string, number>;
}

function valueAt(series: PricePoint[], date: string): number {
  let v = series[0].close;
  for (const p of series) {
    if (p.date > date) break;
    v = p.close;
  }
  return v;
}

export function buildPerformance(
  positions: Position[],
  histories: Record<string, PricePoint[]>,
  cdi: RatePoint[] | null,
): Performance {
  const covered = positions.filter((p) => (histories[p.ticker]?.length ?? 0) >= 2);
  const coveredValue = covered.reduce((s, p) => s + p.currentValue, 0);

  const assetReturns: Record<string, number> = {};
  covered.forEach((p) => {
    const h = histories[p.ticker];
    assetReturns[p.ticker] = (h[h.length - 1].close / h[0].close - 1) * 100;
  });

  const dateSet = new Set<string>();
  covered.forEach((p) => histories[p.ticker].forEach((pt) => dateSet.add(pt.date)));
  if (!dateSet.size) cdi?.forEach((r) => dateSet.add(r.date));
  const dates = [...dateSet].sort();

  const cdiSorted = [...(cdi ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const start = dates[0];
  let factor = 1;
  let ci = 0;

  const points: IndexPoint[] = dates.map((date) => {
    let portfolio: number | null = null;
    if (covered.length && coveredValue > 0) {
      portfolio =
        100 *
        covered.reduce((s, p) => {
          const h = histories[p.ticker];
          return s + (p.currentValue / coveredValue) * (valueAt(h, date) / h[0].close);
        }, 0);
    }

    let cdiIndex: number | null = null;
    if (cdiSorted.length) {
      while (ci < cdiSorted.length && cdiSorted[ci].date <= date) {
        if (cdiSorted[ci].date > start) factor *= 1 + cdiSorted[ci].value / 100;
        ci++;
      }
      cdiIndex = 100 * factor;
    }
    return { date, portfolio, cdi: cdiIndex };
  });

  const last = points[points.length - 1];
  return {
    points,
    coveredTickers: covered.map((p) => p.ticker),
    portfolioReturn: last?.portfolio != null ? last.portfolio - 100 : null,
    cdiReturn: last?.cdi != null ? last.cdi - 100 : null,
    assetReturns,
  };
}
