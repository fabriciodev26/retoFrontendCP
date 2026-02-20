import { useState } from "react";
import { NavLink } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

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
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/dulceria" className={navLinkClass}>
              Dulcería
            </NavLink>
          </li>
          {user?.email && (
            <li>
              <NavLink to="/mis-pedidos" className={navLinkClass}>
                Mis pedidos
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/dulceria" className="relative flex items-center text-gray-400 hover:text-white transition-colors" aria-label="Carrito">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-cp-red text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            {user?.email ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 max-w-[140px] truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
              >
                Iniciar sesión
              </NavLink>
            )}
          </li>
        </ul>

        {/* Mobile right: cart + hamburger grouped */}
        <div className="md:hidden flex items-center gap-1">
          <NavLink to="/dulceria" className="relative flex items-center text-gray-400 hover:text-white transition-colors p-2" aria-label="Carrito">
            <CartIcon />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-cp-red text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </NavLink>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
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
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/dulceria" className={mobileNavLinkClass} onClick={closeMenu}>
              Dulcería
            </NavLink>
          </li>
          {user?.email && (
            <li>
              <NavLink to="/mis-pedidos" className={mobileNavLinkClass} onClick={closeMenu}>
                Mis pedidos
              </NavLink>
            </li>
          )}
          <li>
            {user?.email ? (
              <div className="flex flex-col gap-1">
                <span className="px-4 py-2 text-xs text-gray-500 truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                onClick={closeMenu}
                className="block w-full px-4 py-3 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
              >
                Iniciar sesión
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
