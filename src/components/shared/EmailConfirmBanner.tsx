import { useState } from "react";
import { MailWarning, X } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export function EmailConfirmBanner() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (!user || user.emailConfirmed || hidden) return null;

  const resend = async () => {
    await authService.resendConfirmation();
    setSent(true);
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-amber-300">
      <MailWarning size={18} className="shrink-0" />
      <span className="flex-1">
        {sent
          ? "E-mail de confirmação reenviado! Verifique sua caixa de entrada."
          : "Seu e-mail ainda não foi confirmado. Algumas funcionalidades podem estar restritas."}
      </span>
      {!sent && (
        <button onClick={resend} className="underline hover:text-amber-100 whitespace-nowrap">
          Reenviar
        </button>
      )}
      <button onClick={() => setHidden(true)} className="hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
