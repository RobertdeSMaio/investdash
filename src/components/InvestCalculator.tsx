import { useFormik } from "formik";
import { RefreshCw, Save, TrendingUp } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { investmentService } from "../services/investmentService";
import { Input } from "./shared/Input";

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

interface Props {
  type: "simples" | "composta";
  label: string;
  color: string;
  calculate: (
    principal: number,
    rate: number,
    period: number,
    periodUnit: "mensal" | "anual",
    contribution: number,
    contributionFrequency: "mensal" | "anual",
  ) => CalcResult;
}

const schema = Yup.object({
  name: Yup.string().min(2, "Nome muito curto").required("Nome obrigatório"),
  principal: Yup.number().min(0, "Deve ser >= 0").required("Obrigatório"),
  rate: Yup.number()
    .positive("Deve ser positivo")
    .max(10000, "Máx 10.000%")
    .required("Obrigatório"),
  period: Yup.number()
    .integer("Deve ser inteiro")
    .positive("Deve ser positivo")
    .required("Obrigatório"),
  periodUnit: Yup.string().oneOf(["mensal", "anual"]).required(),
  contribution: Yup.number().min(0, "Deve ser >= 0").required("Obrigatório"),
  contributionFrequency: Yup.string().oneOf(["mensal", "anual"]).required(),
});

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtPct(n: number, total: number) {
  if (total <= 0) return "0%";
  return ((n / total) * 100).toFixed(1) + "%";
}

export function InvestCalculator({ type, label, color, calculate }: Props) {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      principal: "",
      rate: "",
      period: "",
      periodUnit: "mensal" as "mensal" | "anual",
      contribution: "0",
      contributionFrequency: "mensal" as "mensal" | "anual",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const r = calculate(
        Number(values.principal),
        Number(values.rate),
        Number(values.period),
        values.periodUnit,
        Number(values.contribution),
        values.contributionFrequency,
      );
      setResult(r);
      setSaved(false);
    },
  });

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await investmentService.create({
        name: formik.values.name,
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
    setSaved(false);
  };

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

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Principal (R$)"
            type="number"
            placeholder="10000"
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

        {/* Período */}
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
            label="Unidade do período"
            field="periodUnit"
            options={[
              { value: "mensal", label: "Meses" },
              { value: "anual", label: "Anos" },
            ]}
          />
        </div>

        {/* Aportes */}
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

        <div className="flex gap-3">
          <button
            type="submit"
            className={`flex-1 font-semibold py-2.5 rounded-lg transition text-white ${color}`}
          >
            Calcular {label}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[var(--text-primary)]">
              Resultado
            </h3>
          </div>

          {/* Main result cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
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

          {/* Breakdown bar */}
          {result.totalInvested > 0 && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>
                  Principal: {fmtPct(result.principal, result.finalAmount)}
                </span>
                {result.contribution > 0 && (
                  <span>
                    Aportes:{" "}
                    {fmtPct(
                      result.contribution *
                        (result.periodUnit === "anual"
                          ? result.period * 12
                          : result.period),
                      result.finalAmount,
                    )}
                  </span>
                )}
                <span>Juros: {fmtPct(result.profit, result.finalAmount)}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex gap-0.5 bg-[var(--bg-tertiary)]">
                <div
                  className="bg-blue-500 h-full rounded-l-full"
                  style={{
                    width: fmtPct(result.principal, result.finalAmount),
                  }}
                />
                {result.contribution > 0 && (
                  <div
                    className="bg-purple-500 h-full"
                    style={{
                      width: fmtPct(
                        result.totalInvested - result.principal,
                        result.finalAmount,
                      ),
                    }}
                  />
                )}
                <div className="bg-emerald-500 h-full rounded-r-full flex-1" />
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
          )}

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-5">
            {[
              [
                "Taxa",
                `${result.rate}% ${result.periodUnit === "anual" ? "a.a." : "a.m."}`,
              ],
              [
                "Período",
                `${result.period} ${result.periodUnit === "anual" ? "ano(s)" : "mês(es)"}`,
              ],
              [
                "Aporte",
                result.contribution > 0
                  ? `${fmt(result.contribution)} / ${result.contributionFrequency === "anual" ? "ano" : "mês"}`
                  : "—",
              ],
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

          {saved ? (
            <p className="text-center text-emerald-400 text-sm flex items-center justify-center gap-2">
              ✓ Simulação salva na carteira!
            </p>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 py-2.5 rounded-lg transition text-sm font-medium"
            >
              <Save size={15} />
              {saving ? "Salvando..." : "Salvar simulação"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
