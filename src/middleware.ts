export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/create/:path*", "/history/:path*", "/playlist/:path*"],
}