import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = [
  "/",
  "/onboarding",
  "/api/auth",
  "/api/mock",
  "/api/cron",
  "/api/mcp",
  "/api/voice/generate",
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  if (isPublic) return NextResponse.next()
  if (!req.auth) {
    const url = req.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|placeholder|.*\\.(?:png|svg|jpg)$).*)"],
}
