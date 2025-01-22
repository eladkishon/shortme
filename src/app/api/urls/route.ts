import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userUrls = await db.query.urls.findMany({
      where: eq(urls.userId, userId),
      orderBy: (urls, { desc }) => [desc(urls.createdAt)],
    });

    return NextResponse.json({ urls: userUrls });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 