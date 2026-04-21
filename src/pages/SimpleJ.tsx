import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InvestCalculator } from "../components/InvestCalculator";
import { NavBar } from "../components/NavBar";

function calcSimple(
  principal: number,
  rate: number,
  period: number,
  periodUnit: "mensal" | "anual",
  contribution: number,
  contributionFrequency: "mensal" | "anual",
) {
  const months = periodUnit === "anual" ? period * 12 : period;
  const monthlyRate = periodUnit === "anual" ? rate / 100 / 12 : rate / 100;
  const monthlyContrib =
    contributionFrequency === "anual" ? contribution / 12 : contribution;

  const principalFinal = principal * (1 + monthlyRate * months);
  const totalContribs = monthlyContrib * months;
  const contribInterest =
    (monthlyContrib * months * (monthlyRate * months)) / 2;
  const finalAmount = principalFinal + totalContribs + contribInterest;
  const totalInvested = principal + totalContribs;

  return {
    principal,
    rate,
    period,
    periodUnit,
    contribution,
    contributionFrequency,
    finalAmount: Math.round(finalAmount * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    profit: Math.round((finalAmount - totalInvested) * 100) / 100,
  };
}

function calcCompound(
  principal: number,
  rate: number,
  period: number,
  periodUnit: "mensal" | "anual",
  contribution: number,
  contributionFrequency: "mensal" | "anual",
) {
  const months = periodUnit === "anual" ? period * 12 : period;
  const monthlyRate =
    periodUnit === "anual" ? Math.pow(1 + rate / 100, 1 / 12) - 1 : rate / 100;
  const monthlyContrib =
    contributionFrequency === "anual" ? contribution / 12 : contribution;

  const finalAmount =
    monthlyRate === 0
      ? principal + monthlyContrib * months
      : principal * Math.pow(1 + monthlyRate, months) +
        monthlyContrib *
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  const totalInvested = principal + monthlyContrib * months;

  return {
    principal,
    rate,
    period,
    periodUnit,
    contribution,
    contributionFrequency,
    finalAmount: Math.round(finalAmount * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    profit: Math.round((finalAmount - totalInvested) * 100) / 100,
  };
}

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
          calculate={calcSimple}
          calculateOther={calcCompound}
          otherLabel="Juros Compostos"
        />
      </main>
    </div>
  );
}
