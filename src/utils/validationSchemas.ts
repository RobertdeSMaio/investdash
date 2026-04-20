import * as Yup from "yup";

const strongPassword = Yup.string()
  .min(8, "Mínimo 8 caracteres")
  .matches(/[A-Z]/, "Precisa de ao menos uma letra maiúscula")
  .matches(/[0-9]/, "Precisa de ao menos um número")
  .matches(/[^A-Za-z0-9]/, "Precisa de ao menos um caractere especial")
  .required("Senha obrigatória");

export const loginSchema = Yup.object({
  email: Yup.string().email("E-mail inválido").required("E-mail obrigatório"),
  password: Yup.string().required("Senha obrigatória"),
});

export const registerSchema = Yup.object({
  name: Yup.string().min(2, "Nome muito curto").required("Nome obrigatório"),
  email: Yup.string().email("E-mail inválido").required("E-mail obrigatório"),
  password: strongPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Senhas não coincidem")
    .required("Confirmação obrigatória"),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email("E-mail inválido").required("E-mail obrigatório"),
});

export const resetPasswordSchema = Yup.object({
  newPassword: strongPassword,
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Senhas não coincidem")
    .required("Confirmação obrigatória"),
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Senha atual obrigatória"),
  newPassword: strongPassword,
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Senhas não coincidem")
    .required("Confirmação obrigatória"),
});

export const updateProfileSchema = Yup.object({
  name: Yup.string().min(2, "Nome muito curto").required("Nome obrigatório"),
});
