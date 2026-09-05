import { randomBytes } from "node:crypto";
import { env } from "./env.js";

const PAYSTACK_API = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return env.paystackSecretKey.length > 0;
}

function secret(): string {
  if (!paystackConfigured()) {
    throw new Error(
      "Card payments are not configured yet. Please try again later."
    );
  }
  return env.paystackSecretKey;
}

/** "1000" / "1000.00" naira → 100000 kobo. */
export function nairaToKobo(price: string): number {
  const naira = Number(price);
  if (!Number.isFinite(naira) || naira < 0) {
    throw new Error("This book has an invalid price.");
  }
  return Math.round(naira * 100);
}

export function newPaystackReference(prefix = "TR"): string {
  return `${prefix}_${Date.now()}_${randomBytes(8).toString("hex")}`;
}

interface PaystackInitData {
  authorizationUrl: string;
  reference: string;
}

interface PaystackInitResponse {
  status?: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    reference: string;
  };
}

export async function initPaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string | number>;
}): Promise<PaystackInitData> {
  const key = secret();
  let res: Response;
  try {
    res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        reference: input.reference,
        callback_url: input.callbackUrl,
        currency: "NGN",
        metadata: input.metadata,
      }),
    });
  } catch {
    throw new Error(
      "Could not reach the payment provider. Check your connection and try again."
    );
  }
  const json = (await res.json().catch(() => null)) as PaystackInitResponse | null;
  if (!res.ok || !json?.status || !json.data?.authorization_url) {
    throw new Error(
      json?.message || "Could not start checkout. Please try again."
    );
  }
  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
  };
}

interface PaystackVerifyData {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  paid: boolean;
  amountKobo: number;
  email: string;
  metadata: Record<string, unknown>;
}> {
  const key = secret();
  let res: Response;
  try {
    res = await fetch(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
  } catch {
    throw new Error(
      "Could not reach the payment provider. If you were charged, contact support with your reference."
    );
  }
  const json = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: PaystackVerifyData;
  } | null;
  if (!res.ok || !json?.status || !json.data) {
    throw new Error(
      json?.message ||
        "Could not verify this payment. If you were charged, contact support with your reference."
    );
  }
  const d = json.data;
  return {
    paid: d.status === "success",
    amountKobo: d.amount,
    email: d.customer?.email ?? "",
    metadata: d.metadata ?? {},
  };
}
