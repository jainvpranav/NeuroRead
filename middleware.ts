import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const cookiesStore = await cookies();
  const user = cookiesStore.get("user");

  console.log(user);
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/settings", "/results/:path*", "/dashboard"]
};
