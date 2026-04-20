import { useFormik } from "formik";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { authService } from "../services/authService";
import { forgotPasswordSchema } from "../utils/validationSchemas";
import { Input } from "../components/shared/Input";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.forgotPassword(values);
      } finally {
        setSent(true);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8">
          <ArrowLeft size={16} /> Voltar ao login
        </Link>

        {sent ? (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Mail className="text-emerald-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">Verifique seu e-mail</h2>
            <p className="text-gray-400 text-sm">
              Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha em breve.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Esqueci a senha</h1>
            <p className="text-gray-400 text-sm mb-6">
              Informe o e-mail cadastrado e enviaremos um link de redefinição.
            </p>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                {...formik.getFieldProps("email")}
                error={formik.errors.email}
                touched={formik.touched.email}
              />
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition"
              >
                {formik.isSubmitting ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
