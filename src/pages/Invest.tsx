import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, BarChart2 } from "lucide-react";
import { NavBar } from "../components/NavBar";

export default function Invest() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Calculadora de Juros</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          Simule investimentos com aportes mensais ou anuais, em período mensal ou anual.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/juros-simples"
            className="group bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-blue-500/50 rounded-xl p-6 flex flex-col gap-3 transition">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Juros Simples</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Rendimento sobre o principal. Suporta aportes mensais/anuais e período em meses ou anos.
              </p>
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-xs mt-auto">
              Calcular <ArrowRight size={14} />
            </div>
          </Link>
          <Link to="/juros-compostos"
            className="group bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-purple-500/50 rounded-xl p-6 flex flex-col gap-3 transition">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition">
              <BarChart2 className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Juros Compostos</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Rendimento sobre o montante acumulado. Ideal para investimentos de longo prazo com aportes.
              </p>
            </div>
            <div className="flex items-center gap-1 text-purple-400 text-xs mt-auto">
              Calcular <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
