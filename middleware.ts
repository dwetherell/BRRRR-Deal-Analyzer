import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASS;

  if (!username || !password) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        const [user, pass] = decoded.split(":");
        if (user === username && pass === password) {
          return NextResponse.next();
        }
      } catch (_) {}
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};