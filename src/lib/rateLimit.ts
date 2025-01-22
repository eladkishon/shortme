import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(1, "5s"),
  analytics: true,
});

export async function rateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? "127.0.0.1";
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${ip}`
  );

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        limit,
        remaining: 0,
        reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  return null;
} 