import { Link } from "react-router";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-cp-gray border-b border-cp-gray-light">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-cp-red font-bold text-xl tracking-wide">
          CINEPLANET
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium">
          <li>
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link to="/dulceria" className="text-gray-300 hover:text-white transition-colors">
              Dulcería
            </Link>
          </li>
          <li>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-cp-red hover:text-cp-red-dark transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
