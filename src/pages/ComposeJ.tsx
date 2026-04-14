import { type ApexOptions } from "apexcharts";
import { Calculator } from "lucide-react";
import { useState } from "react";
import Chart from "react-apexcharts";
import CardResult from "../componentes/composedTax/CardResult";
import InputGroup from "../componentes/inputs/InputGroup";

interface LogMensal {
  mes: number;
  jurosNoMes: number;
  totalInvestido: number;
  totalJuros: number;
  acumulado: number;
}

export default function ComposeJ() {
  const [valorInicial, setValorInicial] = useState(0);
  const [aporteMensal, setAporteMensal] = useState(0);
  const [taxa, setTaxa] = useState(0);
  const [periodo, setPeriodo] = useState(0);
  const [tipoPeriodo, setTipoPeriodo] = useState("ANOS");
  const [tipoTaxPeriodo, setTipoTaxPeriodo] = useState("ANUAL");

  const [logs, setLogs] = useState<LogMensal[]>([]);
  const [resumo, setResumo] = useState({
    totalFinal: 0,
    investido: 0,
    juros: 0,
  });

  const calcular = () => {
    const mesesTotais = tipoPeriodo === "ANOS" ? periodo * 12 : periodo;
    const taxaMensal =
      tipoTaxPeriodo === "ANUAL" ? taxa / 100 / 12 : taxa / 100;

    let acumulado = valorInicial;
    let investidoTotal = valorInicial;
    let jurosAcumulado = 0;
    const historico: LogMensal[] = [];

    for (let i = 0; i <= mesesTotais; i++) {
      if (i > 0) {
        const jurosDoMes = acumulado * taxaMensal;
        jurosAcumulado += jurosDoMes;
        investidoTotal += aporteMensal;
        acumulado += jurosDoMes + aporteMensal;
      }
      historico.push({
        mes: i,
        jurosNoMes: acumulado * taxaMensal,
        totalInvestido: investidoTotal,
        totalJuros: jurosAcumulado,
        acumulado: acumulado,
      });
    }

    setLogs(historico);
    setResumo({
      totalFinal: acumulado,
      investido: investidoTotal,
      juros: jurosAcumulado,
    });
  };

  const barOptions: ApexOptions = {
    chart: { stacked: true, toolbar: { show: false } },
    colors: ["#475569", "#94a3b8"],
    xaxis: { categories: logs.map((l) => l.mes), title: { text: "Meses" } },
    yaxis: { labels: { formatter: (v) => `R$ ${v.toFixed(0)}` } },
    dataLabels: { enabled: false },
  };

  const donutOptions: ApexOptions = {
    labels: ["Valor Investido", "Total em Juros"],
    colors: ["#475569", "#94a3b8"],
    legend: { position: "bottom" },
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen p-6 space-y-6">
        <div className="max-w-6xl mx-auto bg-gray-200 p-6 rounded-lg shadow-md ">
          <h2 className="text-xs font-bold uppercase mb-6 flex items-center gap-2">
            Simulador de Juros Compostos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="ini"
              label="Valor Inicial"
              prefix="R$"
              onChange={setValorInicial}
            />
            <InputGroup
              id="taxa"
              label="Taxa de Juros"
              prefix="%"
              onChange={setTaxa}
              hasSelect
              setTipo={setTipoTaxPeriodo}
            />
            <InputGroup
              id="per"
              label="Período"
              onChange={setPeriodo}
              hasSelectPeriodo
              setTipo={setTipoPeriodo}
            />
            <InputGroup
              id="mes"
              label="Investimento Mensal"
              prefix="R$"
              onChange={setAporteMensal}
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={calcular}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-sky-500 rounded text-xs font-bold hover:bg-slate-900 shadow-lg"
            >
              <Calculator size={14} /> CALCULAR
            </button>
          </div>
        </div>

        {resumo.totalFinal > 0 && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardResult
                label="Total em Juros"
                value={resumo.juros}
                color="text-blue-500"
              />
              <CardResult
                label="Total Investido"
                value={resumo.investido}
                color="text-slate-600"
              />
              <CardResult
                label="Valor Final"
                value={resumo.totalFinal}
                color="text-amber-600"
              />
            </div>
            <div className="bg-gray-200 p-4 rounded shadow border flex flex-col items-center">
              <h3 className="text-[10px] font-bold uppercase self-start mb-4">
                Proporção
              </h3>
              <Chart
                options={donutOptions}
                series={[resumo.investido, resumo.juros]}
                type="donut"
                width="100%"
              />
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="max-w-6xl mx-auto bg-gray-200 p-6 rounded shadow border">
            <h3 className="text-xs font-bold uppercase mb-6 border-b pb-2">
              Gráfico de Evolução
            </h3>
            <Chart
              options={barOptions}
              series={[
                { name: "Investido", data: logs.map((l) => l.totalInvestido) },
                { name: "Juros", data: logs.map((l) => l.totalJuros) },
              ]}
              type="bar"
              height={350}
            />
          </div>
        )}
      </div>
    </>
  );
}
