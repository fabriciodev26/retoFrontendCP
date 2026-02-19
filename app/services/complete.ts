interface CompletePayload {
  email: string;
  nombres: string;
  numeroDni: string;
  operationDate: string;
  transactionId: string;
}

interface CompleteResponse {
  codigoRespuesta: string;
}

export async function completeTransaction(
  payload: CompletePayload
): Promise<CompleteResponse> {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { codigoRespuesta: "0" };
  }

  const response = await fetch("/api/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Transaction completion failed");

  return response.json() as Promise<CompleteResponse>;
}
