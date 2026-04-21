import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-lg transition ${
        pathname === to
          ? "text-emerald-400 bg-emerald-500/10"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <TrendingUp className="text-emerald-400" size={20} />
            InvestDash
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {link("/", "Carteira")}
            {link("/juros-simples", "Juros Simples")}
            {link("/juros-compostos", "Juros Compostos")}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
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
    </header>
  );
}
