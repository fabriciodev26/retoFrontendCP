import type { PayUResponse } from "@/types";

interface PayUPayload {
  cardNumber: string;
  cardExpiry: string; // MM/YY
  cvv: string;
  email: string;
  fullName: string;
  amount: number;
  documentNumber: string;
  documentType: "DNI" | "CE" | "Pasaporte";
}

export async function processPayment(payload: PayUPayload): Promise<PayUResponse> {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      operationDate: new Date().toISOString(),
      transactionId: `txn-${Date.now()}`,
    };
  }

  const response = await fetch("/api/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error ?? "Payment failed");
  }

  return response.json() as Promise<PayUResponse>;
}
