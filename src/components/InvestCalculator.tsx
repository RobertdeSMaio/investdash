import {
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useFormik } from "formik";
import {
  BarChart2,
  GitCompare,
  RefreshCw,
  Save,
  Table2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import * as Yup from "yup";
import { investmentService } from "../services/investmentService";
import { Input } from "./shared/Input";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

interface CalcResult {
  principal: number;
  contribution: number;
  contributionFrequency: string;
  periodUnit: string;
  finalAmount: number;
  totalInvested: number;
  profit: number;
  rate: number;
  period: number;
}

interface MonthRow {
  month: number;
  invested: number;
  interest: number;
  total: number;
}

interface Props {
  type: "simples" | "composta";
  label: string;
  color: string;
  showContributions?: boolean;
  calculate: (
    principal: number,
    rate: number,
    period: number,
    periodUnit: "mensal" | "anual",
    contribution: number,
    contributionFrequency: "mensal" | "anual",
  ) => CalcResult;
  calculateOther: (
    principal: number,
    rate: number,
    period: number,
    periodUnit: "mensal" | "anual",
    contribution: number,
    contributionFrequency: "mensal" | "anual",
  ) => CalcResult;
  otherLabel: string;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildRowsFromValues(
  principal: number,
  rate: number,
  period: number,
  periodUnit: "mensal" | "anual",
  contribution: number,
  contributionFrequency: "mensal" | "anual",
  calcType: "simples" | "composta",
): MonthRow[] {
  const months = periodUnit === "anual" ? period * 12 : period;
  const monthlyContrib =
    contributionFrequency === "anual" ? contribution / 12 : contribution;

  // Annual rate converted to monthly — each method uses its own convention:
  // Compound: geometric equivalent  (1+r)^(1/12) - 1
  // Simple:   linear proportional   r / 12
  const annualRate = periodUnit === "anual" ? rate / 100 : null;
  const monthlyRateCompound =
    annualRate !== null ? Math.pow(1 + annualRate, 1 / 12) - 1 : rate / 100;
  const monthlyRateSimple = annualRate !== null ? annualRate / 12 : rate / 100;

  const monthlyRate =
    calcType === "composta" ? monthlyRateCompound : monthlyRateSimple;

  const rows: MonthRow[] = [];
  for (let m = 0; m <= months; m++) {
    let total: number;
    if (calcType === "composta") {
      // Compound: balance reinvests every period
      total =
        monthlyRate === 0
          ? principal + monthlyContrib * m
          : principal * Math.pow(1 + monthlyRate, m) +
            monthlyContrib * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
    } else {
      // Simple: interest always over original principal, no reinvestment
      total = principal * (1 + monthlyRate * m) + monthlyContrib * m;
    }
    const invested = principal + monthlyContrib * m;
    rows.push({
      month: m,
      invested: Math.round(invested * 100) / 100,
      interest: Math.max(0, Math.round((total - invested) * 100) / 100),
      total: Math.round(total * 100) / 100,
    });
  }
  return rows;
}

const schema = Yup.object({
  principal: Yup.number().min(0, "Deve ser >= 0").required("Obrigatório"),
  rate: Yup.number()
    .positive("Deve ser positivo")
    .max(10000)
    .required("Obrigatório"),
  period: Yup.number().integer().positive().required("Obrigatório"),
  periodUnit: Yup.string().oneOf(["mensal", "anual"]).required(),
  contribution: Yup.number().min(0).required("Obrigatório"),
  contributionFrequency: Yup.string().oneOf(["mensal", "anual"]).required(),
});

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
        ${
          active
            ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

export function InvestCalculator({
  type,
  label,
  color,
  calculate,
  calculateOther,
  otherLabel,
  showContributions = true,
}: Props) {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [rows, setRows] = useState<MonthRow[]>([]);
  const [otherRows, setOtherRows] = useState<MonthRow[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"line" | "bar" | "table" | "compare">("line");
  const [showFullTable, setShowFullTable] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const formik = useFormik({
    initialValues: {
      principal: "",
      rate: "",
      period: "",
      periodUnit: "mensal" as "mensal" | "anual",
      contribution: "0",
      contributionFrequency: "mensal" as "mensal" | "anual",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const p = Number(values.principal);
      const r = Number(values.rate);
      const pe = Number(values.period);
      const pu = values.periodUnit;
      const c = Number(values.contribution);
      const cf = values.contributionFrequency;

      const res = calculate(p, r, pe, pu, c, cf);
      setResult(res);
      setSaved(false);
      setShowFullTable(false);
      setRows(buildRowsFromValues(p, r, pe, pu, c, cf, type));
      setOtherRows(
        buildRowsFromValues(
          p,
          r,
          pe,
          pu,
          c,
          cf,
          type === "composta" ? "simples" : "composta",
        ),
      );
    },
  });

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await investmentService.create({
        name: `${label} – ${new Date().toLocaleDateString("pt-BR")}`,
        type,
        principal: result.principal,
        rate: result.rate,
        period: result.period,
        periodUnit: result.periodUnit,
        contribution: result.contribution,
        contributionFrequency: result.contributionFrequency,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    formik.resetForm();
    setResult(null);
    setRows([]);
    setOtherRows([]);
    setSaved(false);
    setShowFullTable(false);
  };

  useEffect(() => {
    if (showFullTable && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showFullTable]);

  const SelectField = ({
    label: lbl,
    field,
    options,
  }: {
    label: string;
    field: "periodUnit" | "contributionFrequency";
    options: { value: string; label: string }[];
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        {lbl}
      </label>
      <select
        value={formik.values[field]}
        onChange={(e) => formik.setFieldValue(field, e.target.value)}
        className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const labels = rows.map((r) => String(r.month));

  const lineData = {
    labels,
    datasets: [
      {
        label: "Patrimônio",
        data: rows.map((r) => r.total),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: rows.length > 60 ? 0 : 3,
        borderWidth: 2,
      },
      {
        label: "Total investido",
        data: rows.map((r) => r.invested),
        borderColor: "#818cf8",
        backgroundColor: "transparent",
        borderDash: [5, 3],
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "Total investido",
        data: rows.map((r) => r.invested),
        backgroundColor: "#6366f1",
        stack: "s",
      },
      {
        label: "Juros",
        data: rows.map((r) => r.interest),
        backgroundColor: "#10b981",
        stack: "s",
      },
    ],
  };

  const compareData = {
    labels,
    datasets: [
      {
        label: type === "composta" ? "Juros Compostos" : "Juros Simples",
        data: rows.map((r) => r.total),
        borderColor: type === "composta" ? "#10b981" : "#818cf8",
        backgroundColor: "transparent",
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: type === "composta" ? "Juros Simples" : "Juros Compostos",
        data: otherRows.map((r) => r.total),
        borderColor: type === "composta" ? "#818cf8" : "#10b981",
        backgroundColor: "transparent",
        borderDash: [5, 3],
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => ` ${fmt(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 12, color: "#888", font: { size: 11 } },
        grid: { color: "rgba(128,128,128,0.1)" },
      },
      y: {
        ticks: {
          callback: (v: number | string) => {
            const n = Number(v);
            return n >= 1000
              ? `R$${(n / 1000).toFixed(0)}k`
              : `R$${n.toFixed(0)}`;
          },
          color: "#888",
          font: { size: 11 },
        },
        grid: { color: "rgba(128,128,128,0.1)" },
      },
    },
  };

  const barOpts = {
    ...chartOpts,
    scales: {
      x: {
        stacked: true,
        ticks: { maxTicksLimit: 12, color: "#888", font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: chartOpts.scales.y.ticks,
        grid: chartOpts.scales.y.grid,
      },
    },
  };

  const displayRows = showFullTable ? rows : rows.slice(0, 13);

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <form
        onSubmit={formik.handleSubmit}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor inicial (R$)"
            type="number"
            placeholder="1000"
            min="0"
            step="0.01"
            {...formik.getFieldProps("principal")}
            error={formik.errors.principal}
            touched={formik.touched.principal}
          />
          <Input
            label="Taxa (%)"
            type="number"
            placeholder="1.5"
            min="0"
            step="0.001"
            {...formik.getFieldProps("rate")}
            error={formik.errors.rate}
            touched={formik.touched.rate}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Período"
            type="number"
            placeholder="12"
            min="1"
            step="1"
            {...formik.getFieldProps("period")}
            error={formik.errors.period}
            touched={formik.touched.period}
          />
          <SelectField
            label="Unidade"
            field="periodUnit"
            options={[
              { value: "mensal", label: "Meses" },
              { value: "anual", label: "Anos" },
            ]}
          />
        </div>

        {showContributions && (
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Aportes periódicos (opcional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Valor do aporte (R$)"
                type="number"
                placeholder="500"
                min="0"
                step="0.01"
                {...formik.getFieldProps("contribution")}
                error={formik.errors.contribution}
                touched={formik.touched.contribution}
              />
              <SelectField
                label="Frequência"
                field="contributionFrequency"
                options={[
                  { value: "mensal", label: "Mensal" },
                  { value: "anual", label: "Anual" },
                ]}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className={`flex-1 font-semibold py-2.5 rounded-lg transition text-white ${color}`}
          >
            Calcular {label}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="text-emerald-400" />
            <h3 className="font-semibold text-[var(--text-primary)]">
              Resultado
            </h3>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">
                Total investido
              </p>
              <p className="font-bold text-[var(--text-primary)] text-sm">
                {fmt(result.totalInvested)}
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">
                Valor final
              </p>
              <p className="font-bold text-emerald-400 text-sm">
                {fmt(result.finalAmount)}
              </p>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Lucro</p>
              <p className="font-bold text-emerald-400 text-sm">
                {fmt(result.profit)}
              </p>
            </div>
          </div>

          {/* Bar breakdown */}
          {result.totalInvested > 0 &&
            (() => {
              const pP = (result.principal / result.finalAmount) * 100;
              const pC =
                ((result.totalInvested - result.principal) /
                  result.finalAmount) *
                100;
              const pJ = (result.profit / result.finalAmount) * 100;
              return (
                <div>
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                    <span>Principal: {pP.toFixed(1)}%</span>
                    {result.contribution > 0 && (
                      <span>Aportes: {pC.toFixed(1)}%</span>
                    )}
                    <span>Juros: {pJ.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden flex bg-[var(--bg-tertiary)]">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${pP}%` }}
                    />
                    {result.contribution > 0 && (
                      <div
                        className="bg-purple-500 h-full"
                        style={{ width: `${pC}%` }}
                      />
                    )}
                    <div className="bg-emerald-500 h-full flex-1" />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Principal
                    </span>
                    {result.contribution > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                        Aportes
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Juros
                    </span>
                  </div>
                </div>
              );
            })()}

          {/* Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              [
                "Taxa",
                `${result.rate}% ${result.periodUnit === "anual" ? "a.a." : "a.m."}`,
              ],
              [
                "Período",
                `${result.period} ${result.periodUnit === "anual" ? "ano(s)" : "mês(es)"}`,
              ],
              ...(showContributions
                ? [
                    [
                      "Aporte",
                      result.contribution > 0
                        ? `${fmt(result.contribution)} / ${result.contributionFrequency === "anual" ? "ano" : "mês"}`
                        : "—",
                    ],
                  ]
                : []),
              [
                "Rentabilidade",
                `+${((result.profit / Math.max(result.totalInvested, 1)) * 100).toFixed(2)}%`,
              ],
            ].map(([k, v]) => (
              <div
                key={String(k)}
                className="bg-[var(--bg-tertiary)] rounded-lg p-3"
              >
                <p className="text-[var(--text-muted)] mb-0.5">{k}</p>
                <p className="font-semibold text-[var(--text-primary)]">{v}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 flex-wrap border-b border-[var(--border)] pb-3">
            <TabBtn
              active={tab === "line"}
              onClick={() => setTab("line")}
              icon={TrendingUp}
              label="Evolução"
            />
            <TabBtn
              active={tab === "bar"}
              onClick={() => setTab("bar")}
              icon={BarChart2}
              label="Barras"
            />
            <TabBtn
              active={tab === "table"}
              onClick={() => setTab("table")}
              icon={Table2}
              label="Tabela"
            />
            <TabBtn
              active={tab === "compare"}
              onClick={() => setTab("compare")}
              icon={GitCompare}
              label="Comparar"
            />
          </div>

          {/* Line chart */}
          {tab === "line" && (
            <div>
              <div className="flex gap-4 text-xs text-[var(--text-muted)] mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-8 h-0.5 bg-emerald-500 inline-block rounded" />
                  Patrimônio
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-8 h-0.5 bg-indigo-400 inline-block rounded"
                    style={{ borderTop: "2px dashed #818cf8", height: 0 }}
                  />
                  Total investido
                </span>
              </div>
              <div style={{ height: 260 }}>
                <Line
                  data={lineData}
                  options={chartOpts as Parameters<typeof Line>[0]["options"]}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                Meses
              </p>
            </div>
          )}

          {/* Bar chart */}
          {tab === "bar" && (
            <div>
              <div className="flex gap-4 text-xs text-[var(--text-muted)] mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-indigo-500 inline-block rounded-sm" />
                  Total investido
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 inline-block rounded-sm" />
                  Juros
                </span>
              </div>
              <div style={{ height: 260 }}>
                <Bar
                  data={barData}
                  options={barOpts as Parameters<typeof Bar>[0]["options"]}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                Meses
              </p>
            </div>
          )}

          {/* Table */}
          {tab === "table" && (
            <div ref={tableRef}>
              <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                      <th className="text-center px-3 py-2.5 font-medium">
                        Mês
                      </th>
                      <th className="text-right px-3 py-2.5 font-medium">
                        Total investido
                      </th>
                      <th className="text-right px-3 py-2.5 font-medium">
                        Juros acumulados
                      </th>
                      <th className="text-right px-3 py-2.5 font-medium">
                        Patrimônio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((r, i) => (
                      <tr
                        key={r.month}
                        className={`border-b border-[var(--border)] last:border-b-0 ${i % 2 !== 0 ? "bg-[var(--bg-tertiary)]" : ""}`}
                      >
                        <td className="text-center px-3 py-2 text-[var(--text-muted)]">
                          {r.month}
                        </td>
                        <td className="text-right px-3 py-2">
                          {fmt(r.invested)}
                        </td>
                        <td className="text-right px-3 py-2 text-emerald-400">
                          {fmt(r.interest)}
                        </td>
                        <td className="text-right px-3 py-2 font-medium text-[var(--text-primary)]">
                          {fmt(r.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 13 && (
                <button
                  type="button"
                  onClick={() => setShowFullTable((v) => !v)}
                  className="w-full mt-2 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-lg transition"
                >
                  {showFullTable
                    ? "Ver menos"
                    : `Ver todos os ${rows.length} meses`}
                </button>
              )}
            </div>
          )}

          {/* Compare */}
          {tab === "compare" &&
            otherRows.length > 0 &&
            (() => {
              const myFinal = rows[rows.length - 1]?.total ?? 0;
              const otherFinal = otherRows[otherRows.length - 1]?.total ?? 0;
              const diff = Math.abs(myFinal - otherFinal);
              const winner = myFinal >= otherFinal ? label : otherLabel;
              const myColor = type === "composta" ? "#10b981" : "#818cf8";
              const otherColor = type === "composta" ? "#818cf8" : "#10b981";

              return (
                <div className="flex flex-col gap-4">
                  <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">
                      Resultado final
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="rounded-lg p-3"
                        style={{
                          border: `1px solid ${myColor}33`,
                          background: `${myColor}0d`,
                        }}
                      >
                        <p className="text-xs mb-1" style={{ color: myColor }}>
                          {label}
                        </p>
                        <p
                          className="font-bold text-base"
                          style={{ color: myColor }}
                        >
                          {fmt(myFinal)}
                        </p>
                      </div>
                      <div
                        className="rounded-lg p-3"
                        style={{
                          border: `1px solid ${otherColor}33`,
                          background: `${otherColor}0d`,
                        }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: otherColor }}
                        >
                          {otherLabel}
                        </p>
                        <p
                          className="font-bold text-base"
                          style={{ color: otherColor }}
                        >
                          {fmt(otherFinal)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] text-center">
                      <span className="font-semibold text-emerald-400">
                        {winner}
                      </span>{" "}
                      gera {fmt(diff)} a mais no período
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-8 h-0.5 inline-block rounded"
                        style={{ background: myColor }}
                      />
                      {label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-8 h-0.5 inline-block"
                        style={{ borderTop: `2px dashed ${otherColor}` }}
                      />
                      {otherLabel}
                    </span>
                  </div>
                  <div style={{ height: 260 }}>
                    <Line
                      data={compareData}
                      options={
                        chartOpts as Parameters<typeof Line>[0]["options"]
                      }
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] text-center">
                    Meses
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border-l-2 border-emerald-500">
                      <p className="font-semibold text-[var(--text-primary)] mb-1">
                        Juros Compostos
                      </p>
                      <p className="text-[var(--text-muted)] leading-relaxed">
                        Juros incidem sobre o saldo acumulado. Crescimento
                        exponencial — quanto maior o tempo, maior a diferença.
                      </p>
                      <p className="font-mono text-emerald-400 mt-1.5">
                        M = P × (1 + r)ᵗ
                      </p>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border-l-2 border-indigo-400">
                      <p className="font-semibold text-[var(--text-primary)] mb-1">
                        Juros Simples
                      </p>
                      <p className="text-[var(--text-muted)] leading-relaxed">
                        Juros incidem sempre sobre o principal original.
                        Crescimento linear e previsível.
                      </p>
                      <p className="font-mono text-indigo-400 mt-1.5">
                        M = P × (1 + r × t)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Save */}
          <div className="pt-1 border-t border-[var(--border)]">
            {saved ? (
              <p className="text-center text-emerald-400 text-sm">
                ✓ Simulação salva!
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 py-2.5 rounded-lg transition text-sm font-medium"
              >
                <Save size={15} />
                {saving ? "Salvando..." : "Salvar simulação"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
