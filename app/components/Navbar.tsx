import { NavLink } from "react-router";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const { user, logout } = useAuthStore();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white border-b-2 border-cp-red pb-0.5"
      : "text-gray-400 hover:text-white transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-cp-gray border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="text-cp-red font-bold text-xl tracking-widest">
          CINEPLANET
        </NavLink>

        <ul className="flex items-center gap-8 text-sm font-medium">
          <li>
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dulceria" className={navLinkClass}>
              Dulcería
            </NavLink>
          </li>
          <li>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 max-w-[140px] truncate">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
