import { useState, useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import type { Route } from "./+types/root";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
      })
  );

  const { setUser, setHydrated } = useAuthStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { auth } = await import("@/lib/firebase.client");
      const { onAuthStateChanged } = await import("firebase/auth");

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            name: firebaseUser.displayName ?? "Usuario",
            email: firebaseUser.email ?? "",
          });
        } else {
          setUser(null);
        }
        setHydrated();
      });
    })();

    return () => unsubscribe?.();
  }, []);

  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <QueryClientProvider client={queryClient}>
      {isNavigating && (
        <div className="fixed top-0 inset-x-0 z-[100] h-[2px] bg-cp-red animate-pulse" />
      )}
      <Navbar />
      <Outlet />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center flex flex-col items-center gap-4 max-w-md">
        <span className="text-8xl font-bold text-cp-red/20 select-none">
          {is404 ? "404" : "!"}
        </span>
        <div>
          <h1 className="text-2xl font-bold">
            {is404 ? "Página no encontrada" : "Algo salió mal"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {is404
              ? "La URL que ingresaste no existe o fue movida."
              : "Ocurrió un error inesperado. Por favor intenta de nuevo."}
          </p>
          {import.meta.env.DEV && error instanceof Error && (
            <pre className="mt-4 text-left text-xs text-gray-500 bg-cp-gray rounded-lg p-4 overflow-x-auto max-h-40">
              {error.message}
            </pre>
          )}
        </div>
        <a
          href="/"
          className="mt-2 px-6 py-3 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white font-medium transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
