import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, BarChart2 } from "lucide-react";
import { NavBar } from "../components/NavBar";

export default function Invest() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">Calculadora de Juros</h1>
        <p className="text-gray-400 text-sm mb-8">Escolha o tipo de cálculo que deseja realizar.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/invest/simples"
            className="group bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-xl p-6 flex flex-col gap-3 transition"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Juros Simples</h2>
              <p className="text-xs text-gray-400 mt-1">
                Rendimento calculado apenas sobre o principal. Ideal para empréstimos e financiamentos básicos.
              </p>
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-xs mt-auto">
              Calcular <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/invest/composto"
            className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 flex flex-col gap-3 transition"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition">
              <BarChart2 className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Juros Compostos</h2>
              <p className="text-xs text-gray-400 mt-1">
                Rendimento calculado sobre o montante acumulado. Padrão em investimentos de longo prazo.
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
