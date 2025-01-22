import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded');
      return rateLimitResult;
    }

    const { userId } = auth();
    
    if (!userId) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.debug({ userId }, 'Fetching user URLs');

    const userUrls = await db.query.urls.findMany({
      where: eq(urls.userId, userId),
      orderBy: (urls, { desc }) => [desc(urls.createdAt)],
    });

    logger.info({ userId, urlCount: userUrls.length }, 'Successfully fetched user URLs');

    return NextResponse.json({ urls: userUrls });
  } catch (error) {
    logger.error({ error }, 'Error fetching URLs');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 