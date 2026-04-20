import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { authService } from "../services/authService";
import { resetPasswordSchema } from "../utils/validationSchemas";
import { Input } from "../components/shared/Input";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const formik = useFormik({
    initialValues: { newPassword: "", confirmNewPassword: "" },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        await authService.resetPassword({ token, email, ...values });
        setDone(true);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setServerError(e?.response?.data?.message ?? "Link inválido ou expirado.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-3">
          <AlertCircle className="text-red-400" size={40} />
          <p className="text-white font-semibold">Link inválido</p>
          <button onClick={() => navigate("/forgot-password")} className="text-emerald-400 underline text-sm">
            Solicitar novo link
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <CheckCircle className="text-emerald-400" size={48} />
          <h2 className="text-2xl font-bold text-white">Senha redefinida!</h2>
          <p className="text-gray-400 text-sm">Você já pode entrar com a nova senha.</p>
          <button onClick={() => navigate("/login")} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg transition">
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2">Nova senha</h1>
        <p className="text-gray-400 text-sm mb-6">Escolha uma senha forte para sua conta.</p>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {serverError && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {serverError}
            </p>
          )}
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mín. 8 chars, maiúscula, número, símbolo"
            {...formik.getFieldProps("newPassword")}
            error={formik.errors.newPassword}
            touched={formik.touched.newPassword}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="••••••••"
            {...formik.getFieldProps("confirmNewPassword")}
            error={formik.errors.confirmNewPassword}
            touched={formik.touched.confirmNewPassword}
          />
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition"
          >
            {formik.isSubmitting ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
