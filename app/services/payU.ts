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
  const [month, year] = expiry.split("/");
  return `20${year}/${month}`;
}

export async function processPayment(payload: PayUPayload): Promise<PayUResponse> {
  const apiKey = import.meta.env.VITE_PAYU_API_KEY as string;
  const apiLogin = import.meta.env.VITE_PAYU_API_LOGIN as string;
  const merchantId = import.meta.env.VITE_PAYU_MERCHANT_ID as string;
  const accountId = import.meta.env.VITE_PAYU_ACCOUNT_ID as string;
  const baseUrl = import.meta.env.VITE_PAYU_BASE_URL as string;
  const isTest = import.meta.env.VITE_PAYU_TEST === "true";

  const referenceCode = `REF-${Date.now()}`;
  const currency = "PEN";
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
          TX_TAX: { value: 0, currency },
          TX_TAX_RETURN_BASE: { value: 0, currency },
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
      ipAddress: "127.0.0.1",
      cookie: "",
      userAgent: navigator.userAgent,
    },
    test: isTest,
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  let code: string;
  let state: string;
  let transactionId: string;
  let operationDate: string;
  let errorMsg: string;

  if (text.trimStart().startsWith("<")) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const get = (tag: string) => xml.getElementsByTagName(tag)[0]?.textContent ?? "";
    code = get("code");
    state = get("state");
    transactionId = get("transactionId");
    operationDate = get("operationDate");
    errorMsg = get("errorCode") || get("responseCode") || "Payment failed";
  } else {
    const data = JSON.parse(text) as {
      code: string;
      error?: string;
      transactionResponse?: { state: string; transactionId: string; operationDate: string };
    };
    code = data.code;
    state = data.transactionResponse?.state ?? "";
    transactionId = data.transactionResponse?.transactionId ?? "";
    operationDate = data.transactionResponse?.operationDate ?? "";
    errorMsg = data.error ?? "Payment failed";
  }

  if (code !== "SUCCESS") {
    throw new Error(errorMsg);
  }

  if (state !== "APPROVED") {
    if (isTest && errorMsg === "INACTIVE_PAYMENT_PROVIDER") {
      return {
        operationDate: new Date().toISOString(),
        transactionId: `test-${transactionId}`,
      };
    }
    throw new Error("Tarjeta declinada. Verifica los datos e intenta de nuevo.");
  }

  return { operationDate, transactionId };
}
