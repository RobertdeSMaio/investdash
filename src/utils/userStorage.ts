import type { Profile } from "./portfolioAnalysis";

const PROFILES: Profile[] = ["conservador", "moderado", "arrojado"];
const MAX_SNAPSHOTS = 730;
const ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

export interface Snapshot {
  date: string;
  cost: number;
  current: number;
}

function key(kind: string, userId: string): string | null {
  return ID_REGEX.test(userId) ? `investdash:${kind}:${userId}` : null;
}

function read(k: string | null): unknown {
  if (!k) return null;
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(k: string | null, value: unknown) {
  if (!k) return;
  try {
    localStorage.setItem(k, JSON.stringify(value));
  } catch {
    return;
  }
}

export function loadProfile(userId: string): Profile | null {
  const v = read(key("perfil", userId));
  return PROFILES.includes(v as Profile) ? (v as Profile) : null;
}

export function saveProfile(userId: string, profile: Profile | null) {
  const k = key("perfil", userId);
  if (profile === null) {
    try {
      if (k) localStorage.removeItem(k);
    } catch {
      return;
    }
    return;
  }
  write(k, profile);
}

const isMoney = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0 && n < 1e15;

export function loadSnapshots(userId: string): Snapshot[] {
  const v = read(key("snapshots", userId));
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (s): s is Snapshot =>
        typeof s?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && isMoney(s.cost) && isMoney(s.current),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MAX_SNAPSHOTS);
}

export function recordSnapshot(userId: string, cost: number, current: number, now = new Date()) {
  if (!isMoney(cost) || !isMoney(current)) return;
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const list = loadSnapshots(userId).filter((s) => s.date !== date);
  list.push({ date, cost: Math.round(cost * 100) / 100, current: Math.round(current * 100) / 100 });
  write(key("snapshots", userId), list.slice(-MAX_SNAPSHOTS));
}

export function clearSnapshots(userId: string) {
  const k = key("snapshots", userId);
  try {
    if (k) localStorage.removeItem(k);
  } catch {
    return;
  }
}
