import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Plus, Trash2 } from "lucide-react";
import { NavBar } from "../components/NavBar";
import { EmailConfirmBanner } from "../components/shared/EmailConfirmBanner";
import { investmentService } from "../services/investmentService";
import type { Investment } from "../types";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    investmentService.getAll()
      .then(setInvestments)
      .finally(() => setLoading(false));
  }, []);

  const totalInvested = investments.reduce((s, i) => s + i.principal, 0);
  const totalFinal = investments.reduce((s, i) => s + i.finalAmount, 0);
  const totalProfit = investments.reduce((s, i) => s + i.profit, 0);

  const handleDelete = async (id: string) => {
    await investmentService.remove(id);
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <EmailConfirmBanner />

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <Link
            to="/invest"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Novo cálculo
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total investido" value={fmt(totalInvested)} icon={DollarSign} color="bg-blue-500/20 text-blue-400" />
          <StatCard label="Valor final" value={fmt(totalFinal)} icon={BarChart2} color="bg-emerald-500/20 text-emerald-400" />
          <StatCard
            label="Lucro total"
            value={fmt(totalProfit)}
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
            color={totalProfit >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}
          />
        </div>

        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Histórico de simulações</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma simulação ainda.</p>
              <Link to="/invest" className="text-emerald-400 text-sm hover:underline mt-1 inline-block">
                Fazer primeira simulação
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-gray-800">
                    <th className="text-left px-5 py-3">Nome</th>
                    <th className="text-left px-5 py-3">Tipo</th>
                    <th className="text-right px-5 py-3">Principal</th>
                    <th className="text-right px-5 py-3">Taxa</th>
                    <th className="text-right px-5 py-3">Período</th>
                    <th className="text-right px-5 py-3">Final</th>
                    <th className="text-right px-5 py-3">Lucro</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="px-5 py-3 font-medium">{inv.name}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${inv.type === "simples" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                          {inv.type === "simples" ? "Simples" : "Composta"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-300">{fmt(inv.principal)}</td>
                      <td className="px-5 py-3 text-right text-gray-300">{inv.rate}%</td>
                      <td className="px-5 py-3 text-right text-gray-300">{inv.period}m</td>
                      <td className="px-5 py-3 text-right font-medium">{fmt(inv.finalAmount)}</td>
                      <td className={`px-5 py-3 text-right font-medium ${inv.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmt(inv.profit)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
