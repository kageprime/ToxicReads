import * as jose from "jose";
import { env } from "./lib/env.js";

const JWT_ALG = "HS256";

export type LocalSessionPayload = {
  username: string;
  userId: number;
  tokenVersion: number;
};

const getSecret = () => new TextEncoder().encode(env.appSecret);

export async function signLocalSessionToken(
  payload: LocalSessionPayload,
): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(getSecret());
}

export async function verifyLocalSessionToken(
  token: string,
): Promise<LocalSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, getSecret(), {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    if (!payload.username || !payload.userId) return null;
    return {
      username: payload.username as string,
      userId: payload.userId as number,
      tokenVersion: (payload.tokenVersion as number) ?? 0,
    };
  } catch {
    return null;
  }
}
