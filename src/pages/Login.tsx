import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../utils/validationSchemas";
import { Input } from "../components/shared/Input";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        await login(values.email, values.password);
        navigate("/");
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setServerError(e?.response?.data?.message ?? "E-mail ou senha incorretos.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">InvestDash</h1>
          <p className="text-gray-400 text-sm">Entre na sua conta</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {serverError && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {serverError}
            </p>
          )}

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            {...formik.getFieldProps("email")}
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          <div className="flex flex-col gap-1">
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              {...formik.getFieldProps("password")}
              error={formik.errors.password}
              touched={formik.touched.password}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                Esqueci a senha
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg transition"
          >
            {formik.isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Não tem conta?{" "}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
