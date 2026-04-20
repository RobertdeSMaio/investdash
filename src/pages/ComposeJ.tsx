import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { InvestCalculator } from "../components/InvestCalculator";

function calcCompound(principal: number, rate: number, period: number) {
  const finalAmount = principal * Math.pow(1 + rate / 100, period);
  const profit = finalAmount - principal;
  return {
    principal,
    rate,
    period,
    finalAmount: Math.round(finalAmount * 100) / 100,
    profit: Math.round(profit * 100) / 100,
  };
}

export default function ComposeJ() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/invest" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-xl font-bold mb-1">Juros Compostos</h1>
        <p className="text-gray-400 text-sm mb-6">
          Fórmula: <span className="font-mono text-gray-300">M = P × (1 + r)ᵗ</span>
        </p>
        <InvestCalculator
          type="Compound"
          label="Juros Compostos"
          color="bg-purple-600 hover:bg-purple-500"
          calculate={calcCompound}
        />
      </main>
    </div>
  );
}
