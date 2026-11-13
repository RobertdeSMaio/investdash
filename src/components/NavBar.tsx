import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

const LINKS = [
  { to: "/", label: "Carteira" },
  { to: "/acompanhamento", label: "Acompanhamento" },
  { to: "/analise", label: "Análise" },
  { to: "/sugestoes", label: "Sugestões" },
  { to: "/juros-simples", label: "Juros Simples" },
  { to: "/juros-compostos", label: "Juros Compostos" },
];

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = (to: string) =>
    `text-sm px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
      pathname === to
        ? "text-emerald-400 bg-emerald-500/10"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-2 font-bold text-[var(--text-primary)] shrink-0">
            <TrendingUp className="text-emerald-400" size={20} />
            InvestDash
          </Link>
          <nav className="hidden xl:flex items-center gap-1" aria-label="Principal">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass(l.to)} aria-current={pathname === l.to ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/profile"
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition ${
              pathname === "/profile"
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <User size={16} />
            <span className="hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-red-400 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>
      <nav className="xl:hidden border-t border-[var(--border)] overflow-x-auto" aria-label="Principal">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-1">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)} aria-current={pathname === l.to ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
