import * as Yup from "yup";

export const LIMITS = {
  email: 254,
  name: 100,
  password: 72,
  anyPassword: 128,
} as const;

const email = Yup.string()
  .trim()
  .max(LIMITS.email, "E-mail muito longo")
  .email("E-mail inválido")
  .required("E-mail obrigatório");

const name = Yup.string()
  .trim()
  .min(2, "Nome muito curto")
  .max(LIMITS.name, `Máximo ${LIMITS.name} caracteres`)
  .matches(/^[^<>{}]*$/, "Caracteres não permitidos")
  .required("Nome obrigatório");

const strongPassword = Yup.string()
  .min(8, "Mínimo 8 caracteres")
  .max(LIMITS.password, `Máximo ${LIMITS.password} caracteres`)
  .matches(/[a-z]/, "Precisa de ao menos uma letra minúscula")
  .matches(/[A-Z]/, "Precisa de ao menos uma letra maiúscula")
  .matches(/[0-9]/, "Precisa de ao menos um número")
  .matches(/[^A-Za-z0-9]/, "Precisa de ao menos um caractere especial")
  .required("Senha obrigatória");

export const loginSchema = Yup.object({
  email,
  password: Yup.string().max(LIMITS.anyPassword, "Senha inválida").required("Senha obrigatória"),
});

export const registerSchema = Yup.object({
  name,
  email,
  password: strongPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Senhas não coincidem")
    .required("Confirmação obrigatória"),
});

export const forgotPasswordSchema = Yup.object({ email });

export const resetPasswordSchema = Yup.object({
  newPassword: strongPassword,
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Senhas não coincidem")
    .required("Confirmação obrigatória"),
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().max(LIMITS.anyPassword).required("Senha atual obrigatória"),
  newPassword: strongPassword.notOneOf(
    [Yup.ref("currentPassword")],
    "A nova senha deve ser diferente da atual",
  ),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Senhas não coincidem")
    .required("Confirmação obrigatória"),
});

export const updateProfileSchema = Yup.object({ name });

export const MAX_MONEY = 1_000_000_000_000;

export const TICKER_REGEX = /^[A-Z0-9][A-Z0-9._+-]{0,19}$/;

export const assetSchema = Yup.object({
  ticker: Yup.string()
    .trim()
    .uppercase()
    .matches(TICKER_REGEX, "Ticker inválido (letras, números, . - _ +; até 20, sem espaços)")
    .required("Ticker obrigatório"),
  name: Yup.string()
    .trim()
    .max(LIMITS.name, `Máximo ${LIMITS.name} caracteres`)
    .matches(/^[^<>{}]*$/, "Caracteres não permitidos")
    .required("Nome obrigatório"),
  type: Yup.string().oneOf(["acao", "fii", "etf", "stock", "renda_fixa"]).required(),
  quantity: Yup.number()
    .typeError("Número inválido")
    .positive("Deve ser maior que zero")
    .max(MAX_MONEY, "Valor muito alto")
    .required("Quantidade obrigatória"),
  avgPrice: Yup.number()
    .typeError("Número inválido")
    .min(0, "Não pode ser negativo")
    .max(MAX_MONEY, "Valor muito alto")
    .required("Preço obrigatório"),
  contributions: Yup.number()
    .typeError("Número inválido")
    .min(0, "Não pode ser negativo")
    .max(MAX_MONEY, "Valor muito alto")
    .default(0),
});
