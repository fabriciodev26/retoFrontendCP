import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { getPremiereById, type PremierePage } from "@/services/premieres";
import type { Premiere } from "@/types";
import type { Route } from "./+types/premiere";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const movie = await getPremiereById(params.id!);
  return { movie };
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.movie?.titulo;
  return [
    { title: title ? `Cineplanet — ${title}` : "Cineplanet — Detalle de película" },
    {
      name: "description",
      content: title
        ? `Compra entradas para ${title} en Cineplanet`
        : "Descubre los últimos estrenos de Cineplanet",
    },
  ];
}

function SkeletonDetail() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-10 animate-pulse">
      <div className="max-w-4xl mx-auto">
        <div className="h-4 w-24 rounded bg-cp-gray mb-6" />
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div className="w-full sm:w-56 shrink-0 aspect-[2/3] rounded-2xl bg-cp-gray" />
          <div className="flex flex-col gap-4 flex-1 pt-2">
            <div className="h-7 w-3/4 rounded bg-cp-gray" />
            <div className="flex flex-col gap-2 mt-2">
              <div className="h-3 w-full rounded bg-cp-gray" />
              <div className="h-3 w-5/6 rounded bg-cp-gray" />
              <div className="h-3 w-4/6 rounded bg-cp-gray" />
              <div className="h-3 w-full rounded bg-cp-gray" />
              <div className="h-3 w-3/4 rounded bg-cp-gray" />
            </div>
            <div className="mt-6 h-12 w-48 rounded-xl bg-cp-gray" />
          </div>
        </div>
      </div>
    </main>
  );
}

// Shown during the initial page load (direct URL access)
export function HydrateFallback() {
  return <SkeletonDetail />;
}

export default function Premiere({ loaderData }: Route.ComponentProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Prefer list cache (instant if coming from home), then loader data
  const { data: movie } = useQuery({
    queryKey: ["premiere", id],
    queryFn: () => getPremiereById(id!),
    initialData: () => {
      const cached = queryClient.getQueryData<InfiniteData<PremierePage>>(["premieres"]);
      return cached?.pages.flatMap((p) => p.items).find((p) => p.id === id)
        ?? loaderData.movie
        ?? undefined;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id && loaderData.movie !== null,
  });

  if (!movie) {
    return (
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-4xl mx-auto rounded-xl bg-cp-gray border border-white/10 px-6 py-16 text-center">
          <p className="text-gray-300 font-medium">Película no encontrada</p>
          <p className="text-gray-500 text-sm mt-1">
            Es posible que haya sido removida de la cartelera.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-5 py-2 rounded-lg border border-white/20 text-gray-300 text-sm hover:text-white hover:border-white/40 transition-colors"
          >
            Ver cartelera
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Cartelera
        </button>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div className="w-full sm:w-56 shrink-0">
            <img
              src={movie.imagen}
              alt={movie.titulo}
              loading="lazy"
              className="w-full aspect-[2/3] object-cover rounded-2xl shadow-lg"
            />
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
              {movie.titulo}
            </h1>

            <span className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-cp-red/10 border border-cp-red/20 text-cp-red text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cp-red" />
              En cartelera
            </span>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {movie.descripcion}
            </p>

            <div className="mt-2 border-t border-white/10 pt-4 flex flex-col gap-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Adquiere tus productos de dulcería
              </p>
              <button
                onClick={() => navigate("/dulceria")}
                className="w-full sm:w-auto sm:self-start px-6 py-3 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white font-semibold transition-colors"
              >
                Comprar entradas
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
