import { Link } from "react-router";
import type { Route } from "./+types/not-found";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Página no encontrada" },
    { name: "description", content: "La página que buscas no existe" },
  ];
}

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center flex flex-col items-center gap-4">
        <span className="text-8xl font-bold text-cp-red/20 select-none">404</span>
        <div>
          <h1 className="text-2xl font-bold">Página no encontrada</h1>
          <p className="text-gray-400 text-sm mt-1">
            La URL que ingresaste no existe o fue movida.
          </p>
        </div>
        <Link
          to="/"
          className="mt-2 px-6 py-3 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white font-medium transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
