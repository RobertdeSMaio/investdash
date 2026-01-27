import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("E-mail inválido")
      .required("O e-mail é obrigatório"),
    password: Yup.string()
      .min(6, "A senha deve ter pelo mens 6 caracteres")
      .required("A senha é obrigatória"),
  });

  /* Validação e post do formulário do login*/
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Dados do login:", values);
      try {
        const response = await axios.post(
          "http://localhost:3000/login",
          values,
        );

        localStorage.setItem("token", response.data.token);
      } catch (error) {
        alert("E-mail ou senha incorretos.");
      }
      /*alert("Login realizado com sucesso! Verifique o console.");*/
    },
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 shadow-md rounded-lg">
      <div className="bg-sky-200 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-sky-600 mb-6 text-center">
          Login
        </h1>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {/* Campo E-mail */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              {...formik.getFieldProps("email")}
              className={`p-2 border rounded-lg outline-none shadow-md ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-xs">
                {formik.errors.email}
              </span>
            )}
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col gap-1 mb-6">
            <label htmlFor="password">Senha</label>

            {/* O container do input e do botão precisa ser relative e NÃO ter flex-col */}
            <div className="relative flex items-center">
              <input
                id="password"
                {...formik.getFieldProps("password")}
                // O type vem DEPOIS do getFieldProps para garantir que o estado mande
                type={showPassword ? "text" : "password"}
                className={`w-full p-2 border rounded-md outline-none pr-12 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  console.log("Botão clicado! Estado anterior:", showPassword);
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 z-10 p-1 text-xs font-bold text-sky-600 hover:text-sky-800"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>

            {formik.touched.password && formik.errors.password && (
              <span className="text-red-500 text-xs">
                {formik.errors.password}
              </span>
            )}
          </div>
          <div className="space-x-59">
            <button
              type="submit"
              className="mt-2 bg-sky-500 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors"
            >
              Entrar
            </button>
            <Link
              to="/register"
              className="mt-2 bg-sky-500 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors"
            >
              Registrar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
