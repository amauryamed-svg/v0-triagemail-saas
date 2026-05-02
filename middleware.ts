import { NextResponse, type NextRequest } from "next/server"

/**
 * Demo-friendly middleware.
 *
 * Cuando GOOGLE_CLIENT_ID no está configurado (demo / hackathon path), no
 * forzamos auth — todas las rutas son públicas. Una vez que el OAuth esté
 * configurado en producción, esta función puede swapearse por la versión auth()
 * que estaba antes (commit history la conserva).
 */
export default function middleware(_req: NextRequest) {
  // En cuanto se configure GOOGLE_CLIENT_ID en prod, podemos reactivar la
  // protección de rutas. Por ahora, demo-mode siempre.
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|placeholder|.*\\.(?:png|svg|jpg)$).*)"],
}
