import { useEffect, useState } from "react";
import { MailWarning, X } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const RESEND_COOLDOWN_S = 60;

export function EmailConfirmBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [cooldown, setCooldown] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  if (!user || user.emailConfirmed || hidden) return null;

  const resend = async () => {
    if (status === "sending" || cooldown > 0) return;
    setStatus("sending");
    try {
      await authService.resendConfirmation();
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setCooldown(RESEND_COOLDOWN_S);
    }
  };

  const message = {
    idle: "Seu e-mail ainda não foi confirmado. Algumas funcionalidades podem estar restritas.",
    sending: "Enviando...",
    sent: "E-mail de confirmação reenviado! Verifique sua caixa de entrada.",
    error: "Não foi possível reenviar agora. Tente novamente em instantes.",
  }[status];

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-amber-300">
      <MailWarning size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={resend}
        disabled={status === "sending" || cooldown > 0}
        className="underline hover:text-amber-100 whitespace-nowrap disabled:opacity-50 disabled:no-underline"
      >
        {cooldown > 0 ? `Reenviar (${cooldown}s)` : "Reenviar"}
      </button>
      <button onClick={() => setHidden(true)} className="hover:text-white" aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
