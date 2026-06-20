import * as jose from "jose";
import { env } from "./env.js";

const ALG = "HS256";
const TOKEN_EXPIRY = "5m";

export type ReadTokenPayload = {
  bookId: number;
  userId: number;
};

const getSecret = () => new TextEncoder().encode(env.readTokenSecret);

export async function signReadToken(payload: ReadTokenPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyReadToken(token: string): Promise<ReadTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret(), { algorithms: [ALG] });
    if (!payload.bookId || !payload.userId) return null;
    return { bookId: payload.bookId as number, userId: payload.userId as number };
  } catch {
    return null;
  }
}