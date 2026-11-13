import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import type { Severity } from "../../utils/portfolioAnalysis";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 min-w-0 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>}
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-red-400" : "text-[var(--text-primary)]";
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 min-w-0">
      <p className="text-xs text-[var(--text-muted)] truncate">{label}</p>
      <p className={`text-lg font-bold truncate ${toneClass}`}>{value}</p>
      {hint && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{hint}</p>}
    </div>
  );
}

const SEVERITY = {
  alerta: { icon: OctagonAlert, label: "Alerta", className: "text-red-400 bg-red-500/10 border-red-500/30" },
  atencao: { icon: AlertTriangle, label: "Atenção", className: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  info: { icon: Info, label: "Info", className: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
} satisfies Record<Severity, { icon: React.ElementType; label: string; className: string }>;

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY[severity];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${s.className}`}>
      <Icon size={11} aria-hidden />
      {s.label}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-14">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="text-center py-10 text-sm text-[var(--text-muted)]">{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
