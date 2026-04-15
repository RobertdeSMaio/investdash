import {
  ArrowRight,
  Bitcoin,
  BriefcaseBusiness,
  LayoutDashboard,
  PiggyBank,
  PlusCircle,
  Scale,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

interface Movimentacao {
  id: number;
  tipo: string;
  nome: string;
  valor: number;
  data: string;
}

interface NewInvestmentCardProps {
  onAdd: (novoMov: Movimentacao) => void;
}

const CLASSES_ATIVO: Record<string, { nome: string; cor: string; icon: any }> =
  {
    ACOES: { nome: "Ações", cor: "#3b82f6", icon: TrendingUp },
    FIIs: { nome: "Fundos Imob.", cor: "#f59e0b", icon: Scale },
    RENDA_FIXA: { nome: "Renda Fixa", cor: "#22c55e", icon: PiggyBank },
    STOCKS: { nome: "Stocks (EUA)", cor: "#a855f7", icon: BriefcaseBusiness },
    CRIPTO: { nome: "Criptomoedas", cor: "#f43f5e", icon: Bitcoin },
    ETFS: { nome: "ETFs Internac.", cor: "#6366f1", icon: LayoutDashboard },
  };

const CORES_GRAFICO = Object.values(CLASSES_ATIVO).map((a) => a.cor);

const fetchHGData = async (symbol: string) => {
  try {
    const response = await fetch(
      `https://api.hgbrasil.com/finance/stock_price?key=SUA_KEY_AQUI&symbol=${symbol}&format=json-cors`, //todo criar chave e colocar na env
    );
    const data = await response.json();
    return data.results[symbol];
  } catch (error) {
    return null;
  }
};

export default function ModernDashboard() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtroAno, setFiltroAno] = useState("2026");

  const movimentacoesDoAno = useMemo(
    () => movimentacoes.filter((mov) => mov.data.startsWith(filtroAno)),
    [movimentacoes, filtroAno],
  );

  const patrimonioTotal = useMemo(
    () => movimentacoesDoAno.reduce((acc, curr) => acc + curr.valor, 0),
    [movimentacoesDoAno],
  );

  const dadosEvolucaoMês = useMemo(() => {
    const meses = Array(12)
      .fill(0)
      .map((_, i) => ({
        mes: `${(i + 1).toString().padStart(2, "0")}/${filtroAno.slice(2)}`,
        valor: 0,
      }));

    movimentacoesDoAno.forEach((mov) => {
      const mesIndex = parseInt(mov.data.substring(5, 7)) - 1;
      if (mesIndex >= 0 && mesIndex < 12) meses[mesIndex].valor += mov.valor;
    });

    let acumulado = 0;
    return meses.map((m) => {
      acumulado += m.valor;
      return { ...m, valor: acumulado };
    });
  }, [movimentacoesDoAno, filtroAno]);

  const dadosAlocacao = useMemo(() => {
    const agrupado = movimentacoesDoAno.reduce((acc: any, curr) => {
      acc[curr.tipo] = (acc[curr.tipo] || 0) + curr.valor;
      return acc;
    }, {});
    return Object.keys(agrupado).map((key) => ({
      name: CLASSES_ATIVO[key]?.nome || key,
      value: agrupado[key],
    }));
  }, [movimentacoesDoAno]);

  const ativosAgrupados = useMemo(() => {
    const agrupamento = movimentacoesDoAno.reduce((acc: any, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = { total: 0, ativos: [] };
      acc[curr.tipo].total += curr.valor;
      acc[curr.tipo].ativos.push(curr);
      return acc;
    }, {});
    return Object.keys(agrupamento).map((key) => ({
      ...(CLASSES_ATIVO[key] || { nome: key, cor: "#ccc", icon: PlusCircle }),
      ...agrupamento[key],
    }));
  }, [movimentacoesDoAno]);

  return (
    <div className="p-6 bg-gray-300 min-h-screen text-stone-900 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-stone-100 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-950">
            Controle de Patrimônio
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-stone-400 uppercase font-bold">
              Patrimônio
            </p>
            <p className="text-2xl font-black text-emerald-600">
              R${" "}
              {patrimonioTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            className="bg-stone-100 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="2028">2028</option>
            <option value="2027">2027</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-stone-800 mb-6">
              Evolução Patrimonial
            </h2>
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosEvolucaoMês}>
                  <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8f8f7" }}
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-stone-800 mb-4">
              Alocação de Ativos
            </h2>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2 h-55">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosAlocacao}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dadosAlocacao.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CORES_GRAFICO[index % CORES_GRAFICO.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2">
                {dadosAlocacao.map((item, index) => (
                  <LegendItem
                    key={item.name}
                    color={CORES_GRAFICO[index % CORES_GRAFICO.length]}
                    title={item.name}
                    value={item.value}
                    total={patrimonioTotal}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <NewInvestmentCard
            onAdd={(novo) => setMovimentacoes([...movimentacoes, novo])}
          />

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-stone-800 mb-4 text-lg">
              Resumo por Classe
            </h2>
            <div className="space-y-3">
              {ativosAgrupados.map((classe, idx) => (
                <AssetClassRow key={idx} classe={classe} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NewInvestmentCard({ onAdd }: NewInvestmentCardProps) {
  const [formData, setFormData] = useState({
    tipo: "ACOES",
    nome: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [description, setDescription] = useState("");

  const validateTicker = async () => {
    if (formData.nome.length < 5) return;
    setLoading(true);
    const result = await fetchHGData(formData.nome);
    if (result && !result.error) {
      setIsValid(true);
      setDescription(result.name);
    } else {
      setIsValid(false);
      setDescription("");
      alert("Ativo inválido ou não encontrado na HG Brasil.");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid && (formData.tipo === "ACOES" || formData.tipo === "FIIs")) {
      return alert("Valide o ativo na B3 antes de lançar.");
    }
    if (!formData.nome || !formData.valor) return alert("Preencha tudo!");

    onAdd({
      id: Date.now(),
      tipo: formData.tipo,
      nome: formData.nome,
      valor: parseFloat(formData.valor),
      data: formData.data,
    });

    setFormData({ ...formData, nome: "", valor: "" });
    setIsValid(false);
    setDescription("");
  };

  return (
    <div className="bg-gray-400 p-6 rounded-3xl text-black shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle size={20} />
        <h2 className="font-bold text-black">Novo Lançamento</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          className="w-full bg-gray-300 rounded-xl px-4 py-3 text-sm border-none outline-none appearance-none cursor-pointer"
        >
          {Object.keys(CLASSES_ATIVO).map((key) => (
            <option key={key} value={key} className="bg-gray-300">
              {CLASSES_ATIVO[key].nome}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 relative">
            <input
              type="text"
              placeholder="Código (Ex: PETR4)"
              value={formData.nome}
              onBlur={validateTicker}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value.toUpperCase() })
              }
              className={`w-full bg-gray-300 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-black ${isValid ? "border-2 border-emerald-500" : ""}`}
            />
            {loading && (
              <span className="absolute right-3 top-3 text-[10px] animate-pulse">
                Buscando...
              </span>
            )}
          </div>
          <input
            type="number"
            placeholder="Valor"
            value={formData.valor}
            onChange={(e) =>
              setFormData({ ...formData, valor: e.target.value })
            }
            className="w-full bg-gray-300 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-black"
          />
          <input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="w-full bg-gray-300 rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>

        {description && (
          <p className="text-[10px] text-emerald-900 font-bold truncate px-1">
            {description}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-white text-black rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 mt-2 hover:bg-emerald-50 transition-all"
        >
          Confirmar Lançamento <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

function LegendItem({ color, title, value, total }: any) {
  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <p className="text-[10px] text-stone-400 truncate">{title}</p>
        <p className="text-xs font-bold">{percent}%</p>
      </div>
    </div>
  );
}

function AssetClassRow({ classe }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${classe.cor}15`, color: classe.cor }}
      >
        <classe.icon size={18} />
      </div>
      <div className="grow">
        <h4 className="text-xs font-bold text-stone-700">{classe.nome}</h4>
        <p className="text-[10px] text-stone-400">Total acumulado</p>
      </div>
      <p className="font-bold text-sm">
        R$ {classe.total.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
