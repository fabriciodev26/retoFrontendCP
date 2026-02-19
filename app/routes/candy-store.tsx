import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getCandyStore } from "@/services/candystore";
import { useCartStore } from "@/store/cartStore";
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

  return (
    <div
      className={`bg-cp-gray rounded-xl p-4 flex flex-col gap-3 transition-all ${
        cantidad > 0 ? "ring-1 ring-cp-red/60" : ""
      }`}
    >
      <div>
        <h3 className="font-semibold">{product.nombre}</h3>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{product.descripcion}</p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="font-bold">{formatCurrency(product.precio)}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => removeItem(product.id)}
            disabled={cantidad === 0}
            className="w-8 h-8 rounded-lg bg-cp-gray-light text-white font-bold hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{cantidad}</span>
          <button
            onClick={() => addItem(product)}
            className="w-8 h-8 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white font-bold transition-colors"
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
  const { items, total } = useCartStore();
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  const { data: products, isLoading } = useQuery({
    queryKey: ["candystore"],
    queryFn: getCandyStore,
  });

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-cp-red">Dulcería</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-cp-gray/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">
              {totalItems > 0
                ? `${totalItems} ${totalItems === 1 ? "producto" : "productos"}`
                : "Sin productos"}
            </span>
            <span className="text-xl font-bold">{formatCurrency(total)}</span>
          </div>

          <button
            onClick={() => navigate("/pago")}
            disabled={items.length === 0}
            className="px-8 py-3 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
