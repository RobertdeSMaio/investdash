import {
  BarChart2,
  ChevronDown,
  DollarSign,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavBar } from "../components/NavBar";
import { EmailConfirmBanner } from "../components/shared/EmailConfirmBanner";
import { usePortfolio } from "../hooks/usePortfolio";
import { safeErrorMessage } from "../services/api";
import { portfolioService } from "../services/portfolioService";
import type { AddAssetRequest, AssetType, PortfolioAsset, Quote } from "../types";
import {
  ASSET_BADGE as ASSET_COLORS,
  ASSET_ICONS,
  ASSET_LABELS,
  ASSET_TYPES,
  fmtBRL as fmt,
  fmtPct,
} from "../utils/assetMeta";
import { assetSchema, LIMITS } from "../utils/validationSchemas";

function fmtQuote(q: Quote) {
  return q.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: q.currency === "USD" ? "USD" : "BRL",
  });
}

function AssetModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (data: AddAssetRequest) => Promise<void>;
  initial?: PortfolioAsset;
}) {
  const [ticker, setTicker] = useState(initial?.ticker ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AssetType>(initial?.type ?? "acao");
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? "");
  const [avgPrice, setAvgPrice] = useState(initial?.avgPrice?.toString() ?? "");
  const [contributions, setContributions] = useState(
    initial?.contributions?.toString() ?? "0",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    let data: AddAssetRequest;
    try {
      data = (await assetSchema.validate(
        {
          ticker,
          name,
          type,
          quantity: quantity === "" ? undefined : quantity,
          avgPrice: avgPrice === "" ? undefined : avgPrice,
          contributions: contributions === "" ? 0 : contributions,
        },
        { stripUnknown: true },
      )) as AddAssetRequest;
    } catch (err) {
      setError((err as Error).message);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave(data);
      onClose();
    } catch (err: unknown) {
      setError(safeErrorMessage(err, "Erro ao salvar."));
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; placeholder?: string; required?: boolean; maxLength?: number },
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--text-secondary)]">
        {label}
        {opts?.required !== false && (
          <span className="text-red-400 ml-0.5">*</span>
        )}
      </label>
      <input
        type={opts?.type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={opts?.placeholder}
        maxLength={opts?.maxLength}
        min={opts?.type === "number" ? 0 : undefined}
        step={opts?.type === "number" ? "any" : undefined}
        autoComplete="off"
        className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--text-primary)]">
            {initial ? "Editar ativo" : "Adicionar ativo"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {field("Ticker", ticker, setTicker, {
              placeholder: "PETR4",
              maxLength: 20,
              required: true,
            })}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Tipo<span className="text-red-400 ml-0.5">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssetType)}
                className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {(Object.entries(ASSET_LABELS) as [AssetType, string][]).map(
                  ([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          {field("Nome do ativo", name, setName, {
            placeholder: "Petrobras PN",
            maxLength: LIMITS.name,
            required: true,
          })}
          <div className="grid grid-cols-2 gap-3">
            {field("Quantidade", quantity, setQuantity, {
              type: "number",
              placeholder: "100",
            })}
            {field("Preço médio (R$)", avgPrice, setAvgPrice, {
              type: "number",
              placeholder: "28.50",
            })}
          </div>
          {field("Total aportado (R$)", contributions, setContributions, {
            type: "number",
            placeholder: "0",
            required: false,
          })}

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold transition text-sm"
            >
              {saving ? "Salvando..." : initial ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuoteStrip({ quotes }: { quotes: Record<string, Quote> }) {
  const items = Object.values(quotes);
  if (!items.length) return null;
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Cotações da carteira
        </h2>
        <span className="text-xs text-[var(--text-muted)]">
          Atualizado agora
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {items.map((q) => (
            <div
              key={q.ticker}
              className="px-5 py-3 border-r border-[var(--border)] last:border-r-0 min-w-[130px]"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {q.ticker}
                </span>
                <span
                  className={`text-xs font-medium ${q.changePct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {fmtPct(q.changePct)}
                </span>
              </div>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {fmtQuote(q)}
              </p>
              <p
                className={`text-xs ${q.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {q.change >= 0 ? "▲" : "▼"} {fmtQuote({ ...q, price: Math.abs(q.change) })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    positions: enrichedAssets,
    totals,
    quotes,
    loading,
    quotesLoading,
    reload: loadAssets,
    reloadQuotes,
  } = usePortfolio();
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<
    PortfolioAsset | undefined
  >();
  const [activeType, setActiveType] = useState<AssetType | "todos">("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    activeType === "todos"
      ? enrichedAssets
      : enrichedAssets.filter((a) => a.type === activeType);

  const totalInvested = totals.cost;
  const totalCurrent = totals.current;
  const totalPL = totals.pl;
  const totalContrib = totals.contributions;

  const handleAdd = async (data: AddAssetRequest) => {
    await portfolioService.add(data);
    await loadAssets();
  };

  const handleUpdate = async (data: AddAssetRequest) => {
    if (!editingAsset) return;
    await portfolioService.update(editingAsset.id, data);
    await loadAssets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este ativo da carteira?")) return;
    await portfolioService.remove(id);
    await loadAssets();
  };

  const typeGroups = ASSET_TYPES;
  const counts = typeGroups.reduce(
    (acc, t) => ({
      ...acc,
      [t]: enrichedAssets.filter((a) => a.type === t).length,
    }),
    {} as Record<AssetType, number>,
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <EmailConfirmBanner />

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Carteira
          </h1>
          <button
            onClick={() => {
              setEditingAsset(undefined);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Adicionar ativo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total investido",
              value: fmt(totalInvested),
              icon: DollarSign,
              color: "bg-blue-500/20 text-blue-400",
            },
            {
              label: "Valor atual",
              value: fmt(totalCurrent),
              icon: BarChart2,
              color: "bg-emerald-500/20 text-emerald-400",
            },
            {
              label: "Lucro/Prejuízo",
              value: fmt(totalPL),
              icon: totalPL >= 0 ? TrendingUp : TrendingDown,
              color:
                totalPL >= 0
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400",
            },
            {
              label: "Total aportado",
              value: fmt(totalContrib),
              icon: Landmark,
              color: "bg-purple-500/20 text-purple-400",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {label}
                </p>
                <p className="text-base font-bold text-[var(--text-primary)] truncate">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(quotes).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
                Cotações em tempo real
              </h2>
              <button
                onClick={() => reloadQuotes()}
                disabled={quotesLoading}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <RefreshCw
                  size={12}
                  className={quotesLoading ? "animate-spin" : ""}
                />{" "}
                Atualizar
              </button>
            </div>
            <QuoteStrip quotes={quotes} />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveType("todos")}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${activeType === "todos" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            Todos ({enrichedAssets.length})
          </button>
          {typeGroups
            .filter((t) => counts[t] > 0)
            .map((t) => {
              const Icon = ASSET_ICONS[t];
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${activeType === t ? `${ASSET_COLORS[t]} border-current` : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                >
                  <Icon size={11} /> {ASSET_LABELS[t]} ({counts[t]})
                </button>
              );
            })}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-[var(--text-muted)]">
              <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum ativo nesta categoria.</p>
              <button
                onClick={() => {
                  setEditingAsset(undefined);
                  setShowModal(true);
                }}
                className="text-emerald-400 text-sm hover:underline mt-1 inline-block"
              >
                Adicionar primeiro ativo
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                      <th className="text-left px-5 py-3">Ativo</th>
                      <th className="text-left px-5 py-3">Tipo</th>
                      <th className="text-right px-4 py-3">Qtd</th>
                      <th className="text-right px-4 py-3">Preço médio</th>
                      <th className="text-right px-4 py-3">Cotação</th>
                      <th className="text-right px-4 py-3">Valor atual</th>
                      <th className="text-right px-4 py-3">L/P</th>
                      <th className="text-right px-4 py-3">Aportes</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const pl = a.profitLoss ?? 0;
                      const plPct = a.profitLossPct ?? 0;
                      return (
                        <tr
                          key={a.id}
                          className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition"
                        >
                          <td className="px-5 py-3">
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">
                                {a.ticker}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] truncate max-w-[160px]">
                                {a.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${ASSET_COLORS[a.type]}`}
                            >
                              {ASSET_LABELS[a.type]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                            {a.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                            {fmt(a.avgPrice)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.currentPrice ? (
                              <span className="text-[var(--text-primary)] font-medium">
                                {fmt(a.currentPrice)}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                            {fmt(a.currentValue ?? a.avgPrice * a.quantity)}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${pl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            <div>{fmt(pl)}</div>
                            <div className="text-xs">{fmtPct(plPct)}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                            {fmt(a.contributions ?? 0)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => {
                                  setEditingAsset(a);
                                  setShowModal(true);
                                }}
                                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition rounded"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
                                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-[var(--border)]">
                {filtered.map((a) => {
                  const pl = a.profitLoss ?? 0;
                  const plPct = a.profitLossPct ?? 0;
                  const isExpanded = expandedId === a.id;
                  return (
                    <div key={a.id} className="p-4">
                      <div
                        className="flex items-center justify-between"
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${ASSET_COLORS[a.type]}`}
                          >
                            {a.ticker.slice(0, 3)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[var(--text-primary)]">
                              {a.ticker}
                            </p>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full border ${ASSET_COLORS[a.type]}`}
                            >
                              {ASSET_LABELS[a.type]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-[var(--text-primary)]">
                              {fmt(a.currentValue ?? a.avgPrice * a.quantity)}
                            </p>
                            <p
                              className={`text-xs ${pl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {fmtPct(plPct)}
                            </p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
                          {[
                            ["Quantidade", a.quantity],
                            ["Preço médio", fmt(a.avgPrice)],
                            [
                              "Cotação atual",
                              a.currentPrice ? fmt(a.currentPrice) : "—",
                            ],
                            ["L/P", fmt(pl)],
                            ["Aportes", fmt(a.contributions ?? 0)],
                          ].map(([k, v]) => (
                            <div key={String(k)}>
                              <p className="text-[var(--text-muted)]">{k}</p>
                              <p className="font-medium text-[var(--text-primary)]">
                                {v}
                              </p>
                            </div>
                          ))}
                          <div className="col-span-2 flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingAsset(a);
                                setShowModal(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-xs hover:text-[var(--text-primary)] transition"
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(a.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition"
                            >
                              <Trash2 size={12} /> Remover
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <AssetModal
          onClose={() => {
            setShowModal(false);
            setEditingAsset(undefined);
          }}
          onSave={editingAsset ? handleUpdate : handleAdd}
          initial={editingAsset}
        />
      )}
    </div>
  );
}
