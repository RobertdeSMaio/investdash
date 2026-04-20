import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Save, RefreshCw } from "lucide-react";
import { Input } from "./shared/Input";
import { investmentService } from "../services/investmentService";

interface CalcResult {
  principal: number;
  finalAmount: number;
  profit: number;
  rate: number;
  period: number;
}

interface Props {
  type: "simples" | "composta";
  label: string;
  color: string;
  calculate: (principal: number, rate: number, period: number) => CalcResult;
}

const schema = Yup.object({
  name: Yup.string().min(2, "Nome muito curto").required("Nome obrigatório"),
  principal: Yup.number().positive("Deve ser positivo").required("Obrigatório"),
  rate: Yup.number().positive("Deve ser positivo").max(100, "Máx 100%").required("Obrigatório"),
  period: Yup.number().integer("Deve ser inteiro").positive("Deve ser positivo").required("Obrigatório"),
});

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function InvestCalculator({ type, label, color, calculate }: Props) {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", principal: "", rate: "", period: "" },
    validationSchema: schema,
    onSubmit: (values) => {
      const r = calculate(Number(values.principal), Number(values.rate), Number(values.period));
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

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={formik.handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
        <Input
          label="Nome da simulação"
          type="text"
          placeholder="Ex: CDB Banco XYZ"
          {...formik.getFieldProps("name")}
          error={formik.errors.name}
          touched={formik.touched.name}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            label="Taxa (% ao mês)"
            type="number"
            placeholder="1.5"
            min="0"
            step="0.01"
            {...formik.getFieldProps("rate")}
            error={formik.errors.rate}
            touched={formik.touched.rate}
          />
          <Input
            label="Período (meses)"
            type="number"
            placeholder="12"
            min="1"
            step="1"
            {...formik.getFieldProps("period")}
            error={formik.errors.period}
            touched={formik.touched.period}
          />
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
            className="px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Resultado</h3>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Principal</p>
              <p className="font-bold text-white">{fmt(result.principal)}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Valor final</p>
              <p className="font-bold text-emerald-400">{fmt(result.finalAmount)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Lucro</p>
              <p className="font-bold text-emerald-400">{fmt(result.profit)}</p>
            </div>
          </div>

          {saved ? (
            <p className="text-center text-emerald-400 text-sm">Simulação salva no dashboard!</p>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 py-2.5 rounded-lg transition text-sm font-medium"
            >
              <Save size={15} />
              {saving ? "Salvando..." : "Salvar no dashboard"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
