import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-lg transition ${pathname === to ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-white">
            <TrendingUp className="text-emerald-400" size={20} />
            InvestDash
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {link("/", "Dashboard")}
            {link("/invest", "Juros Simples")}
            {link("/invest/composto", "Juros Compostos")}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition ${pathname === "/profile" ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"}`}
          >
            <User size={16} />
            <span className="hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
