import type { Route } from "./+types/api.complete";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.json() as {
    email: string;
    nombres: string;
    documentNumber: string;
    operationDate: string;
    transactionId: string;
  };

  if (!payload.transactionId || !payload.email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // TODO: conectar con la API real de Cineplanet para registrar la compra
  return Response.json({ codigoRespuesta: "0" });
}
