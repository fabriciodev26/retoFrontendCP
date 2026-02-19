import type { Route } from "./+types/candy-store";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Dulcería" },
    { name: "description", content: "Selecciona tus productos de dulcería" },
  ];
}

export default function CandyStore() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cp-red">Dulcería</h1>
    </main>
  );
}
