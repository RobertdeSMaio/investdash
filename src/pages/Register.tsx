import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      cpf: "",
      password: "",
      confirmPassword: "",
      role: "Basic Invester",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Obrigatório"),
      cpf: Yup.string()
        .required("Obrigatório")
        .test("cpf-valido", "CPF inválido", (value) =>
          validateCPF(value || ""),
        ),
      email: Yup.string().email("E-mail inválido").required("Obrigatório"),
      password: Yup.string()
        .min(6, "Mínimo 6 caracteres")
        .required("Obrigatório"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "As senhas não conferem")
        .required("Obrigatório"),
    }),
    onSubmit: async (values, actions) => {
      setServerError(null);
      const payload = {
        Name: values.name,
        Email: values.email,
        Cpf: values.cpf,
        Password: values.password,
        Role: values.role,
      };
      try {
        const response = await axios.post(
          "https://dash-back-hy8l.onrender.com/api/User/registrar",
          payload,
        );
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        navigate("/");
      } catch (error) {
        const err = error as any;
        if (err.response && err.response.status === 409) {
          actions.setErrors({ email: "E-mail já está em uso" });
        } else if (err.response && err.response.status === 400) {
          actions.setErrors({ cpf: "CPF já está em uso" });
        } else {
          actions.setErrors({
            email:
              "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
          });
        }
        console.log("Erro no registro", error);
      } finally {
        actions.setSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-gray-200 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col"
      >
        <h1 className="text-2xl font-bold text-sky-600 mb-10 text-center">
          Register
        </h1>
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm animate-pulse">
            <strong className="font-bold">Ops! </strong>
            <span className="inline">{serverError}</span>
          </div>
        )}
        <div className="flex flex-col gap-1 mb-6">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            placeholder="Nome completo"
            type="text"
            id="name"
            {...formik.getFieldProps("name")}
            className={`p-2 border rounded-lg outline-none shadow-sm transition-all ${
              formik.touched.name && formik.errors.name
                ? "border-red-500"
                : "border-gray-300 focus:border-sky-500"
            }`}
          />
          {formik.touched.name && formik.errors.name && (
            <span className="text-red-500 text-xs">{formik.errors.name}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <label htmlFor="cpf" className="text-sm font-medium text-gray-700">
            CPF
          </label>
          <input
            placeholder="digite o cpf sem pontos"
            type="text"
            id="cpf"
            {...formik.getFieldProps("cpf")}
            className={`p-2 border rounded-lg outline-none shadow-sm transition-all ${
              formik.touched.cpf && formik.errors.cpf
                ? "border-red-500"
                : "border-gray-300 focus:border-sky-500"
            }`}
          />
          {formik.touched.cpf && formik.errors.cpf && (
            <span className="text-red-500 text-xs">{formik.errors.cpf}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            placeholder="exemplo@mail.com"
            type="email"
            id="email"
            {...formik.getFieldProps("email")}
            className={`p-2 border rounded-lg outline-none shadow-sm transition-all ${
              formik.touched.email && formik.errors.email
                ? "border-red-500"
                : "border-gray-300 focus:border-sky-500"
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-red-500 text-xs">{formik.errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Senha
          </label>
          <div className="relative">
            <input
              placeholder="Coleque uma senha segura"
              type={showPassword ? "text" : "password"}
              id="password"
              {...formik.getFieldProps("password")}
              className={`w-full p-2 border rounded-md outline-none shadow-sm transition-all ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300 focus:border-sky-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600 hover:text-sky-800"
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

        <div className="flex flex-col gap-1 mb-10">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Repetir senha
          </label>
          <div className="relative">
            <input
              placeholder="Repita a senha"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              {...formik.getFieldProps("confirmPassword")}
              className={`w-full p-2 border rounded-md outline-none shadow-sm transition-all ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300 focus:border-sky-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600 hover:text-sky-800"
            >
              {showConfirmPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="text-red-500 text-xs">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/"
            className="justify-center flex bg-sky-200 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors shadow-md"
          >
            Voltar
          </Link>
          <button
            type="submit"
            className="bg-sky-300 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors shadow-md"
          >
            Registrar
          </button>
        </div>
      </form>
    </main>
  );
}
