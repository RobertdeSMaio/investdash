export type InterestType = "simples" | "composta";
export type Frequency = "mensal" | "anual";

export interface SimulationInput {
  principal: number;
  rate: number;
  period: number;
  periodUnit: Frequency;
  contribution: number;
  contributionFrequency: Frequency;
}

export interface MonthRow {
  month: number;
  invested: number;
  interest: number;
  total: number;
}

export interface CalcResult extends SimulationInput {
  finalAmount: number;
  totalInvested: number;
  profit: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function monthlyRate(
  type: InterestType,
  rate: number,
  periodUnit: Frequency,
): number {
  const r = rate / 100;
  if (periodUnit === "mensal") return r;
  return type === "composta" ? Math.pow(1 + r, 1 / 12) - 1 : r / 12;
}

export function simulate(type: InterestType, input: SimulationInput): MonthRow[] {
  const { principal, period, periodUnit, contribution, contributionFrequency } =
    input;
  const months = periodUnit === "anual" ? period * 12 : period;
  const i = monthlyRate(type, input.rate, periodUnit);

  let invested = principal;
  let total = principal;
  const rows: MonthRow[] = [{ month: 0, invested, interest: 0, total }];

  for (let m = 1; m <= months; m++) {
    total += (type === "composta" ? total : invested) * i;

    const deposits =
      contributionFrequency === "mensal" || m % 12 === 0 ? contribution : 0;
    invested += deposits;
    total += deposits;

    rows.push({
      month: m,
      invested: round2(invested),
      interest: round2(total - invested),
      total: round2(total),
    });
  }
  return rows;
}

export function summarize(input: SimulationInput, rows: MonthRow[]): CalcResult {
  const last = rows[rows.length - 1];
  return {
    ...input,
    finalAmount: last.total,
    totalInvested: last.invested,
    profit: last.interest,
  };
}
