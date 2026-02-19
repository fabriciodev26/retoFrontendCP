import md5 from "md5";
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

const DNI_TYPE_MAP: Record<string, string> = {
  DNI: "CC",
  CE: "CE",
  Pasaporte: "PASSPORT",
};

function detectPaymentMethod(cardNumber: string): string {
  const num = cardNumber.replace(/\s/g, "");
  if (/^4/.test(num)) return "VISA";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "MASTERCARD";
  if (/^3[47]/.test(num)) return "AMEX";
  if (/^6/.test(num)) return "DINERS";
  return "VISA";
}

function formatExpiry(expiry: string): string {
  // PayU espera YYYY/MM, el form envía MM/YY
  const [month, year] = expiry.split("/");
  return `20${year}/${month}`;
}

export async function processPayment(payload: PayUPayload): Promise<PayUResponse> {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      operationDate: new Date().toISOString(),
      transactionId: `txn-${Date.now()}`,
    };
  }

  const apiKey = import.meta.env.VITE_PAYU_API_KEY as string;
  const apiLogin = import.meta.env.VITE_PAYU_API_LOGIN as string;
  const merchantId = import.meta.env.VITE_PAYU_MERCHANT_ID as string;
  const accountId = import.meta.env.VITE_PAYU_ACCOUNT_ID as string;
  const baseUrl = import.meta.env.VITE_PAYU_BASE_URL as string;

  const referenceCode = `REF-${Date.now()}`;
  const currency = "PEN";

  // Firma requerida: MD5(apiKey~merchantId~referenceCode~amount~currency)
  const signature = md5(`${apiKey}~${merchantId}~${referenceCode}~${payload.amount}~${currency}`);

  const limaAddress = {
    street1: "Lima",
    street2: "",
    city: "Lima",
    state: "Lima y Callao",
    country: "PE",
    postalCode: "15000",
    phone: "00000000",
  };

  const body = {
    language: "es",
    command: "SUBMIT_TRANSACTION",
    merchant: { apiKey, apiLogin },
    transaction: {
      order: {
        accountId,
        referenceCode,
        description: "Compra en Cineplanet",
        language: "es",
        signature,
        additionalValues: {
          TX_VALUE: { value: payload.amount, currency },
        },
        buyer: {
          merchantBuyerId: "1",
          fullName: payload.fullName,
          emailAddress: payload.email,
          contactPhone: "00000000",
          dniNumber: payload.documentNumber,
          shippingAddress: limaAddress,
        },
        shippingAddress: limaAddress,
      },
      payer: {
        merchantPayerId: "1",
        fullName: payload.fullName,
        emailAddress: payload.email,
        contactPhone: "00000000",
        dniType: DNI_TYPE_MAP[payload.documentType] ?? "CC",
        dniNumber: payload.documentNumber,
        billingAddress: limaAddress,
      },
      creditCard: {
        number: payload.cardNumber.replace(/\s/g, ""),
        securityCode: payload.cvv,
        expirationDate: formatExpiry(payload.cardExpiry),
        name: payload.fullName,
      },
      extraParameters: { INSTALLMENTS_NUMBER: 1 },
      type: "AUTHORIZATION_AND_CAPTURE",
      paymentMethod: detectPaymentMethod(payload.cardNumber),
      paymentCountry: "PE",
      deviceSessionId: `sess-${Date.now()}`,
      ipAddress: "127.0.0.1",
      cookie: document.cookie,
      userAgent: navigator.userAgent,
    },
    test: true,
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as {
    code: string;
    error?: string;
    transactionResponse?: PayUResponse;
  };

  if (data.code !== "SUCCESS") {
    throw new Error(data.error ?? "Payment failed");
  }

  return data.transactionResponse!;
}
