import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Estrenos" },
    { name: "description", content: "Descubre los últimos estrenos de Cineplanet" },
  ];
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cp-red">Estrenos</h1>
    </main>
  );
}
