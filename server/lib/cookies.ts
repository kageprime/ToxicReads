import * as cookie from "cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { Session } from "../../contracts/constants.js";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost,
  };
}

/**
 * Append a session cookie to the response. Pass an empty `token` with
 * `maxAge: 0` to clear it (logout).
 */
export function setSessionCookie(
  resHeaders: Headers,
  token: string,
  reqHeaders: Headers,
  opts?: { maxAge?: number }
): void {
  const o = getSessionCookieOptions(reqHeaders);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: o.httpOnly,
      path: o.path,
      sameSite: o.sameSite?.toLowerCase() as "lax" | "none",
      secure: o.secure,
      maxAge: opts?.maxAge ?? Session.maxAgeMs / 1000,
    })
  );
}
