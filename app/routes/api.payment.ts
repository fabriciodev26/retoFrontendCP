import md5 from "md5";
import type { Route } from "./+types/api.payment";
import type { PayUResponse } from "@/types";

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
  const [month, year] = expiry.split("/");
  return `20${year}/${month}`;
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.json() as {
    cardNumber: string;
    cardExpiry: string;
    cvv: string;
    email: string;
    fullName: string;
    amount: number;
    documentNumber: string;
    documentType: string;
  };

  const apiKey = process.env.PAYU_API_KEY!;
  const apiLogin = process.env.PAYU_API_LOGIN!;
  const merchantId = process.env.PAYU_MERCHANT_ID!;
  const accountId = process.env.PAYU_ACCOUNT_ID!;
  const baseUrl = process.env.PAYU_BASE_URL!;
  const isTest = process.env.PAYU_TEST === "true";

  const referenceCode = `REF-${Date.now()}`;
  const currency = "PEN";
  const signature = md5(`${apiKey}~${merchantId}~${referenceCode}~${payload.amount}~${currency}`);

  const userAgent = request.headers.get("user-agent") ?? "";
  const cookie = request.headers.get("cookie") ?? "";
  const ipAddress = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

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
        number: payload.cardNumber,
        securityCode: payload.cvv,
        expirationDate: formatExpiry(payload.cardExpiry),
        name: payload.fullName,
      },
      extraParameters: { INSTALLMENTS_NUMBER: 1 },
      type: "AUTHORIZATION_AND_CAPTURE",
      paymentMethod: detectPaymentMethod(payload.cardNumber),
      paymentCountry: "PE",
      deviceSessionId: `sess-${Date.now()}`,
      ipAddress,
      cookie,
      userAgent,
    },
    test: isTest,
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const data = await response.json() as {
    code: string;
    error?: string;
    transactionResponse?: PayUResponse;
  };

  if (data.code !== "SUCCESS") {
    return Response.json({ error: data.error ?? "Payment failed" }, { status: 400 });
  }

  return Response.json(data.transactionResponse);
}
