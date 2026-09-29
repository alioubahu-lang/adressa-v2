import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessView, type Role } from "@/lib/permissions";

// Protège les modules spécifiques à un rôle : un Logistics_Partner ne doit pas
// pouvoir accéder au module fiscal municipal, et inversement.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (pathname.startsWith("/dashboard") && token?.role === "AGENT") {
    const isAgentDashboard = pathname === "/dashboard/terrain";
    const isNewAddress = pathname === "/dashboard/addresses/new";
    const isAddressEdit = /^\/dashboard\/addresses\/[^/]+\/edit$/.test(pathname);
    if (!isAgentDashboard && !isNewAddress && !isAddressEdit) {
      return NextResponse.redirect(new URL("/dashboard/terrain", req.url));
    }
  }

  const isFiscalRoute = pathname.startsWith("/dashboard/fiscal");
  const isLogisticsRoute = pathname.startsWith("/dashboard/logistics");

  if (!isFiscalRoute && !isLogisticsRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as Role | undefined;

  if (isFiscalRoute && !canAccessView(role, "municipal")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isLogisticsRoute && !canAccessView(role, "logistics")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
