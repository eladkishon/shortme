import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    logger.debug({ userId }, 'Fetching user URLs');

    const userUrls = await db.query.urls.findMany({
      where: eq(urls.userId, userId || ''),
      orderBy: (urls, { desc }) => [desc(urls.createdAt)],
    });

    logger.info({ userId, urlCount: userUrls.length }, 'Successfully fetched user URLs');

    return NextResponse.json({ urls: userUrls });
  } catch (error) {
    logger.error({ error }, 'Error fetching URLs');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 