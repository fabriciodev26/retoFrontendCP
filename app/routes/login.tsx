import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase.client";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Iniciar sesión" },
    { name: "description", content: "Inicia sesión para continuar con tu compra" },
  ];
}

const firebaseReady = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/dulceria", { replace: true });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { displayName, email } = result.user;
      setPendingUser({ name: displayName ?? "Usuario", email: email ?? "" });
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (pendingUser) setUser(pendingUser);
    navigate("/dulceria");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Bienvenido</h1>
          <p className="text-gray-400 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <div className="bg-cp-gray rounded-2xl p-6 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-center text-cp-red">{error}</p>
          )}

          {firebaseReady && (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {loading ? "Iniciando sesión..." : "Continuar con Google"}
            </button>
          )}

          {firebaseReady && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">o</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          )}

          <button
            onClick={() => navigate("/dulceria")}
            className="w-full py-3 rounded-lg border border-white/10 text-gray-300 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
          >
            Ingresar como invitado
          </button>
        </div>
      </div>

      {pendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-cp-gray rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-cp-red/10 flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">¡Bienvenido/a!</h2>
              <p className="text-gray-300 mt-1">{pendingUser.name}</p>
            </div>
            <p className="text-gray-400 text-sm">
              Ya puedes seleccionar tus productos de dulcería.
            </p>
            <button
              onClick={handleAccept}
              className="w-full py-3 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white font-medium transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.805.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
