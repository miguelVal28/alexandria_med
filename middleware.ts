import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Future subdomain split:
//   alexandria.com         -> patient app (route group `(patient)`, root `/`)
//   medics.alexandria.com  -> medic app   (route group `(medic)`, root `/medico`)
//
// When the subdomains go live, switch on `request.headers.get('host')` and
// rewrite the URL so `medics.*` requests internally hit `/medico/...` while
// the public URL stays clean. The route groups already isolate the two apps,
// so no component code needs to change.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the Supabase session cookie if expired. Per @supabase/ssr docs,
  // this must run on every request, not just protected ones.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};