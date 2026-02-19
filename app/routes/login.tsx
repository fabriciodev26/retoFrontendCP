import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Iniciar sesión" },
    { name: "description", content: "Inicia sesión para continuar con tu compra" },
  ];
}

export default function Login() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cp-red">Login</h1>
      <p className="text-gray-400 mt-2">Próximamente: Google Sign-In e ingreso como invitado.</p>
    </main>
  );
}
