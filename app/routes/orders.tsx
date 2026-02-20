import { useQuery } from "@tanstack/react-query";
import { Navigate, Link } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { getOrders } from "@/services/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Order } from "@/types";
import type { Route } from "./+types/orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Mis pedidos" },
    { name: "description", content: "Historial de tus compras en Cineplanet" },
  ];
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function SkeletonOrder() {
  return (
    <div className="bg-cp-gray rounded-2xl p-4 sm:p-6 animate-pulse flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="h-4 w-32 rounded bg-cp-gray-light" />
        <div className="h-4 w-20 rounded bg-cp-gray-light" />
      </div>
      <div className="h-px bg-cp-gray-light" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-3/4 rounded bg-cp-gray-light" />
        <div className="h-3 w-1/2 rounded bg-cp-gray-light" />
      </div>
      <div className="h-3 w-40 rounded bg-cp-gray-light" />
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-cp-gray rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Fecha</span>
          <span className="text-sm text-gray-200">{formatDate(order.createdAt)}</span>
        </div>
        <span className="font-bold text-lg shrink-0">{formatCurrency(order.total)}</span>
      </div>

      <div className="border-t border-white/10" />

      <ul className="flex flex-col gap-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {item.nombre}
              <span className="text-gray-500 ml-1">x{item.cantidad}</span>
            </span>
            <span className="text-gray-400">{formatCurrency(item.precio * item.cantidad)}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/10" />

      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">N.º de transacción</span>
        <span className="text-xs font-mono text-gray-400 break-all">
          {order.payUResponse.transactionId}
        </span>
      </div>
    </div>
  );
}

export default function Orders() {
  const { user, hydrated } = useAuthStore();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders", user?.email ?? ""],
    queryFn: () => getOrders(user!.email),
    enabled: hydrated && !!user,
  });

  if (!hydrated) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Inicio
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8">
        <span className="text-cp-red">Mis</span> pedidos
      </h1>

      {isError && (
        <div className="rounded-xl bg-cp-gray border border-white/10 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No se pudieron cargar tus pedidos. Intenta de nuevo.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonOrder key={i} />)}
        </div>
      )}

      {!isLoading && !isError && orders?.length === 0 && (
        <div className="rounded-xl bg-cp-gray border border-white/10 px-6 py-16 text-center">
          <p className="text-gray-300 font-medium">Aún no tienes pedidos</p>
          <p className="text-gray-500 text-sm mt-1">Tus compras aparecerán aquí</p>
        </div>
      )}

      {!isLoading && !isError && orders && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}
