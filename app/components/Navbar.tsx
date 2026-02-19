import { useState } from "react";
import { NavLink } from "react-router";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { auth } = await import("@/lib/firebase.client");
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    logout();
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white border-b-2 border-cp-red pb-0.5"
      : "text-gray-400 hover:text-white transition-colors";

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-cp-gray border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center">
          <img src="/images/svg/logo.svg" alt="Cineplanet" className="h-7 w-auto" />
        </NavLink>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
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
          {user && (
            <li>
              <NavLink to="/mis-pedidos" className={navLinkClass}>
                Mis pedidos
              </NavLink>
            </li>
          )}
          <li>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 max-w-[140px] truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
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

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Abrir menú"
        >
          <span
            className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 border-t border-white/10" : "max-h-0"
        }`}
      >
        <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
          <li>
            <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dulceria" className={mobileNavLinkClass} onClick={closeMenu}>
              Dulcería
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/mis-pedidos" className={mobileNavLinkClass} onClick={closeMenu}>
                Mis pedidos
              </NavLink>
            </li>
          )}
          <li>
            {user ? (
              <div className="flex flex-col gap-1">
                <span className="px-4 py-2 text-xs text-gray-500 truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-left w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <NavLink to="/login" className={mobileNavLinkClass} onClick={closeMenu}>
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
