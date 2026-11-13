import { Banknote, BarChart2, Building2, Globe, LineChart } from "lucide-react";
import type { AssetType } from "../types";

export const ASSET_TYPES: AssetType[] = ["acao", "fii", "etf", "stock", "renda_fixa"];

export const ASSET_LABELS: Record<AssetType, string> = {
  acao: "Ação BR",
  fii: "FII",
  etf: "ETF",
  stock: "Stock EUA",
  renda_fixa: "Renda Fixa",
};

export const ASSET_BADGE: Record<AssetType, string> = {
  acao: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  fii: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  etf: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  stock: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  renda_fixa: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  acao: LineChart,
  fii: Building2,
  etf: BarChart2,
  stock: Globe,
  renda_fixa: Banknote,
};

export const SERIES_COLORS = {
  light: { acao: "#2a78d6", fii: "#eb6834", etf: "#1baf7a", stock: "#eda100", renda_fixa: "#e87ba4" },
  dark: { acao: "#3987e5", fii: "#d95926", etf: "#199e70", stock: "#c98500", renda_fixa: "#d55181" },
} satisfies Record<"light" | "dark", Record<AssetType, string>>;

export function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtPct(n: number, digits = 2) {
  return (n > 0 ? "+" : "") + n.toFixed(digits).replace(".", ",") + "%";
}

export function fmtWeight(fraction: number) {
  return (fraction * 100).toFixed(1).replace(".", ",") + "%";
}
