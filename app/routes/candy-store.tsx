import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Navigate } from "react-router";
import { toast } from "sonner";
import { getCandyStore } from "@/services/candystore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CandyProduct } from "@/types";
import type { Route } from "./+types/candy-store";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Dulcería" },
    { name: "description", content: "Selecciona tus productos de dulcería" },
  ];
}

function SkeletonCard() {
  return (
    <div className="bg-cp-gray rounded-xl p-4 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-cp-gray-light mb-2" />
      <div className="h-3 w-full rounded bg-cp-gray-light mb-1" />
      <div className="h-3 w-4/5 rounded bg-cp-gray-light mb-4" />
      <div className="flex items-center justify-between mt-4">
        <div className="h-5 w-16 rounded bg-cp-gray-light" />
        <div className="h-8 w-24 rounded-lg bg-cp-gray-light" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: CandyProduct }) {
  const { items, addItem, removeItem } = useCartStore();
  const cantidad = items.find((i) => i.id === product.id)?.cantidad ?? 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.nombre} agregado`);
  };

  return (
    <div
      className={`bg-cp-gray rounded-xl p-4 flex flex-col gap-3 transition-all ${
        cantidad > 0 ? "ring-1 ring-cp-red/60" : ""
      }`}
    >
      <div>
        <h3 className="font-semibold text-sm sm:text-base">{product.nombre}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">{product.descripcion}</p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="font-bold text-sm sm:text-base">{formatCurrency(product.precio)}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => removeItem(product.id)}
            disabled={cantidad === 0}
            className="w-9 h-9 rounded-lg bg-cp-gray-light text-white font-bold hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{cantidad}</span>
          <button
            onClick={handleAdd}
            className="w-9 h-9 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white font-bold transition-colors text-lg"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandyStore() {
  const navigate = useNavigate();
  const { user, hydrated } = useAuthStore();
  const { items, total, clearCart } = useCartStore();

  if (!hydrated) return null;
  if (!user) return <Navigate to="/login?redirect=/dulceria" replace />;
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmClear(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [confirmClear]);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["candystore"],
    queryFn: getCandyStore,
  });

  const filtered = useMemo(
    () =>
      products?.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      ) ?? [],
    [products, search]
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-28">
      <h1 className="text-2xl sm:text-3xl font-bold mb-5 md:mb-6">
        <span className="text-cp-red">Dulcería</span>
      </h1>

      <div className="relative mb-5">
        <SearchIcon />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full rounded-lg bg-cp-gray pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cp-red"
        />
      </div>

      {isError && (
        <div className="rounded-xl bg-cp-gray border border-white/10 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No se pudieron cargar los productos. Intenta de nuevo.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl bg-cp-gray border border-white/10 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No se encontraron productos para "{search}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm bg-cp-gray rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">Limpiar carrito</h2>
              <p className="text-gray-400 text-sm mt-1">
                ¿Estás seguro? Se eliminarán todos los productos seleccionados.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { clearCart(); setConfirmClear(false); }}
                className="flex-1 py-3 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-cp-gray/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-400 truncate">
              {totalItems > 0
                ? `${totalItems} ${totalItems === 1 ? "producto" : "productos"}`
                : "Sin productos"}
            </span>
            <span className="text-lg sm:text-xl font-bold">{formatCurrency(total)}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalItems > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-sm text-gray-400 hover:text-cp-red transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => navigate("/pago")}
              disabled={items.length === 0}
              className="px-6 sm:px-8 py-3 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
