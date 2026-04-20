import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { InvestCalculator } from "../components/InvestCalculator";

function calcSimple(principal: number, rate: number, period: number) {
  const profit = principal * (rate / 100) * period;
  return { principal, rate, period, finalAmount: principal + profit, profit };
}

export default function SimpleJ() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/invest" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-xl font-bold mb-1">Juros Simples</h1>
        <p className="text-gray-400 text-sm mb-6">
          Fórmula: <span className="font-mono text-gray-300">M = P × (1 + r × t)</span>
        </p>
        <InvestCalculator
          type="simples"
          label="Juros Simples"
          color="bg-blue-600 hover:bg-blue-500"
          calculate={calcSimple}
        />
      </main>
    </div>
  );
}
