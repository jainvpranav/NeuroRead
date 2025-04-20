import { NextRequest, NextResponse } from "next/server"
import { parse } from "cookie"

export async function middleware(req: NextRequest) {
  const cookies = req.cookies
  const userId = cookies.get("user_id")

  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/profile', '/settings'],
}
