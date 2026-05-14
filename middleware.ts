import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Placeholder for future subdomain split:
//   alexandria.com         -> patient app (route group `(patient)`, root `/`)
//   medics.alexandria.com  -> medic app   (route group `(medic)`, root `/medico`)
//
// When the subdomains go live, switch on `request.headers.get('host')` and
// rewrite the URL so `medics.*` requests internally hit `/medico/...` while
// the public URL stays clean. The route groups already isolate the two apps,
// so no component code needs to change.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};