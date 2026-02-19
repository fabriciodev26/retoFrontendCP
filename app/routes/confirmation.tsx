import type { Route } from "./+types/confirmation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Compra confirmada" },
    { name: "description", content: "Tu compra fue procesada exitosamente" },
  ];
}

export default function Confirmation() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cp-red">Confirmación</h1>
    </main>
  );
}
