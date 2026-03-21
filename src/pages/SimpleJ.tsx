import { type ApexOptions } from "apexcharts";
import { Calculator } from "lucide-react";
import { useState } from "react";
import Chart from "react-apexcharts";
import CardResult from "../componentes/composedTax/CardResult";

export default function SimpleJ() {
  const [valorInicial, setValorInicial] = useState(0);
  const [aporteMensal] = useState(0);
  const [taxa, setTaxa] = useState(0);
  const [periodo, setPeriodo] = useState(0);
  const [tipoPeriodo, setTipoPeriodo] = useState("ANOS");
  const [tipoTaxPeriodo, setTipoTaxPeriodo] = useState("ANUAL");

  const [logs, setLogs] = useState<any[]>([]);
  const [resumo, setResumo] = useState({ final: 0, juros: 0, investido: 0 });

  const calcularSimples = () => {
    const mesesTotais = tipoPeriodo === "ANOS" ? periodo * 12 : periodo;
    const taxaMensal =
      tipoTaxPeriodo === "ANUAL" ? taxa / 100 : taxa / 100 / 12;

    const juroFixoMensal = valorInicial * taxaMensal;
    const historico = [];

    for (let i = 0; i <= mesesTotais; i++) {
      const totalInvestido = valorInicial + aporteMensal * i;
      const totalJuros = juroFixoMensal * i;
      const acumulado = totalInvestido + totalJuros;

      historico.push({
        mes: i,
        jurosNoMes: i === 0 ? 0 : juroFixoMensal,
        totalInvestido,
        totalJuros,
        acumulado,
      });
    }

    setLogs(historico);
    const ultimo = historico[historico.length - 1];
    setResumo({
      final: ultimo.acumulado,
      juros: ultimo.totalJuros,
      investido: ultimo.totalInvestido,
    });
  };

  const barOptions: ApexOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: false } },
    colors: ["#475569", "#94a3b8"],
    xaxis: {
      categories: logs.map((l) => l.mes),
      title: { text: "Meses", style: { fontSize: "10px" } },
    },
    yaxis: {
      labels: { formatter: (val) => `R$ ${val.toFixed(2)}` },
      tickAmount: 6,
    },
    dataLabels: { enabled: false },
    plotOptions: { bar: { columnWidth: "70%" } },
  };

  return (
    <>
      <div className="max-w-6xl mx-auto bg-sky-200 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="ini"
              className="text-[10px] font-bold text-gray-400 uppercase"
            >
              Valor Inicial
            </label>
            <div className="flex border rounded overflow-hidden">
              <span className="bg-gray-50 px-3 py-2 text-xs border-r">R$</span>
              <input
                id="ini"
                type="number"
                title="Valor Inicial"
                className="w-full p-2 outline-none"
                onChange={(e) => setValorInicial(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="tax"
              className="text-[10px] font-bold text-gray-400 uppercase"
            >
              Taxa de Juros
            </label>
            <div className="flex border rounded overflow-hidden">
              <span className="bg-gray-50 px-3 py-2 text-xs border-r">%</span>
              <input
                id="tax"
                type="number"
                title="Taxa"
                className="w-full p-2 outline-none"
                onChange={(e) => setTaxa(Number(e.target.value))}
              />
              <select
                title="Tipo Taxa"
                className="bg-white px-2 border-l text-[10px] font-bold"
                onChange={(e) => setTipoTaxPeriodo(e.target.value)}
              >
                <option>ANUAL</option>
                <option>MENSAL</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="per"
              className="text-[10px] font-bold text-gray-400 uppercase"
            >
              Período
            </label>
            <div className="flex border rounded overflow-hidden">
              <input
                id="per"
                type="number"
                title="Período"
                className="w-full p-2 outline-none"
                onChange={(e) => setPeriodo(Number(e.target.value))}
              />
              <select
                title="Tipo Período"
                className="bg-white px-2 border-l text-[10px] font-bold"
                onChange={(e) => setTipoPeriodo(e.target.value)}
              >
                <option value="ANOS">ANOS</option>
                <option value="MESES">MESES</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={calcularSimples}
            className="flex items-center gap-1 px-6 py-2 bg-sky-100 text-sky-500 rounded text-[10px] font-bold uppercase hover:bg-gray-900 shadow-md"
          >
            <Calculator size={14} /> Calcular
          </button>
        </div>
      </div>

      {resumo.final > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <CardResult
              label="Total em Juros"
              value={resumo.juros}
              color="text-blue-300"
            />
            <CardResult
              label="Valor Total Investido"
              value={resumo.investido}
              color="text-slate-500"
            />
            <CardResult
              label="Valor Total Final"
              value={resumo.final}
              color="text-amber-600"
            />
          </div>

          <div className="bg-sky-200 p-6 rounded shadow-sm">
            <h3 className="text-[10px] font-bold uppercase mb-4 text-gray-400 border-b pb-2">
              Gráfico de Evolução
            </h3>
            <Chart
              options={barOptions}
              series={[
                {
                  name: "Valor Investido",
                  data: logs.map((l) => l.totalInvestido),
                },
                {
                  name: "Valor em Juros",
                  data: logs.map((l) => l.totalJuros),
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </div>
      )}
    </>
  );
}
