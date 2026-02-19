import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getPremieres } from "@/services/premieres";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Estrenos" },
    { name: "description", content: "Descubre los últimos estrenos de Cineplanet" },
  ];
}

function SkeletonCard() {
  return (
    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[160px_1fr] gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl bg-cp-gray animate-pulse">
      <div className="aspect-[2/3] rounded-lg bg-cp-gray-light" />
      <div className="flex flex-col gap-3 py-2">
        <div className="h-5 w-3/4 rounded bg-cp-gray-light" />
        <div className="h-3 w-full rounded bg-cp-gray-light" />
        <div className="h-3 w-5/6 rounded bg-cp-gray-light" />
        <div className="h-3 w-4/6 rounded bg-cp-gray-light" />
        <div className="mt-4 h-8 w-32 rounded-lg bg-cp-gray-light" />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const { data: premieres, isLoading, isError } = useQuery({
    queryKey: ["premieres"],
    queryFn: getPremieres,
  });

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8">
        <span className="text-cp-red">Estrenos</span> en cartelera
      </h1>

      {isError && (
        <div className="rounded-xl bg-cp-gray border border-white/10 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No se pudieron cargar los estrenos. Intenta de nuevo.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : premieres?.map((movie) => (
              <div
                key={movie.id}
                className="grid grid-cols-[100px_1fr] sm:grid-cols-[160px_1fr] gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl bg-cp-gray hover:bg-cp-gray-light transition-colors"
              >
                <img
                  src={movie.imagen}
                  alt={movie.titulo}
                  onClick={() => navigate("/login")}
                  className="w-full aspect-[2/3] object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                />
                <div className="flex flex-col justify-center gap-2">
                  <h2 className="text-sm sm:text-lg font-semibold leading-snug">{movie.titulo}</h2>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {movie.descripcion}
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-2 sm:mt-3 w-full sm:w-auto sm:self-start px-5 py-2 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
                  >
                    Comprar entradas
                  </button>
                </div>
              </div>
            ))}
      </div>
    </main>
  );
}
