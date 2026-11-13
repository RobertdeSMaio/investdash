import { useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { useChartTheme } from "../components/charts/chartTheme";
import { NavBar } from "../components/NavBar";
import { Card, EmptyState, PageHeader, SeverityBadge, Spinner, StatTile } from "../components/shared/ui";
import { useAuth } from "../hooks/useAuth";
import { usePortfolio } from "../hooks/usePortfolio";
import { ASSET_LABELS, fmtBRL, fmtPct, fmtWeight } from "../utils/assetMeta";
import {
  allocationByClass,
  concentration,
  diversificationScore,
  insights,
  PROFILE_LABELS,
  rebalancePlan,
  scoreLabel,
} from "../utils/portfolioAnalysis";
import { loadProfile } from "../utils/userStorage";

const TOP_N = 10;

export default function Analysis() {
  const { user } = useAuth();
  const { positions, totals, loading } = usePortfolio();
  const chart = useChartTheme();
  const profile = user ? loadProfile(user.id) : null;

  const slices = useMemo(() => allocationByClass(positions), [positions]);
  const conc = useMemo(() => concentration(positions), [positions]);
  const score = useMemo(() => diversificationScore(positions), [positions]);
  const alerts = useMemo(() => insights(positions, profile), [positions, profile]);
  const plan = useMemo(() => (profile ? rebalancePlan(positions, profile) : null), [positions, profile]);

  const used = slices.filter((s) => s.value > 0);
  const byWeight = [...positions].sort((a, b) => b.weight - a.weight);
  const top = byWeight.slice(0, TOP_N);
  const rest = byWeight.slice(TOP_N);
  const restWeight = rest.reduce((s, p) => s + p.weight, 0);
  const ranking = [...positions].sort((a, b) => b.profitLossPct - a.profitLossPct);

  const rv = slices.filter((s) => s.type !== "renda_fixa").reduce((s, x) => s + x.weight, 0);
  const exterior = slices.find((s) => s.type === "stock")?.weight ?? 0;

  const doughnutData = {
    labels: used.map((s) => ASSET_LABELS[s.type]),
    datasets: [
      {
        data: used.map((s) => s.value),
        backgroundColor: used.map((s) => chart.classes[s.type]),
        borderColor: chart.surface,
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const weightData = {
    labels: [...top.map((p) => p.ticker), ...(rest.length ? [`Outros (${rest.length})`] : [])],
    datasets: [
      {
        label: "Peso",
        data: [...top.map((p) => p.weight * 100), ...(rest.length ? [restWeight * 100] : [])],
        backgroundColor: chart.primary,
        borderRadius: 4,
        borderSkipped: "start" as const,
        barThickness: 14,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <PageHeader title="Análise da carteira" subtitle="Alocação, concentração, resultados e pontos de atenção" />

        {loading ? (
          <Spinner />
        ) : !positions.length ? (
          <Card>
            <EmptyState>
              Nenhum ativo na carteira.{" "}
              <Link to="/" className="text-emerald-400 hover:underline">Adicione ativos</Link> para ver a análise.
            </EmptyState>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile label="Patrimônio" value={fmtBRL(totals.current)} hint={`${fmtBRL(totals.cost)} investidos`} />
              <StatTile label="Resultado" value={fmtBRL(totals.pl)} tone={totals.pl >= 0 ? "good" : "bad"} hint={fmtPct(totals.plPct)} />
              <StatTile label="Diversificação" value={`${score}/100`} hint={scoreLabel(score)} />
              <StatTile label="Ativos" value={String(totals.count)} hint={`${used.length} classe(s) · ${conc.effectiveN.toFixed(1).replace(".", ",")} efetivos`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Alocação por classe" subtitle="Valor atual de mercado">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-44 h-44 shrink-0">
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "62%",
                        plugins: {
                          legend: { display: false },
                          tooltip: { callbacks: { label: (ctx) => ` ${fmtBRL(Number(ctx.parsed))}` } },
                        },
                      }}
                    />
                  </div>
                  <ul className="flex-1 w-full flex flex-col gap-2 text-sm">
                    {used.map((s) => (
                      <li key={s.type} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: chart.classes[s.type] }} />
                        <span className="flex-1 text-[var(--text-secondary)]">{ASSET_LABELS[s.type]}</span>
                        <span className="text-[var(--text-primary)] font-medium tabular-nums">{fmtWeight(s.weight)}</span>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums w-28 text-right">{fmtBRL(s.value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                    <p className="text-[var(--text-muted)]">Renda variável / fixa</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                      {fmtWeight(rv)} / {fmtWeight(1 - rv)}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                    <p className="text-[var(--text-muted)]">Exterior (Stocks EUA)</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{fmtWeight(exterior)}</p>
                  </div>
                </div>
              </Card>

              <Card title="Peso por ativo" subtitle={`Maior posição: ${conc.top?.ticker ?? "—"} (${fmtWeight(conc.topWeight)}) · 3 maiores: ${fmtWeight(conc.top3Weight)}`}>
                <div style={{ height: Math.max(160, weightData.labels.length * 26) }}>
                  <Bar
                    data={weightData}
                    options={{
                      indexAxis: "y",
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${Number(ctx.parsed.x).toFixed(1).replace(".", ",")}% da carteira` } },
                      },
                      scales: {
                        x: {
                          ticks: { color: chart.text, font: { size: 11 }, callback: (v) => `${v}%` },
                          grid: { color: chart.grid },
                        },
                        y: { ticks: { color: chart.text, font: { size: 11 } }, grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                title="Atual x alvo do perfil"
                subtitle={profile ? `Perfil ${PROFILE_LABELS[profile].toLowerCase()}` : undefined}
              >
                {plan ? (
                  <ul className="flex flex-col gap-3 text-sm">
                    {plan.map((l) => (
                      <li key={l.type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--text-secondary)]">{ASSET_LABELS[l.type]}</span>
                          <span className="text-[var(--text-muted)] tabular-nums">
                            {fmtWeight(l.currentWeight)} de {fmtWeight(l.targetWeight)}
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full bg-[var(--bg-tertiary)]">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ width: `${Math.min(l.currentWeight, 1) * 100}%`, background: chart.classes[l.type] }}
                          />
                          <div
                            className="absolute -top-1 -bottom-1 w-0.5 bg-[var(--text-primary)]"
                            style={{ left: `${l.targetWeight * 100}%` }}
                            aria-hidden
                          />
                        </div>
                      </li>
                    ))}
                    <li className="text-xs text-[var(--text-muted)]">A marca vertical indica o percentual alvo.</li>
                  </ul>
                ) : (
                  <EmptyState>
                    Defina seu perfil de investidor na aba{" "}
                    <Link to="/sugestoes" className="text-emerald-400 hover:underline">Sugestões</Link> para comparar com a alocação alvo.
                  </EmptyState>
                )}
              </Card>

              <Card title="Resultado por ativo" subtitle="Do melhor para o pior, sobre o preço médio">
                <ul className="flex flex-col divide-y divide-[var(--border)] text-sm max-h-80 overflow-y-auto">
                  {ranking.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2 gap-3">
                      <span className="font-medium text-[var(--text-primary)]">{p.ticker}</span>
                      <span className="flex-1 text-xs text-[var(--text-muted)] text-right tabular-nums">{fmtBRL(p.profitLoss)}</span>
                      <span className={`w-20 text-right tabular-nums ${p.profitLossPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {p.profitLossPct >= 0 ? "▲" : "▼"} {fmtPct(p.profitLossPct, 1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card title="Pontos de atenção" subtitle="Regras objetivas aplicadas à sua carteira">
              {alerts.length ? (
                <ul className="flex flex-col gap-3">
                  {alerts.map((a) => (
                    <li key={a.id} className="flex flex-col sm:flex-row sm:items-start gap-2 bg-[var(--bg-tertiary)] rounded-lg p-3">
                      <SeverityBadge severity={a.severity} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{a.title}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{a.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>Nenhum ponto de atenção encontrado.</EmptyState>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
