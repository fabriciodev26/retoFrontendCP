interface CompletePayload {
  email: string;
  nombres: string;
  documentNumber: string;
  operationDate: string;
  transactionId: string;
}

interface CompleteResponse {
  codigoRespuesta: string;
}

export async function completeTransaction(
  payload: CompletePayload
): Promise<CompleteResponse> {
  const response = await fetch("/api/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Transaction completion failed");

  return response.json() as Promise<CompleteResponse>;
}
