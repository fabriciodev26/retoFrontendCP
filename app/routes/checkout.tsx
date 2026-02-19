import type { Route } from "./+types/checkout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Pago" },
    { name: "description", content: "Completa tu pago de forma segura" },
  ];
}

export default function Checkout() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cp-red">Pago</h1>
    </main>
  );
}
