import { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePaymentStore } from "@/store/paymentStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Route } from "./+types/confirmation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Compra confirmada" },
    { name: "description", content: "Tu compra fue procesada exitosamente" },
  ];
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function Confirmation() {
  const navigate = useNavigate();
  const { payUResponse, orderItems, orderTotal, clearPayUResponse } = usePaymentStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!payUResponse) navigate("/", { replace: true });
  }, [payUResponse, navigate]);

  // Limpiar al salir para que el botón "atrás" no muestre esta página
  useEffect(() => {
    return () => clearPayUResponse();
  }, [clearPayUResponse]);

  if (!payUResponse) return null;

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 md:py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-5 md:gap-6 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckIcon />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">¡Compra exitosa!</h1>
          <p className="text-gray-400 mt-2">
            Tu pedido fue procesado correctamente.
          </p>
        </div>

        <div className="w-full bg-cp-gray rounded-2xl p-4 sm:p-6 flex flex-col gap-4 text-left">
          {orderItems.length > 0 && (
            <>
              <ul className="flex flex-col gap-2">
                {orderItems.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.nombre}
                      <span className="text-gray-500 ml-1">x{item.cantidad}</span>
                    </span>
                    <span className="text-gray-200">{formatCurrency(item.precio * item.cantidad)}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-gray-400 text-sm">Total pagado</span>
                <span className="font-bold">{formatCurrency(orderTotal)}</span>
              </div>

              <div className="border-t border-white/10" />
            </>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              N.º de transacción
            </span>
            <span className="text-sm font-mono text-gray-200 break-all">
              {payUResponse.transactionId}
            </span>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Fecha y hora
            </span>
            <span className="text-sm text-gray-200">
              {formatDate(payUResponse.operationDate)}
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          {user?.email && (
            <button
              onClick={() => navigate("/mis-pedidos")}
              className="w-full py-4 rounded-xl bg-cp-gray border border-white/10 hover:border-white/30 text-white font-semibold transition-colors"
            >
              Ver mis pedidos
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22c55e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
