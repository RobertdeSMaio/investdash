import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { SESSION_EXPIRED_EVENT, tokenStorage } from "./tokenStorage";

function resolveApiUrl(): string {
  const raw = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
  if (!raw) throw new Error("VITE_API_URL não configurada.");
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("VITE_API_URL inválida.");
  }
  const isLocal = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(import.meta.env.DEV && isLocal)) {
    throw new Error("VITE_API_URL deve usar HTTPS.");
  }
  return raw;
}

export const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  allowAbsoluteUrls: false,
  withCredentials: false,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error("Sem sessão.");

  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 15000, withCredentials: false },
  );
  if (typeof data?.accessToken !== "string" || typeof data?.refreshToken !== "string") {
    throw new Error("Resposta de refresh inválida.");
  }
  tokenStorage.set(data.accessToken, data.refreshToken);
  return data.accessToken;
}

function expireSession() {
  tokenStorage.clear();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = /\/auth\/(login|refresh|logout)/.test(original?.url ?? "");

    if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (!tokenStorage.getRefresh()) {
      expireSession();
      return Promise.reject(error);
    }

    try {
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (err) {
      expireSession();
      return Promise.reject(err);
    }
  },
);

export function safeErrorMessage(err: unknown, fallback: string): string {
  const e = err as AxiosError<{ message?: unknown }>;
  const status = e?.response?.status ?? 0;
  const msg = e?.response?.data?.message;
  if (status >= 400 && status < 500 && status !== 401 && typeof msg === "string" && msg.length <= 200) {
    return msg;
  }
  return fallback;
}

export default api;
