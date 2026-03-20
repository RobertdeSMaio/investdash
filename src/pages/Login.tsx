import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const validationSchema = Yup.object({
    identifier: Yup.string()
      .required("Campo obrigatório")
      .test(
        "test-login",
        "Formato inválido (Use CPF, E-mail ou Nome)",
        (value) => {
          if (!value) return false;

          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          const isCPF = /^\d{11}$/.test(value);
          const isName = value && value.length > 3;

          return Boolean(isEmail || isCPF || isName);
        },
      ),
    password: Yup.string()
      .min(6, "A senha deve ter pelo mens 6 caracteres")
      .required("A senha é obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, actions) => {
      console.log("Dados do login:", values);
      const payload = {
        Email: values.identifier,
        Password: values.password,
      };
      try {
        const response = await axios.post(
          "https://dash-back-hy8l.onrender.com/api/User/registrar​",
          payload,
        );

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("userId", response.data.id);
        navigate("/home");
      } catch (error) {
        console.log("Erro no login", error);
        const err = error as any;
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 400)
        ) {
          actions.setErrors({
            identifier: "E-mail ou senha incorretos",
          });
        } else {
          actions.setErrors({
            identifier:
              "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
          });
        }
      } finally {
        actions.setSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 shadow-md rounded-lg">
      <div className="bg-sky-200 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-sky-600 mb-6 text-center">
          InvestDash
        </h1>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {/* Campo E-mail */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Login
            </label>
            <input
              placeholder="CPF, E-mail ou Nome"
              type="identifier"
              id="identifier"
              {...formik.getFieldProps("identifier")}
              className={`p-2 border rounded-lg outline-none shadow-md ${
                formik.touched.identifier && formik.errors.identifier
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.identifier && formik.errors.identifier && (
              <span className="text-red-500 text-xs">
                {formik.errors.identifier}
              </span>
            )}
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col gap-1 mb-6">
            <label htmlFor="password">Senha</label>

            <div className="relative flex items-center">
              <input
                id="password"
                {...formik.getFieldProps("password")}
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
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              className="mt-2 bg-sky-500 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors"
            >
              Entrar
            </button>
            <Link
              to="/register"
              className="justify-center flex mt-2 bg-sky-500 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors"
            >
              Registrar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
