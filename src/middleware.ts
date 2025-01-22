import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./lib/rateLimit";
import logger from "./lib/logger";

const RATE_LIMIT_PATHS = ['/api/shorten']

// Clerk's auth middleware with public routes
export default async function middleware(request: NextRequest) {
  // Handle Clerk Authentication Middleware
  //@ts-ignore
  const response = authMiddleware({
    publicRoutes: ["/", "/:slug", "/api/shorten"]
  })(request);


  // Custom logic that runs after Clerk's authMiddleware
  if (RATE_LIMIT_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) {
      console.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded');
      return rateLimitResult;
    }
  }

  

  // Return the final response, either from Clerk's middleware or custom logic
  return response || NextResponse.next();
}

// Middleware configuration with the routes you want to match
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};