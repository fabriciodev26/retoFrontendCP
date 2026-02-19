import { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePaymentStore } from "@/store/paymentStore";
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
  const { payUResponse } = usePaymentStore();

  useEffect(() => {
    if (!payUResponse) navigate("/", { replace: true });
  }, []);

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

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white font-semibold transition-colors"
        >
          Volver al inicio
        </button>
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
