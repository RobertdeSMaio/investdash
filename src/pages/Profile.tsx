import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { User, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { safeErrorMessage } from "../services/api";
import { authService } from "../services/authService";
import { changePasswordSchema, updateProfileSchema } from "../utils/validationSchemas";
import { Input } from "../components/shared/Input";
import { NavBar } from "../components/NavBar";
import { EmailConfirmBanner } from "../components/shared/EmailConfirmBanner";

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 ${type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const profileForm = useFormik({
    initialValues: { name: user?.name ?? "" },
    enableReinitialize: true,
    validationSchema: updateProfileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setProfileMsg(null);
      try {
        await authService.updateProfile({ name: values.name.trim() });
        await refreshUser();
        setProfileMsg({ type: "success", text: "Nome atualizado com sucesso!" });
      } catch {
        setProfileMsg({ type: "error", text: "Erro ao atualizar perfil." });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const pwForm = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setPwMsg(null);
      try {
        await authService.changePassword(values);
        resetForm();
        // O backend revoga todas as sessões ao trocar a senha: encerra a atual
        // já e pede um novo login, em vez de expirar silenciosamente depois.
        navigate("/login", {
          replace: true,
          state: { notice: "Senha alterada com sucesso! Entre novamente com a nova senha." },
        });
        await logout();
        return;
      } catch (err: unknown) {
        setPwMsg({ type: "error", text: safeErrorMessage(err, "Senha atual incorreta.") });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <EmailConfirmBanner />

        <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <User className="text-emerald-400" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Informações do perfil</h2>
              <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit} className="flex flex-col gap-4">
            {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}
            <Input
              label="Nome"
              type="text"
              {...profileForm.getFieldProps("name")}
              error={profileForm.errors.name}
              touched={profileForm.touched.name}
            />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1">E-mail</label>
                <p className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-muted)] text-sm">
                  {user?.email}
                </p>
              </div>
              <div className="mt-5">
                <span className={`text-xs px-2 py-1 rounded-full ${user?.emailConfirmed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {user?.emailConfirmed ? "Confirmado" : "Pendente"}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={profileForm.isSubmitting}
              className="self-start bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-6 py-2 rounded-lg transition text-sm"
            >
              {profileForm.isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </section>

        <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Lock className="text-blue-400" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Alterar senha</h2>
              <p className="text-xs text-[var(--text-secondary)]">Mantenha sua conta segura</p>
            </div>
          </div>

          <form onSubmit={pwForm.handleSubmit} className="flex flex-col gap-4">
            {pwMsg && <Alert type={pwMsg.type} message={pwMsg.text} />}
            <Input
              label="Senha atual"
              type="password"
              {...pwForm.getFieldProps("currentPassword")}
              error={pwForm.errors.currentPassword}
              touched={pwForm.touched.currentPassword}
            />
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mín. 8 chars, maiúscula, número, símbolo"
              {...pwForm.getFieldProps("newPassword")}
              error={pwForm.errors.newPassword}
              touched={pwForm.touched.newPassword}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              {...pwForm.getFieldProps("confirmNewPassword")}
              error={pwForm.errors.confirmNewPassword}
              touched={pwForm.touched.confirmNewPassword}
            />
            <button
              type="submit"
              disabled={pwForm.isSubmitting}
              className="self-start bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition text-sm"
            >
              {pwForm.isSubmitting ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        </section>

        <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <p className="text-xs text-[var(--text-muted)]">
            Conta criada em {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}
          </p>
        </section>
      </main>
    </div>
  );
}
