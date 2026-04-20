import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { TrendingUp, CheckCircle } from "lucide-react";
import { authService } from "../services/authService";
import { registerSchema } from "../utils/validationSchemas";
import { Input } from "../components/shared/Input";

export default function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await authService.register(values);
        setSuccess(true);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setFieldError("email", e?.response?.data?.message ?? "Erro ao cadastrar.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <CheckCircle className="text-emerald-400" size={48} />
          <h2 className="text-2xl font-bold text-white">Cadastro realizado!</h2>
          <p className="text-gray-400 max-w-xs">
            Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada antes de entrar.
          </p>
          <button onClick={() => navigate("/login")} className="mt-2 text-emerald-400 hover:text-emerald-300 underline text-sm">
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>
          <p className="text-gray-400 text-sm">Comece a acompanhar seus investimentos</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome"
            type="text"
            placeholder="João Silva"
            {...formik.getFieldProps("name")}
            error={formik.errors.name}
            touched={formik.touched.name}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            {...formik.getFieldProps("email")}
            error={formik.errors.email}
            touched={formik.touched.email}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mín. 8 chars, maiúscula, número, símbolo"
            {...formik.getFieldProps("password")}
            error={formik.errors.password}
            touched={formik.touched.password}
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            {...formik.getFieldProps("confirmPassword")}
            error={formik.errors.confirmPassword}
            touched={formik.touched.confirmPassword}
          />

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg transition"
          >
            {formik.isSubmitting ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Já tem conta?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
