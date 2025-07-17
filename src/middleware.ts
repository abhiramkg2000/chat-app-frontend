import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;
  console.log("token", token, "key", JWT_SECRET);

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    console.log("Token success");
    return NextResponse.next();
  } catch (err) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    console.log("Token failed");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/chats"],
};
