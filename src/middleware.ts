import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

console.log(matchers);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const path = req.nextUrl.pathname;

  // Allow access to sign-in page without redirection
  if (path === '/sign-in') {
    return NextResponse.next();
  }

  // If no session, redirect to sign-in
  if (!sessionClaims) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const role = (sessionClaims.metadata as { role?: string })?.role;

  // If no role is found, redirect to sign-in
  if (!role) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Check if user is already on their role-specific page
  if (path.startsWith(`/${role}`)) {
    return NextResponse.next();
  }

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
