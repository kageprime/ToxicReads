import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { LocalUser } from "../db/schema.js";
import * as cookie from "cookie";
import { Session } from "../contracts/constants.js";
import { verifyLocalSessionToken } from "./local-auth-session.js";
import { findLocalUserById } from "./queries/local-users.js";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: LocalUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    // Web: httpOnly cookie. Mobile (React Native): Bearer token, since
    // native fetch has no shared cookie jar. Same JWT, same revocation.
    const authHeader = opts.req.headers.get("authorization") || "";
    const bearer = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
    const token = bearer || cookies[Session.cookieName];
    if (token) {
      const claim = await verifyLocalSessionToken(token);
      if (claim) {
        const user = await findLocalUserById(claim.userId);
        if (user && user.tokenVersion === claim.tokenVersion) {
          ctx.user = user;
        }
      }
    }
  } catch {
    // Authentication is optional
  }

  return ctx;
}
