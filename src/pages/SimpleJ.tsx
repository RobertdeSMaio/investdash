import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InvestCalculator } from "../components/InvestCalculator";
import { NavBar } from "../components/NavBar";

export default function SimpleJ() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-6 transition"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-xl font-bold mb-1 text-[var(--text-primary)]">
          Juros Simples
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          Fórmula:{" "}
          <span className="font-mono text-[var(--text-primary)]">
            M = P × (1 + r × t)
          </span>
        </p>
        <InvestCalculator
          type="simples"
          label="Juros Simples"
          color="bg-blue-600 hover:bg-blue-500"
          otherLabel="Juros Compostos"
          showContributions={false}
        />
      </main>
    </div>
  );
}
