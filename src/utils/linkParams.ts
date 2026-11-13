const TOKEN_REGEX = /^[A-Za-z0-9._~+/=-]{8,2048}$/;
const EMAIL_MAX = 254;

type LinkParams = { token: string; email: string } | null;

let cached: { path: string; value: LinkParams } | null = null;

export function consumeLinkParams(): LinkParams {
  const path = window.location.pathname;
  if (!window.location.search && cached?.path === path) return cached.value;

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";
  const email = (params.get("email") ?? "").trim();

  if (window.location.search) {
    window.history.replaceState(window.history.state, "", path);
  }

  const emailOk = email.length > 0 && email.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+$/.test(email);
  const value = TOKEN_REGEX.test(token) && emailOk ? { token, email } : null;
  cached = { path, value };
  return value;
}
