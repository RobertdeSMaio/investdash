import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchQuotes, fetchUsdBrl } from "../services/marketData";
import { portfolioService } from "../services/portfolioService";
import type { PortfolioAsset, Quote } from "../types";
import { buildPositions, totalsOf } from "../utils/portfolioAnalysis";
import { recordSnapshot } from "../utils/userStorage";
import { useAuth } from "./useAuth";

export function usePortfolio() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [usdBrl, setUsdBrl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [snapshotVersion, setSnapshotVersion] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setAssets(await portfolioService.getAll());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const quotableTickers = useMemo(
    () => assets.filter((a) => a.type !== "renda_fixa").map((a) => a.ticker),
    [assets],
  );

  const reloadQuotes = useCallback(async () => {
    if (!quotableTickers.length) {
      setQuotes({});
      setQuotesLoaded(true);
      return;
    }
    setQuotesLoading(true);
    try {
      const needsFx = assets.some((a) => a.type === "stock");
      const [q, fx] = await Promise.all([
        fetchQuotes(quotableTickers),
        needsFx ? fetchUsdBrl() : Promise.resolve(null),
      ]);
      setQuotes(q);
      setUsdBrl(fx);
    } finally {
      setQuotesLoading(false);
      setQuotesLoaded(true);
    }
  }, [assets, quotableTickers]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!loading) reloadQuotes();
  }, [loading, reloadQuotes]);

  const positions = useMemo(() => buildPositions(assets, quotes, usdBrl), [assets, quotes, usdBrl]);
  const totals = useMemo(() => totalsOf(positions), [positions]);

  useEffect(() => {
    if (user && quotesLoaded && !quotesLoading && positions.length) {
      recordSnapshot(user.id, totals.cost, totals.current);
      setSnapshotVersion((v) => v + 1);
    }
  }, [user, quotesLoaded, quotesLoading, positions.length, totals]);

  return {
    assets,
    quotes,
    positions,
    totals,
    usdBrl,
    snapshotVersion,
    quotableTickers,
    loading,
    quotesLoading,
    quotesLoaded,
    error,
    reload,
    reloadQuotes,
  };
}
