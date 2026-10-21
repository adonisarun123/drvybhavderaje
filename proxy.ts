import { NextResponse, type NextRequest } from "next/server";

/**
 * Passes the requested admin path to server components so an unauthenticated
 * visitor can be returned to it after signing in. Authentication itself is
 * enforced in the admin layout, server actions and API routes — not here.
 */
export function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/admin/:path*"] };
