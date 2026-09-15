import { NextRequest, NextResponse } from "next/server";

// Constant-time comparison via SHA-256 digests. Hashing first means the
// comparison length never depends on the secret, and the Edge runtime
// doesn't expose crypto.timingSafeEqual.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASS;

  if (!username || !password) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        // Split on the first colon only — RFC 7617 allows colons in passwords
        const separator = decoded.indexOf(":");
        if (separator !== -1) {
          const user = decoded.slice(0, separator);
          const pass = decoded.slice(separator + 1);
          const [userOk, passOk] = await Promise.all([
            safeEqual(user, username),
            safeEqual(pass, password),
          ]);
          if (userOk && passOk) {
            return NextResponse.next();
          }
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
