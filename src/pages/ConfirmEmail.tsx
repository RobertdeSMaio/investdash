import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { consumeLinkParams } from "../utils/linkParams";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [link] = useState(consumeLinkParams);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!link) { setStatus("error"); return; }

    authService.confirmEmail(link.token, link.email)
      .then(() => { if (user) refreshUser(); setStatus("success"); })
      .catch(() => setStatus("error"));
  }, [link, user, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center flex flex-col items-center gap-4">
        {status === "loading" && (
          <>
            <Loader className="text-emerald-400 animate-spin" size={40} />
            <p className="text-white">Confirmando seu e-mail...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="text-emerald-400" size={48} />
            <h2 className="text-2xl font-bold text-white">E-mail confirmado!</h2>
            <p className="text-gray-400 text-sm">Sua conta está ativa. Bem-vindo ao InvestDash!</p>
            <button onClick={() => navigate("/")} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg transition">
              Acessar dashboard
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="text-red-400" size={48} />
            <h2 className="text-2xl font-bold text-white">Link inválido</h2>
            <p className="text-gray-400 text-sm">O link expirou ou já foi utilizado.</p>
            <button onClick={() => navigate("/login")} className="text-emerald-400 underline text-sm">
              Ir para o login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
