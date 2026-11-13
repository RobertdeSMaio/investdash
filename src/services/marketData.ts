import type { Quote } from "../types";
import { TICKER_REGEX } from "../utils/validationSchemas";
import api from "./api";

// Cotações passam pelo backend (/market/quote), que guarda o token da brapi.dev.
const QUOTE_PATH = "/market/quote";
const BCB_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.";
const TIMEOUT_MS = 10000;
const MAX_TICKERS = 50;
const CONCURRENCY = 3;
const QUOTE_TTL = 60 * 1000;
const HISTORY_TTL = 10 * 60 * 1000;
const SERIES_TTL = 60 * 60 * 1000;

export const HISTORY_RANGES = ["1mo", "3mo", "6mo", "1y"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];

export interface PricePoint {
  date: string;
  close: number;
}

export interface RatePoint {
  date: string;
  value: number;
}

const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, ttl: number, load: () => Promise<T | null>): Promise<T | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value as T;
  const value = await load();
  if (value !== null) cache.set(key, { at: Date.now(), value });
  return value;
}

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function getQuoteJson(ticker: string, range?: HistoryRange): Promise<unknown> {
  const res = await api.get(QUOTE_PATH, {
    params: range ? { ticker, range } : { ticker },
    timeout: TIMEOUT_MS,
  });
  return res.data;
}

const num = (v: unknown, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const str = (v: unknown, max = 100) =>
  typeof v === "string" ? v.slice(0, max) : undefined;

export function normalizeTickers(tickers: string[]): string[] {
  return [...new Set(tickers.map((t) => t.trim().toUpperCase()))]
    .filter((t) => TICKER_REGEX.test(t))
    .slice(0, MAX_TICKERS);
}

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

async function fetchQuote(ticker: string): Promise<Quote | null> {
  return cached(`quote:${ticker}`, QUOTE_TTL, async () => {
    try {
      const json = await getQuoteJson(ticker);
      const items = (json as { results?: unknown })?.results;
      if (!Array.isArray(items)) return null;
      const item = items[0] as Record<string, unknown> | undefined;
      if (!item || str(item.symbol, 20)?.toUpperCase() !== ticker) return null;
      const price = num(item.regularMarketPrice);
      if (price <= 0) return null;
      return {
        ticker,
        name: str(item.shortName) ?? str(item.longName) ?? ticker,
        price,
        change: num(item.regularMarketChange),
        changePct: num(item.regularMarketChangePercent),
        high: num(item.regularMarketDayHigh, price),
        low: num(item.regularMarketDayLow, price),
        currency: str(item.currency, 5)?.toUpperCase() ?? "BRL",
        updatedAt: str(item.regularMarketTime, 40) ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  });
}

export async function fetchQuotes(tickers: string[]): Promise<Record<string, Quote>> {
  const valid = normalizeTickers(tickers);
  const quotes = await pool(valid, fetchQuote);
  const result: Record<string, Quote> = {};
  quotes.forEach((q) => {
    if (q) result[q.ticker] = q;
  });
  return result;
}

export async function fetchHistory(ticker: string, range: HistoryRange): Promise<PricePoint[] | null> {
  const [t] = normalizeTickers([ticker]);
  if (!t || !HISTORY_RANGES.includes(range)) return null;
  return cached(`history:${t}:${range}`, HISTORY_TTL, async () => {
    try {
      const json = await getQuoteJson(t, range);
      const item = ((json as { results?: unknown[] })?.results ?? [])[0] as
        | { historicalDataPrice?: unknown }
        | undefined;
      const rows = item?.historicalDataPrice;
      if (!Array.isArray(rows)) return null;
      const points = rows
        .map((r) => {
          const row = r as Record<string, unknown>;
          const ts = num(row.date, NaN);
          const close = num(row.adjustedClose, NaN) > 0 ? num(row.adjustedClose) : num(row.close);
          if (!Number.isFinite(ts) || close <= 0) return null;
          return { date: new Date(ts * 1000).toISOString().slice(0, 10), close };
        })
        .filter((p): p is PricePoint => p !== null)
        .sort((a, b) => a.date.localeCompare(b.date));
      return points.length ? points : null;
    } catch {
      return null;
    }
  });
}

export async function fetchHistories(
  tickers: string[],
  range: HistoryRange,
): Promise<Record<string, PricePoint[]>> {
  const valid = normalizeTickers(tickers);
  const series = await pool(valid, (t) => fetchHistory(t, range));
  const result: Record<string, PricePoint[]> = {};
  valid.forEach((t, i) => {
    const s = series[i];
    if (s) result[t] = s;
  });
  return result;
}

const toBcbDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

function parseBcb(json: unknown): RatePoint[] | null {
  if (!Array.isArray(json)) return null;
  const points = json
    .map((r) => {
      const row = r as { data?: unknown; valor?: unknown };
      const m = typeof row.data === "string" ? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(row.data) : null;
      const value = typeof row.valor === "string" ? Number(row.valor) : NaN;
      if (!m || !Number.isFinite(value)) return null;
      return { date: `${m[3]}-${m[2]}-${m[1]}`, value };
    })
    .filter((p): p is RatePoint => p !== null);
  return points.length ? points : null;
}

export async function fetchCdi(from: Date, to: Date): Promise<RatePoint[] | null> {
  const start = toBcbDate(from);
  const end = toBcbDate(to);
  return cached(`cdi:${start}:${end}`, SERIES_TTL, async () => {
    try {
      const params = new URLSearchParams({ formato: "json", dataInicial: start, dataFinal: end });
      return parseBcb(await getJson(`${BCB_URL}12/dados?${params}`));
    } catch {
      return null;
    }
  });
}

export async function fetchUsdBrl(): Promise<number | null> {
  return cached("usdbrl", SERIES_TTL, async () => {
    try {
      const points = parseBcb(await getJson(`${BCB_URL}1/dados/ultimos/1?formato=json`));
      const value = points?.[points.length - 1]?.value ?? 0;
      return value > 0 ? value : null;
    } catch {
      return null;
    }
  });
}

export function rangeStart(range: HistoryRange, now = new Date()): Date {
  const d = new Date(now);
  const months = { "1mo": 1, "3mo": 3, "6mo": 6, "1y": 12 }[range];
  d.setMonth(d.getMonth() - months);
  return d;
}
