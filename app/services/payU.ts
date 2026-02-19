import type { PayUResponse } from "@/types";

interface PayUPayload {
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  email: string;
  fullName: string;
  amount: number;
}

export async function processPayment(_payload: PayUPayload): Promise<PayUResponse> {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      operationDate: new Date().toISOString(),
      transactionId: `txn-${Date.now()}`,
    };
  }

  const response = await fetch(import.meta.env.VITE_PAYU_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_payload),
  });

  if (!response.ok) throw new Error("Payment processing failed");

  const data = (await response.json()) as { transactionResponse: PayUResponse };
  return data.transactionResponse;
}
