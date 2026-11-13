const REFRESH_KEY = "refreshToken";
const LEGACY_KEYS = ["accessToken", "refreshToken"];

let accessToken: string | null = null;

try {
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
} catch {
}

function safeSession<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const tokenStorage = {
  getAccess: () => accessToken,
  getRefresh: () =>
    safeSession(() => sessionStorage.getItem(REFRESH_KEY), null),

  set(access: string, refresh: string) {
    accessToken = access;
    safeSession(() => sessionStorage.setItem(REFRESH_KEY, refresh), undefined);
  },

  clear() {
    accessToken = null;
    safeSession(() => sessionStorage.removeItem(REFRESH_KEY), undefined);
  },

  hasSession: () => Boolean(accessToken || tokenStorage.getRefresh()),
};

export const SESSION_EXPIRED_EVENT = "auth:session-expired";
