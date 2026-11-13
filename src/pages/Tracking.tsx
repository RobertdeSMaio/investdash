import { ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { useChartTheme } from "../components/charts/chartTheme";
import { NavBar } from "../components/NavBar";
import { Card, EmptyState, PageHeader, Spinner, StatTile } from "../components/shared/ui";
import { useAuth } from "../hooks/useAuth";
import { usePortfolio } from "../hooks/usePortfolio";
import {
  fetchCdi,
  fetchHistories,
  HISTORY_RANGES,
  rangeStart,
  type HistoryRange,
  type PricePoint,
  type RatePoint,
} from "../services/marketData";
import { ASSET_BADGE, ASSET_LABELS, fmtBRL, fmtPct, fmtWeight } from "../utils/assetMeta";
import { buildPerformance } from "../utils/performance";
import { loadSnapshots } from "../utils/userStorage";

type LineOptions = Parameters<typeof Line>[0]["options"];

const RANGE_LABELS: Record<HistoryRange, string> = { "1mo": "1M", "3mo": "3M", "6mo": "6M", "1y": "1A" };

const fmtDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const tone = (n: number | null | undefined) => (n == null ? "neutral" : n >= 0 ? "good" : "bad");

function Change({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-[var(--text-muted)]">—</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}>
      <Icon size={12} aria-hidden />
      {fmtPct(value)}
    </span>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      <span className="w-5 inline-block" style={{ borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}` }} />
      {label}
    </span>
  );
}

export default function Tracking() {
  const { user } = useAuth();
  const { positions, quotableTickers, loading, quotesLoading, reloadQuotes, snapshotVersion } = usePortfolio();
  const chart = useChartTheme();
  const [range, setRange] = useState<HistoryRange>("3mo");
  const [histories, setHistories] = useState<Record<string, PricePoint[]>>({});
  const [cdi, setCdi] = useState<RatePoint[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (loading) return;
    let active = true;
    setHistoryLoading(true);
    Promise.all([fetchHistories(quotableTickers, range), fetchCdi(rangeStart(range), new Date())])
      .then(([h, c]) => {
        if (!active) return;
        setHistories(h);
        setCdi(c);
      })
      .finally(() => active && setHistoryLoading(false));
    return () => {
      active = false;
    };
  }, [loading, quotableTickers, range, refreshKey]);

  const perf = useMemo(() => buildPerformance(positions, histories, cdi), [positions, histories, cdi]);
  const snapshots = useMemo(
    () => (user ? loadSnapshots(user.id) : []),
    [user, snapshotVersion],
  );

  const quoted = positions.filter((p) => p.dayChangePct !== null);
  const quotedWeight = quoted.reduce((s, p) => s + p.weight, 0);
  const dayChange =
    quotedWeight > 0 ? quoted.reduce((s, p) => s + p.weight * (p.dayChangePct ?? 0), 0) / quotedWeight : null;
  const vsCdi =
    perf.portfolioReturn != null && perf.cdiReturn != null ? perf.portfolioReturn - perf.cdiReturn : null;

  const movers = [...quoted].sort((a, b) => (b.dayChangePct ?? 0) - (a.dayChangePct ?? 0));
  const gainers = movers.filter((p) => (p.dayChangePct ?? 0) > 0).slice(0, 3);
  const losers = movers.filter((p) => (p.dayChangePct ?? 0) < 0).reverse().slice(0, 3);

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: { legend: { display: false } },
    elements: { point: { radius: 0, hoverRadius: 4, hitRadius: 12 }, line: { borderWidth: 2, tension: 0.25 } },
    scales: {
      x: { ticks: { color: chart.text, maxTicksLimit: 8, font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: chart.text, font: { size: 11 } }, grid: { color: chart.grid } },
    },
  };

  const perfData = {
    labels: perf.points.map((p) => fmtDay(p.date)),
    datasets: [
      ...(perf.coveredTickers.length
        ? [{ label: "Carteira", data: perf.points.map((p) => p.portfolio), borderColor: chart.primary, backgroundColor: chart.primary }]
        : []),
      ...(cdi
        ? [{ label: "CDI", data: perf.points.map((p) => p.cdi), borderColor: chart.benchmark, backgroundColor: chart.benchmark, borderDash: [5, 4] }]
        : []),
    ],
  };

  const perfOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            ctx.parsed.y == null ? "" : ` ${ctx.dataset.label}: ${fmtPct(ctx.parsed.y - 100)}`,
        },
      },
    },
  };

  const snapData = {
    labels: snapshots.map((s) => fmtDay(s.date)),
    datasets: [
      { label: "Patrimônio", data: snapshots.map((s) => s.current), borderColor: chart.primary, backgroundColor: chart.primary },
      { label: "Investido", data: snapshots.map((s) => s.cost), borderColor: chart.benchmark, backgroundColor: chart.benchmark, borderDash: [5, 4] },
    ],
  };

  const snapOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            ` ${ctx.dataset.label}: ${fmtBRL(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: (v: number | string) => {
            const n = Number(v);
            return n >= 1000 ? `R$${(n / 1000).toFixed(0)}k` : `R$${n.toFixed(0)}`;
          },
        },
      },
    },
  };

  const busy = quotesLoading || historyLoading;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <PageHeader
          title="Acompanhamento"
          subtitle="Desempenho e rastreio da carteira ao longo do tempo"
          action={
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-[var(--border)] overflow-hidden" role="group" aria-label="Período">
                {HISTORY_RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                    className={`text-xs px-3 py-1.5 transition ${range === r ? "bg-emerald-500/15 text-emerald-400" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    {RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  reloadQuotes();
                  setRefreshKey((k) => k + 1);
                }}
                disabled={busy}
                className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                aria-label="Atualizar dados"
              >
                <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
              </button>
            </div>
          }
        />

        {loading ? (
          <Spinner />
        ) : !positions.length ? (
          <Card>
            <EmptyState>
              Nenhum ativo na carteira.{" "}
              <Link to="/" className="text-emerald-400 hover:underline">Adicione ativos</Link> para acompanhar o desempenho.
            </EmptyState>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile label={`Carteira (${RANGE_LABELS[range]})`} value={perf.portfolioReturn != null ? fmtPct(perf.portfolioReturn) : "—"} tone={tone(perf.portfolioReturn)} hint="Ativos com histórico" />
              <StatTile label={`CDI (${RANGE_LABELS[range]})`} value={perf.cdiReturn != null ? fmtPct(perf.cdiReturn) : "—"} hint="Fonte: Banco Central" />
              <StatTile label="Carteira vs CDI" value={vsCdi != null ? `${vsCdi >= 0 ? "+" : ""}${vsCdi.toFixed(2).replace(".", ",")} p.p.` : "—"} tone={tone(vsCdi)} />
              <StatTile label="Variação hoje" value={dayChange != null ? fmtPct(dayChange) : "—"} tone={tone(dayChange)} hint={`${quoted.length} ativo(s) cotado(s)`} />
            </div>

            <Card
              title="Desempenho vs CDI"
              subtitle={`Base 100 no início do período · ${perf.coveredTickers.length} de ${quotableTickers.length} ativo(s) de renda variável com histórico`}
              action={
                <div className="flex gap-3 flex-wrap justify-end">
                  {perf.coveredTickers.length > 0 && <LegendItem color={chart.primary} label="Carteira" />}
                  {cdi && <LegendItem color={chart.benchmark} label="CDI" dashed />}
                </div>
              }
            >
              {historyLoading ? (
                <Spinner />
              ) : perfData.datasets.length ? (
                <>
                  <div style={{ height: 280 }}>
                    <Line data={perfData} options={perfOptions as LineOptions} />
                  </div>
                  {perf.coveredTickers.length < quotableTickers.length && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Ativos sem histórico de preços disponível ficam fora da linha da carteira.
                    </p>
                  )}
                </>
              ) : (
                <EmptyState>Histórico de preços e CDI indisponíveis no momento.</EmptyState>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card
                title="Evolução registrada"
                subtitle="Um registro por dia em que você abre o app"
                className="lg:col-span-2"
                action={
                  snapshots.length >= 2 ? (
                    <div className="flex gap-3 flex-wrap justify-end">
                      <LegendItem color={chart.primary} label="Patrimônio" />
                      <LegendItem color={chart.benchmark} label="Investido" dashed />
                    </div>
                  ) : undefined
                }
              >
                {snapshots.length >= 2 ? (
                  <div style={{ height: 240 }}>
                    <Line data={snapData} options={snapOptions as LineOptions} />
                  </div>
                ) : (
                  <EmptyState>
                    {snapshots.length === 1
                      ? "O primeiro registro foi salvo hoje. A partir do próximo dia de uso, a evolução do patrimônio aparece aqui."
                      : "Os registros começam assim que a carteira e as cotações forem carregadas."}
                  </EmptyState>
                )}
              </Card>

              <Card title="Destaques do dia">
                {!quoted.length ? (
                  <EmptyState>Sem cotações disponíveis.</EmptyState>
                ) : (
                  <div className="flex flex-col gap-4 text-sm">
                    {[
                      { title: "Maiores altas", items: gainers },
                      { title: "Maiores quedas", items: losers },
                    ].map((g) => (
                      <div key={g.title}>
                        <p className="text-xs text-[var(--text-muted)] mb-1.5">{g.title}</p>
                        {g.items.length ? (
                          <ul className="flex flex-col gap-1.5">
                            {g.items.map((p) => (
                              <li key={p.id} className="flex items-center justify-between">
                                <span className="font-medium text-[var(--text-primary)]">{p.ticker}</span>
                                <Change value={p.dayChangePct} />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[var(--text-muted)]">Nenhum ativo.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card title="Rastreio dos ativos" subtitle={`Variação no período: ${RANGE_LABELS[range]}`}>
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                      <th className="text-left py-2.5 pr-3 font-medium">Ativo</th>
                      <th className="text-left py-2.5 px-3 font-medium">Classe</th>
                      <th className="text-right py-2.5 px-3 font-medium">Peso</th>
                      <th className="text-right py-2.5 px-3 font-medium">Preço médio</th>
                      <th className="text-right py-2.5 px-3 font-medium">Cotação</th>
                      <th className="text-right py-2.5 px-3 font-medium">Hoje</th>
                      <th className="text-right py-2.5 px-3 font-medium">Período</th>
                      <th className="text-right py-2.5 pl-3 font-medium">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...positions]
                      .sort((a, b) => b.weight - a.weight)
                      .map((p) => (
                        <tr key={p.id} className="border-b border-[var(--border)] last:border-b-0">
                          <td className="py-2.5 pr-3">
                            <p className="font-semibold text-[var(--text-primary)]">{p.ticker}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate max-w-[160px]">{p.name}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${ASSET_BADGE[p.type]}`}>{ASSET_LABELS[p.type]}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[var(--text-secondary)]">{fmtWeight(p.weight)}</td>
                          <td className="py-2.5 px-3 text-right text-[var(--text-secondary)]">{fmtBRL(p.avgPrice)}</td>
                          <td className="py-2.5 px-3 text-right text-[var(--text-primary)]">
                            {p.currentPrice !== undefined ? fmtBRL(p.currentPrice) : <span className="text-[var(--text-muted)]">—</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right"><Change value={p.dayChangePct} /></td>
                          <td className="py-2.5 px-3 text-right"><Change value={perf.assetReturns[p.ticker]} /></td>
                          <td className="py-2.5 pl-3 text-right">
                            <p className={p.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}>{fmtBRL(p.profitLoss)}</p>
                            <p className="text-xs text-[var(--text-muted)]">{fmtPct(p.profitLossPct)}</p>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
